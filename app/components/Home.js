import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import TransactionTable from './Transactions/TransactionTable';
import { walletwrapper } from '../utils/walletwrapper';
import { traduction } from '../lang/lang';

import WalletService from '../services/wallet.service';

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
    };
    // this.infoUpdate = this.infoUpdate.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.showWalletUnlockDialog = this.showWalletUnlockDialog.bind(this);
    this.cancelDialog = this.cancelDialog.bind(this);
    this.confirmDialog = this.confirmDialog.bind(this);
    this.onPassPhraseChange = this.onPassPhraseChange.bind(this);
    this.onTimeLChange = this.onTimeLChange.bind(this);
  }

  handleChange(event) {
    this.setState({ select: event.target.value });
  }

  onPassPhraseChange(event) {
    this.setState({ passPhrase: event.target.value });
  }

  onTimeLChange(event) {
    this.setState({ timeL: event.target.value });
  }

  showWalletUnlockDialog() {
    this.setState(() => {
      return { dialog: true };
    });
  }

  componentDidMount() {
    // this.infoUpdate();
    // const self = this;
    // self.timerInfo = setInterval(() => {
    //   self.infoUpdate();
    // }, 5000);

  }
  componentWillUnmount() {
    // clearInterval(this.timerInfo);
  }

  // infoUpdate() {
  //   console.log(this.props);
  //   const results = this.props.getStateValues('unlocked_until');
  //   const newState = {};
  //   for (let key in results) {
  //     newState[key] = results[key];
  //   }
  //   this.setState(newState);
  // }

  renderDialogBody() {
    if (this.props.unlocked_until === 0) {
      return (
        <div>
          <div className="header">
            <p className="title">{lang.overviewModalAuthTitle}</p>
          </div>
          <div className="body">
            <p className="desc">{lang.ovweviewModalAuthDesc}</p>
            <div className="row">
              <div className="col-md-10 col-md-offset-1 input-group">
                <input className="form-control inpuText" type="password" value={this.state.passPhrase} onChange={this.onPassPhraseChange} placeholder={lang.walletPassPhrase} />
              </div>
              <div className="col-md-10 col-md-offset-1 input-group" style={{ marginTop: '15px' }}>
                <input className="form-control inpuText" type="number" value={this.state.timeL} onChange={this.onTimeLChange} placeholder={lang.secondsUnlocked} />
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <div className="header">
            <p className="title">{lang.popupMessageConfirmationRequired}</p>
          </div>
          <div className="body">
            <p className="desc">{lang.ovweviewModalLockQuestion}</p>
          </div>
        </div>
      );
    }
  }

  renderDialog() {
    if (!this.state.dialog) {
      return null;
    } else {
      return (
        <div className="mancha">
          <div className="dialog">
            {this.renderDialogBody()}
            <div className="footer">
              <p className="button btn_cancel" onClick={this.cancelDialog}>{lang.cancel}</p>
              <p className="button btn_confirm" onClick={this.confirmDialog}>{lang.confirm}</p>
            </div>
          </div>
        </div>
      );
    }
  }

  cancelDialog() {
    this.setState({ dialog: false, passPhrase: '', timeL: '' });
  }

  confirmDialog() {
    const self = this;
    if (this.props.unlocked_until === 0) {
      const passPhrase = this.state.passPhrase;
      let timeL = this.state.timeL;
      if (timeL === 0) {
        timeL = 300000;
      }
      WalletService.unlockWallet(passPhrase, timeL, false).then((data) => {
        if (data === null) {
          event.emit('animate', `${lang.walletUnlockedFor} ${timeL} ${lang.seconds}`);
        }
        self.setState({ dialog: false, passPhrase: '', timeL: '' });
      }).catch((err) => {
        self.setState({ dialog: false, passPhrase: '', timeL: '' });
      });
    } else {
      WalletService.lockWallet().then((data) => {
        if (data === null) {
          event.emit('animate', lang.walletLocked);
        } else {
          event.emit('animate', lang.walletLockedError);
        }
      }).catch((err) => {
        console.log(err);
        event.emit('animate', lang.walletLockedError);
      });
      self.setState({ dialog: false, passPhrase: '', timeL: '' })
    }
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
                  {
                    this.props.unlocked_until === 0
                      ? <img className="padicon" alt="wallet locked" src={lockedPad} onClick={this.showWalletUnlockDialog} />
                      : <img className="padicon" alt="wallet unlocked" src={unlockedPad} onClick={this.showWalletUnlockDialog} />
                  }
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
        {this.renderDialog()}
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
