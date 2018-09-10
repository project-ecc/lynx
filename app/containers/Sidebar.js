import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import Sidebar from '../components/Sidebar';
import { startStopWalletHandler, updateWalletStatus } from '../actions/WalletAction';

const mapDispatchToProps = dispatch => {
  return {
    startStopWalletHandler: () => dispatch(startStopWalletHandler()),
    updateWalletStatus: () => dispatch(updateWalletStatus()),
  };
};

const mapStateToProps = state => {
  return {
    starting: state.wallet.starting,
    running: state.wallet.running,
    stopping: state.wallet.stopping,
    off: state.wallet.off,
    blocks: state.wallet.blocks,
    headers: state.wallet.headers,
    connections: state.wallet.connections,
    walletInstalled: state.wallet.walletInstalled,
    versionformatted: state.wallet.versionformatted,
    unlocked_until: state.wallet.unlocked_until
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sidebar));
