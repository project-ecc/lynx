import { connect } from 'react-redux';

import WalletWrapper from '';

import {
  getBlockchainInfo,
  getInfo,
  setUnlockedUntil,
  getWalletInfo,
  getMiningInfo,
  evaluateStatus,
  isWalletInstalled,
  isImportingPrivateKey
} from '../actions/WalletAction';

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
    getMiningInfoDux: (data) => {
      dispatch(getMiningInfo(data));
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
