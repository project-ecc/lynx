import glob from 'glob';
import fs from 'fs';
import wallet from '../utils/wallet';
import { getErrorFromCode } from '../services/error.service';
import { getPlatformWalletUri, getPlatformFileName, getPlatformName, grabWalletDir } from '../services/platform.service';
import { traduction } from '../lang/lang';
const semver = require('semver')

const event = require('../utils/eventhandler');

const walletUri = getPlatformWalletUri();

export const GET_BLOCKCHAIN_INFO = 'GET_BLOCKCHAIN_INFO';
export const GET_INFO = 'GET_INFO';
export const WALLET_VERSION = 'WALLET_VERSION';
export const GET_WALLET_INFO = 'GET_WALLET_INFO';
export const GET_MINING_INFO = 'GET_MINING_INFO';
export const SET_UNLOCKED_UNTIL = 'SET_UNLOCKED_UNTIL';
export const EVALUATE_STATUS = 'EVALUATE_STATUS';
export const IS_WALLET_INSTALLED = 'IS_WALLET_INSTALLED';
export const IS_INSTALLING_PRIVATE_KEY = 'IS_INSTALLING_PRIVATE_KEY';
export const lang = traduction();

export const getBlockchainInfo = () => (dispatch) => {
  wallet.getBlockchainInfo().then(data => {
    dispatch({
      type: GET_BLOCKCHAIN_INFO,
      payload: {
        chain: data.chain,
        bestblockhash: data.bestblockhash
      },
    });
  }).catch((err) => {
    dispatch(processError(err));
  });
};

export const getInfoGet = data => ({
  type: GET_INFO,
  payload: {
    version: data.version,
    protocolversion: data.protocolversion,
    walletversion: data.walletversion,
    balance: data.balance,
    newmint: data.newmint,
    stake: data.stake,
    blocks: data.blocks,
    headers: data.headers,
    moneysupply: data.moneysupply,
    connections: data.connections,
    difficulty: data.difficulty,
    encrypted: data.encrypted,
    mining: data.mining,
    staking: data.staking,
    paytxfee: data.paytxfee,
    relayfee: data.relayfee,
  }
});

export const setWalletVersion = () => (dispatch) => {
  wallet.getWalletVersion().then((data) => {
    const version = semver.valid(semver.coerce(data));
    dispatch({
      type: WALLET_VERSION,
      payload: {
        versionformatted: version,
      }
    })
  });
}

export const getInfo = () => (dispatch) => {
  wallet.getInfo().then(data => {
    const eccoinVer = formatVersion(data.version);
    const version = semver.valid(semver.coerce(eccoinVer));
    dispatch({
      type: GET_INFO,
      payload: {
        versionformatted: version,
        version: data.version,
        protocolversion: data.protocolversion,
        walletversion: data.walletversion,
        balance: data.balance,
        newmint: data.newmint,
        stake: data.stake,
        blocks: data.blocks,
        headers: data.headers,
        moneysupply: data.moneysupply,
        connections: data.connections,
        difficulty: data.difficulty,
        encrypted: data.encrypted,
        staking: data.staking,
        paytxfee: data.paytxfee,
        relayfee: data.relayfee,
      }
    });
    if (data.encrypted) {
      dispatch(setUnlockedUntil({
        unlocked_until: data.unlocked_until,
      }));
    }
  }).catch((err) => {
    dispatch(processError(err));
  });
};

export const getWalletInfo = () => (dispatch) => {
  wallet.getWalletInfo().then(data => {
    dispatch({
      type: GET_WALLET_INFO,
      payload: {
        unconfirmed_balance: data.unconfirmed_balance,
        immature_balance: data.immature_balance,
      },
    });
  }).catch((err) => {
    dispatch(processError(err));
  });
};
export const getMiningInfo = () => (dispatch) => {
  wallet.getMiningInfo().then(data => {
    dispatch({
      type: GET_MINING_INFO,
      payload: {
        generate: data.generate,
        generatepos: data.generatepos,
      },
    });
  }).catch((err) => {
    dispatch(processError(err));
  });
};

export const setUnlockedUntil = data => ({
  type: SET_UNLOCKED_UNTIL,
  payload: {
    unlocked_until: data.unlocked_until,
  },
});

export const evaluateStatus = data => ({
  type: EVALUATE_STATUS,
  payload: {
    starting: data.starting,
    running: data.running,
    stopping: data.stopping,
    off: data.off,
  }
});

export const isWalletInstalled = data => ({
  type: IS_WALLET_INSTALLED,
  payload: {
    walletInstalled: data,
  }
});

export const isImportingPrivateKey = data => ({
  type: IS_INSTALLING_PRIVATE_KEY,
  payload: {
    importingKey: data.importingKey,
  }
});

export const startStopWalletHandler = () => (dispatch, getstate) =>
{
    const state = getstate().wallet;
    if (state.off)
    {
        dispatch(startWallet(state));
    }
    else if (state.running)
    {
        dispatch(stopWallet());
    }
    else
    {
        console.log(state);
        event.emit('animate', lang.walletBusyState);
    }
};

export const stakingStatusHandler = () => (dispatch) => {
  dispatch(getMiningInfo());
};

const startWallet = (state) => (dispatch) =>
{
    dispatch(evaluateStatus({
        starting: true,
        running: false,
        stopping: false,
        off: false,
    }));
    wallet.walletstart().then((result) =>
    {
        console.log(result);
        if (result)
        {
            event.emit('show', lang.startingWallet);
        }
        else
        {
            console.log(result);
            dispatch(evaluateStatus({
                starting: false,
                running: false,
                stopping: false,
                off: true,
            }));
            glob(walletUri, (err, files) =>
            {
                if (!files.length)
                {
                    dispatch(isWalletInstalled(false));
                }
                else if (files.length)
                {
                    dispatch(isWalletInstalled(true));
                }
                else
                {
                    console.log(err);
                    event.emit('show', err.message);
                }
            });
            if (state.walletInstalled === false)
            {
                event.emit('show', lang.missingWalletDaemon);
            }
        }
    });
};

const stopWallet = () => (dispatch) => {
  wallet.walletstop().then((data) => {
    console.log(data);
    event.emit('animate', data);
    dispatch(evaluateStatus({
      starting: false,
      running: false,
      stopping: true,
      off: false,
    }));
  }).catch(err => {
    console.log(err)
    dispatch(processError(err));
  });
};

const formatVersion = (unformattedVersion) => {
  const version = String(unformattedVersion).split('');
  let formattedString = '';
  let i = 0;
  while (true) {
    const sb = ['.'];
    while (sb.length < 3 && version.length > 0) {
      sb.push(version.pop());
    }
    if (sb.length > 1) {
      let tempSB = '';
      for (i = sb.length - 1; i > 0; i--) {
        tempSB += String(sb[i]);
      }
      tempSB = String(parseInt(tempSB, 10));
      tempSB = String(sb[0]) + tempSB;
      formattedString = String(tempSB) + formattedString;
    }
    if (formattedString.match(/\./g).length < 4 && version.length === 0) {
      formattedString = String('0') + String(formattedString);
      break;
    }
    if (formattedString.match(/\./g).length >= 4 && version.length === 0) {
      formattedString = formattedString.substr(1);
      break;
    }
  }
  return formattedString;
};


const processError = (err) => (dispatch, getstate) =>
{
    const state = getstate().wallet;
    // TODO: on windows the ECCONREFUSED message happens both when loading the wallet
    // and when it cannot be found. add some logic to determine based on our state if
    // we should be dispatching a state of starting or a state of off.
    if (err.code === -28)
    {
        event.emit('show', getErrorFromCode(err.code, err.message));
        dispatch(evaluateStatus({
            starting: true,
            running: false,
            stopping: false,
            off: false,
        }));
    }
    else if (err.message.includes('connect ECONNREFUSED 127.0.0.1:19119'))
    {
      // console.log(err);
      if(!state.starting) {
        dispatch(evaluateStatus({
            starting: false,
            running: false,
            stopping: false,
            off: true,
        }));
      }

    }
    else if (err.code === 500)
    {
        console.log(err);
    }
    else if (err.message.includes('500 Internal Server Error'))
    {
        console.log(err);
    }
    else if (err.message.includes('socket hang up') || err.message.includes('ESOCKETTIMEDOUT'))
    {
        event.emit('show', lang.socketDisconnect);
    }
    else
    {
        event.emit('show', getErrorFromCode(err.code, err.message));
    }
};

export const updateWalletStatus = () => (dispatch, getstate) =>
{
    const state = getstate().wallet;

    if (state.walletInstalled == false)
    {
        glob(walletUri, (err, files) =>
        {
            if (!files.length)
            {
                dispatch(isWalletInstalled(false));
            }
            else if (files.length)
            {
                dispatch(isWalletInstalled(true));
            }
            else
            {
                console.log(err);
                event.emit('show', err.message);
            }
        });
    }
    else if (state.starting)
    {
        wallet.getInfo().then((data) =>
        {
            dispatch(evaluateStatus({
                starting: false,
                running: true,
                stopping: false,
                off: false,
            }));
        }).catch((err) =>
        {
          console.log(err)
            dispatch(processError(err));
        });
    }
    else if (state.running)
    {
        event.emit('hide');
        dispatch(getBlockchainInfo());
        dispatch(getInfo());
        dispatch(getWalletInfo());
        dispatch(getMiningInfo());
    }
    else if (state.stopping)
    {
        event.emit('show', lang.walletStopping);
        if (state.walletInstalled)
        {
            wallet.getInfo().then((data) =>
            {
                dispatch(evaluateStatus({
                    starting: false,
                    running: true,
                    stopping: false,
                    off: false,
                }));
            }).catch((err) =>
            {
                dispatch(processError(err));
            });
        }
    }
    else if (state.off)
    {
        dispatch(evaluateStatus({
            starting: false,
            running: false,
            stopping: false,
            off: true,
        }));

        //sanity check to see if its running in the background already.
        if(wallet.client != null) {
          // check if running
          wallet.getInfo().then((data) =>
          {
              dispatch(evaluateStatus({
                  starting: false,
                  running: true,
                  stopping: false,
                  off: false,
              }));
          }).catch((err) =>
          {
            // console.log(err)
              dispatch(processError(err));
          });
          dispatch(setWalletVersion());
          //check wallet version

        }
    }


};
