import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { traduction } from '../lang/lang';
import { formatNumber } from '../services/wallet.service';

const config = require('../../config');
const lang = traduction();


class BalanceBanner extends Component {
  static propTypes = {
    balance: PropTypes.number,
    unconfirmed_balance: PropTypes.number,
    stake: PropTypes.number,
  };
  constructor(props) {
    super(props);
    this.state = {
      // balance: 0,
      // unconfirmed: 0,
      // stake: 0,
    };
    // this.getWalletInfo = this.getWalletInfo.bind(this);
  }

  componentDidMount() {
    // this.setTimerFunctions();
  }
  componentWillUnmount() {
    // clearInterval(this.timerInfo);
  }


  // setTimerFunctions() {
  //   const self = this;
  //   self.timerInfo = setInterval(() => {
  //     self.getWalletInfo();
  //   }, 5000);
  // }

  render() {
    return (
      <div className="balance-banner">
        <div className="panel panel-default">
          <div className="panel-body">
            <div className="balance-container text-center">
              <p className="subtitle">{lang.overviewMyBalance}</p>
              <p className="borderBot">
                <span className="desc-banner">{formatNumber(this.props.balance)}</span>
                <span className="desc2"> {config.coinTicker}</span>
              </p>
            </div>
            <div className="stake-container text-center">
              <p className="subtitle ">{lang.overviewMyStaking}</p>
              <p className="borderBot ">
                <span className="desc-banner">{formatNumber(this.props.stake)}</span>
                <span className="desc2"> {config.coinTicker}</span>
              </p>
            </div>
            <div className="unconfirmed-container text-center">
              <p className="subtitle">{lang.overviewMyUnconfirmed}</p>
              <p className="borderBot">
                <span className="desc-banner">{formatNumber(this.props.unconfirmed_balance)}</span>
                <span className="desc2"> {config.coinTicker}</span>
              </p>
            </div>
            <div className="total-container text-center">
              <p className="subtitle">{lang.overviewTotal}</p>
              <p className="borderBot">
                <span className="desc-banner">{formatNumber(this.props.stake + this.props.balance + this.props.unconfirmed_balance)}</span>
                <span className="desc2"> {config.coinTicker}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    balance: state.wallet.balance,
    stake: state.wallet.stake,
    unconfirmed_balance: state.wallet.unconfirmed_balance,
  };
};

export default withRouter(connect(mapStateToProps)(BalanceBanner));
