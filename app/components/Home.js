import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import TransactionTable from './Transactions/TransactionTable';
import { traduction } from '../lang/lang';

import { getErrorFromCode } from '../services/error.service';
import WalletService from '../services/wallet.service'

const event = require('../utils/eventhandler');

const lang = traduction();

const lockedPad = require('../../resources/images/padclose.png');
const unlockedPad = require('../../resources/images/padopen.png');

class Home extends Component {
  static propTypes = {
    unlocked_until: PropTypes.number,
  };
  constructor(props) {
    super(props);
    this.state = {
      select: 'all',
      dialog: false,
      timeL: '',
      passPhrase: '',
      stakeUnlock: false
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ select: event.target.value });
  }

  render() {
    return (
      <div className="home">
        <div className="row">
          <div className="col-md-12 ">
            <div className="panel panel-default transaction-container">
              <div className="panel-body">
                <div>
                  <p className="title">{lang.overviewMyWallet}</p>
                </div>
                <p className="title">{lang.overviewMyLatest100Transactions}</p>
                <div className="selectfield">
                  <select
                    className="form-control"
                    value={this.state.select}
                    onChange={this.handleChange}
                  >
                    <option value="all">{lang.all}</option>
                    <option value="send">{lang.send}</option>
                    <option value="receive">{lang.received}</option>
                    <option value="generate">{lang.staked}</option>
                    <option value={0}>{lang.pending}</option>
                    <option value={1}>{lang.confirmed}</option>
                    <option value={-1}>{lang.orphaned}</option>
                  </select>
                </div>
                <TransactionTable h={'250px'} option={this.state.select} countTras={100} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    unlocked_until: state.wallet.unlocked_until,
  };
};

export default withRouter(connect(mapStateToProps)(Home));
