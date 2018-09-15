import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import BalanceBanner from '../components/BalanceBanner';

const mapStateToProps = state => {
  return {
    balance: state.wallet.balance,
    stake: state.wallet.stake,
    unconfirmed_balance: state.wallet.unconfirmed_balance,
  };
};

export default withRouter(connect(mapStateToProps)(BalanceBanner));

