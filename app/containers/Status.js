import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import StatusPage from '../components/Status/Status';
import { getInfoGet, stakingStatusHandler } from '../actions/WalletAction';

const mapStateToProps = state => {
  return {
    version: state.wallet.versionformatted,
    subversion: state.wallet.subversion,
    paytxfee: state.wallet.paytxfee,
    relayfee: state.wallet.relayfee,
    blocks: state.wallet.blocks,
    headers: state.wallet.headers,
    bestblockhash: state.wallet.bestblockhash,
    difficulty: state.wallet.difficulty,
    moneysupply: state.wallet.moneysupply,
    staking: state.wallet.staking,
    encrypted: state.wallet.encrypted
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getInfoGet: () => dispatch(getInfoGet()),
    stakingStatusHandler: () => dispatch(stakingStatusHandler()),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StatusPage));
