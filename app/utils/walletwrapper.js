import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import glob from 'glob';
import fs from 'fs';
import {getErrorFromCode} from '../services/error.service';
import { getPlatformWalletUri, grabWalletDir } from '../services/platform.service';
import {
  getBlockchainInfo,
  getInfo,
  setUnlockedUntil,
  getWalletInfo,
  evaluateStatus,
  isWalletInstalled,
  isImportingPrivateKey
} from '../reducers/WalletReducer';
import wallet from './wallet';

const event = require('../utils/eventhandler');
import { traduction } from '../lang/lang';
const lang = traduction();

class WalletWrapper extends Component {
  static propTypes = {
    getBlockchainInfoDux: PropTypes.func,
    getInfoDux: PropTypes.func,
    setUnlockedUntilDux: PropTypes.func,
    getWalletInfoDux: PropTypes.func,
    evaluateStatusDux: PropTypes.func,
    isWalletInstalledDux: PropTypes.func,
    IsImportingKeyDux: PropTypes.func,
    walletInstalled: PropTypes.bool,
    off: PropTypes.bool,
    starting: PropTypes.bool,
    running: PropTypes.bool,
    stopping: PropTypes.bool,
    importingKey: PropTypes.bool
  };
  constructor(props) {
    super(props);
    // this.getStateValues = this.getStateValues.bind(this);
    this.evaluateStatus = this.evaluateStatus.bind(this);
    this.updateWalletStatus = this.updateWalletStatus.bind(this);
    this.getInfo = this.getInfo.bind(this);
    this.getBlockchainInfo = this.getBlockchainInfo.bind(this);
    this.getWalletInfo = this.getWalletInfo.bind(this);
    this.startStopWalletHandler = this.startStopWalletHandler.bind(this);
    this.startWallet = this.startWallet.bind(this);
    this.stopWallet = this.stopWallet.bind(this);
    this.formatVersion = this.formatVersion.bind(this);
    this.updateWalletFromRedux = this.updateWalletFromRedux.bind(this);
  }

  componentDidMount() {
    this.updateWalletStatus();
    this.timerUpdate = setInterval(() => {
      this.updateWalletStatus();
    }, 3000);
  }

  componentWillUnmount() {
    clearInterval(this.timerUpdate);
  }

  // getStateValues() {
  //   const results = {};
  //   for (let i = 0; i < arguments.length; i += 1) {
  //     if (this.state[arguments[i]] !== undefined) {
  //       results[arguments[i]] = this.state[arguments[i]];
  //     }
  //   }
  //   return results;
  // }

  processError(err) {
    const { evaluateStatusDux } = this.props;
    if (err.message.includes('connect ECONNREFUSED 127.0.0.1:19119')) {
      evaluateStatusDux({
        starting: false,
        running: false,
        stopping: false,
        off: true,
      });
    } else if (err.code === -28) {
      event.emit('show', getErrorFromCode(err.code, err.message));
      evaluateStatusDux({
        starting: true,
        running: false,
        stopping: false,
        off: false,
      });
    } else if(err.code === 500) {
      console.log(err)
    } else if(err.message.includes('500 Internal Server Error') ) {
      console.log(err);
    } else if(err.message.includes('socket hang up') || err.message.includes('ESOCKETTIMEDOUT')) {
      event.emit('show', lang.socketDisconnect);
    } else {
      event.emit('show', getErrorFromCode(err.code, err.message));
    }
  }

  getBlockchainInfo() {
    const { getBlockchainInfoDux } = this.props;
    wallet.getBlockchainInfo().then(data => {
      getBlockchainInfoDux({
        chain: data.chain,
        bestblockhash: data.bestblockhash
      });
    }).catch((err) => {
      this.processError(err);
    });
  }

  getInfo() {
    const { getInfoDux, setUnlockedUntilDux } = this.props;
    wallet.getInfo().then((data) => {
      getInfoDux({
        versionformatted: this.formatVersion(data.version),
        version: data.version,
        protocolversion: data.protocolversion,
        walletversion: data.walletversion,
        balance: data.balance,
        newmint: data.newmint,
        stake: data.stake,
        blocks: data.blocks,
        headers: data.headers,
        connections: data.connections,
        difficulty: data.difficulty,
        encrypted: data.encrypted,
        staking: data.staking,
      });
      if (data.encrypted) {
        setUnlockedUntilDux({
          unlocked_until: data.unlocked_until,
        });
      }
      this.updateWalletFromRedux(this.formatVersion(data.version))
        .then((data) => {
          console.log(data)
        }).catch((err) => {
        console.log(err)
      });
    }).catch((err) => {
      console.log(err)
      this.processError(err);
    });
  }

  updateWalletFromRedux (reduxVersion) {
    let self = this;
    return new Promise((resolve, reject) => {
      fs.readFile(`${grabWalletDir()}wallet-version.txt`, 'utf8', (err, data) => {
        if (err) { reject(err); } else {
          const version = data.split(' ')[1];
          if(version !== reduxVersion){
            let toWrite = `Version ${reduxVersion}`;
            fs.writeFile(`${grabWalletDir()}wallet-version.txt`, toWrite, 'utf8', (err) => {
              if(!err)
                resolve(true);
              else resolve(false);
            });
          }
        }
      });
    });
  }

  formatVersion(unformattedVersion){
    let version = String(unformattedVersion).split('');
    let formattedString = "";
    while (true){
      let sb = ["."];
      while(sb.length < 3 && version.length > 0){
        sb.push(version.pop());
      }
      if(sb.length > 1){
        let tempSB = "";
        for(var i = sb.length-1; i > 0; i--){
            tempSB = tempSB + String(sb[i]);
        }
        tempSB = String(parseInt(tempSB));
        tempSB = String(sb[0]) + tempSB;
        formattedString = String(tempSB) + formattedString;
      }
      //console.log(formattedString);
      if(formattedString.match(/\./g).length < 4 && version.length === 0){
        formattedString = String("0") + String(formattedString);
        break;
      }
      if(formattedString.match(/\./g).length >= 4 && version.length === 0){
        formattedString = formattedString.substr(1);
        break;
      }
    }
    //console.log(formattedString)
    return formattedString;
  }

  getWalletInfo() {
    const { getWalletInfoDux } = this.props;
    wallet.getWalletInfo().then((data) => {
      getWalletInfoDux({
        unconfirmed_balance: data.unconfirmed_balance,
        immature_balance: data.immature_balance,
      });
    }).catch((err) => {
      this.processError(err);
    });
  }

  evaluateStatus() {
    const { evaluateStatusDux } = this.props;
    // check to see if it is running if it is running
    if (this.props.walletInstalled) {
      wallet.getInfo().then((data) => {
        evaluateStatusDux({
          starting: false,
          running: true,
          stopping: false,
          off: false,
        });
      }).catch((err) => {
        this.processError(err); // if its not running, this will set the state
      });
    } else {
      // no wallet is installed so it must be off
      evaluateStatusDux({
        starting: false,
        running: false,
        stopping: false,
        off: true,
      });
    }
  }

  updateWalletStatus() {
    const { isWalletInstalledDux } = this.props;
    if (this.props.off) {
      event.emit('hide');
      // check to see if the wallet is downloaded
      glob(`${getPlatformWalletUri()}`, (err, files) => {
        if (!files.length) {
          isWalletInstalledDux({
            walletInstalled: false,
          });
        } else if (files.length) {
          isWalletInstalledDux({
            walletInstalled: true,
          });
        } else {
          console.log(err);
          event.emit('show', err.message);
        }
      });
      // check to see if it is running if it is running
      this.evaluateStatus();
    } else if (this.props.starting) {
      //event.emit('show', 'The wallet is starting, this may take a few minutes');
      this.evaluateStatus();
    } else if (this.props.running) {
      event.emit('hide');
      this.getBlockchainInfo();
      this.getInfo();
      this.getWalletInfo();
    } else if (this.props.stopping) {
      event.emit('show', lang.walletStopping);
      this.evaluateStatus();
    }
  }

  startStopWalletHandler() {
    // we can only start the wallet if it is currently off
    if (this.props.off || !this.props.running) {
      this.startWallet();
      // we can only stop the wallet if it is running
    } else if (this.props.running) {
      this.stopWallet();
    } else {
      console.log(this.props)
      event.emit('animate', lang.walletBusyState);
    }
  }

  startWallet() {
    const { evaluateStatusDux } = this.props;
    wallet.walletstart((result) => {
      if (result) {
        evaluateStatusDux({
          starting: true,
          running: false,
          stopping: false,
          off: true,
        });
        event.emit('show', lang.startingWallet);
      } else {
        evaluateStatusDux({
          starting: false,
          running: false,
          stopping: false,
          off: true,
        });
        if (this.props.walletInstalled === false) {
          event.emit('show', lang.missingWalletDaemon);
        }
      }
    });
  }

  stopWallet() {
    const { evaluateStatusDux } = this.props;

    event.emit('animate', lang.stoppingWallet);
    wallet.walletstop().then((data) => {
      console.log(data)
      evaluateStatusDux({
        starting: false,
        running: false,
        stopping: true,
        off: false,
      });
    })
      .catch(err => {
        this.processError(err);
      });
  }

  render() {
    const { children } = this.props;

    const childrenWithProps = React.Children.map(children, child => {
      return React.cloneElement(child, {
        startStopWalletHandler: this.startStopWalletHandler,
      });
    });

    return <div>{childrenWithProps}</div>;
  }
}

const mapStateToProps = state => {
  return {
    off: state.wallet.off,
    running: state.wallet.running,
    starting: state.wallet.starting,
    stopping: state.wallet.stopping,
    walletInstalled: state.wallet.walletInstalled,
    importingKey: state.wallet.importingKey
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getBlockchainInfoDux: (data) => {
      dispatch(getBlockchainInfo(data));
    },
    IsImportingKeyDux: (data) => {
      dispatch(isImportingPrivateKey(data));
    },
    getInfoDux: (data) => {
      dispatch(getInfo(data));
    },
    getWalletInfoDux: (data) => {
      dispatch(getWalletInfo(data));
    },
    setUnlockedUntilDux: (data) => {
      dispatch(setUnlockedUntil(data));
    },
    evaluateStatusDux: (data) => {
      dispatch(evaluateStatus(data));
    },
    isWalletInstalledDux: (data) => {
      dispatch(isWalletInstalled(data));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletWrapper);
