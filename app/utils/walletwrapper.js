import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import glob from 'glob';
import {
  getBlockchainInfo,
  getInfo,
  setUnlockedUntil,
  getWalletInfo,
  evaluateStatus,
  isWalletInstalled
} from '../reducers/WalletReducer';
import Wallet from './wallet';

const wallet = new Wallet();
const event = require('../utils/eventhandler');
const homedir = require('os').homedir();

class WalletWrapper extends Component {
  static propTypes = {
    getBlockchainInfoDux: PropTypes.func,
    getInfoDux: PropTypes.func,
    setUnlockedUntilDux: PropTypes.func,
    getWalletInfoDux: PropTypes.func,
    evaluateStatusDux: PropTypes.func,
    isWalletInstalledDux: PropTypes.func,
    walletInstalled: PropTypes.bool,
    off: PropTypes.bool,
    starting: PropTypes.bool,
    running: PropTypes.bool,
    stopping: PropTypes.bool,
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
    console.log(err);
    if (err.message === 'connect ECONNREFUSED 127.0.0.1:19119') {
      evaluateStatusDux({
        starting: false,
        running: false,
        stopping: false,
        off: true,
      });
    } else if (err.message.includes('Loading block index')) {
      evaluateStatusDux({
        starting: true,
        running: false,
        stopping: false,
        off: false,
      });
    } else {
      event.emit('animate', err.message);
    }
  }

  getBlockchainInfo() {
    const { getBlockchainInfoDux } = this.props;
    wallet.getBlockchainInfo().then(data => {
      getBlockchainInfoDux({
        chain: data.chain,
        bestblockhash: data.bestblockhash
      });
      return;
    }).catch((err) => {
      this.processError(err);
    });
  }

  getInfo() {
    const { getInfoDux, setUnlockedUntilDux } = this.props;
    wallet.getInfo().then((data) => {
      getInfoDux({
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
      return;
    }).catch((err) => {
      this.processError(err);
    });
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
      glob(`${homedir}/.eccoin-wallet/Eccoind*`, (err, files) => {
        if (!files.length) {
          isWalletInstalledDux({
            walletInstalled: false,
          });
        } else if (files.length) {
          isWalletInstalledDux({
            walletInstalled: true,
          });
        } else {
          event.emit('show', err.message);
        }
      });
      // check to see if it is running if it is running
      this.evaluateStatus();
    } else if (this.props.starting) {
      event.emit('show', 'The wallet is starting, this may take a few minutes');
      this.evaluateStatus();
    } else if (this.props.running) {
      event.emit('hide');
      this.getBlockchainInfo();
      this.getInfo();
      this.getWalletInfo();
    } else if (this.props.stopping) {
      event.emit('show', 'The wallet is saving data and stopping');
      this.evaluateStatus();
    }
  }

  startStopWalletHandler() {
    // we can only start the wallet if it is currently off
    if (this.props.off) {
      this.startWallet();
      // we can only stop the wallet if it is running
    } else if (this.props.running) {
      this.stopWallet();
    } else {
      event.emit('animate', 'wallet is either starting or stopping, please wait for it to finish before trying to turn it off or on again');
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
        event.emit('show', 'Starting wallet...');
      } else {
        evaluateStatusDux({
          starting: false,
          running: false,
          stopping: false,
          off: true,
        });
        if (this.props.walletInstalled === false) {
          event.emit('show', 'Could not start wallet. Is it in the correct directory?');
        }
      }
    });
  }

  stopWallet() {
    const { evaluateStatusDux } = this.props;
    if (process.platform.indexOf('win') > -1) {
      event.emit('animate', 'Stopping wallet...');
    }
    wallet.walletstop().then(() => {
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
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getBlockchainInfoDux: (data) => {
      dispatch(getBlockchainInfo(data));
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
