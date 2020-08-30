import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { traduction } from '../lang/lang';

const config = require('../../config');

const lang = traduction();

class BalanceBanner extends Component {
  static propTypes = {
    balance: PropTypes.number,
    unconfirmed_balance: PropTypes.number,
    stake: PropTypes.number,
  };

  render() {
    return (
      <div className="balance-banner">
        <div className="panel panel-default">
          <div className="panel-body">
            <div className="balance-container text-center">
              <p className="subtitle">{lang.overviewMyBalance}</p>
              <p className="borderBot">
                <span className="desc-banner">{this.props.balance}</span>
                <span className="desc2"> {config.coinTicker}</span>
              </p>
            </div>
            <div className="stake-container text-center">
              <p className="subtitle ">{lang.overviewMyStaking}</p>
              <p className="borderBot ">
                <span className="desc-banner">{this.props.stake}</span>
                <span className="desc2"> {config.coinTicker}</span>
              </p>
            </div>
            <div className="unconfirmed-container text-center">
              <p className="subtitle">{lang.overviewMyUnconfirmed}</p>
              <p className="borderBot">
                <span className="desc-banner">{this.props.unconfirmed_balance}</span>
                <span className="desc2"> {config.coinTicker}</span>
              </p>
            </div>
            <div className="total-container text-center">
              <p className="subtitle">{lang.overviewTotal}</p>
              <p className="borderBot">
                <span className="desc-banner">{Number(this.props.stake) + Number(this.props.balance) + Number(this.props.unconfirmed_balance)}</span>
                <span className="desc2"> {config.coinTicker}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BalanceBanner;
