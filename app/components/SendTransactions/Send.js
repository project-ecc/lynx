import $ from 'jquery';
import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import AddressBook from './AddressBook';
import wallet from '../../utils/wallet';
import { traduction } from '../../lang/lang';
import glob from 'glob';
import ErrorService from '../../services/error.service';

const event = require('../../utils/eventhandler');
const lang = traduction();

class Send extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eccAddress: '',
      amount: '',
      dialog: false,
      passPhrase: '',
      passPhraseError: '',
      utl: 0,
      encrypted: false,
    };

    this._handleGenericFormChange = this._handleGenericFormChange.bind(this);
    this._handleSendToAddress = this._handleSendToAddress.bind(this);
    this.friendClicked = this.friendClicked.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.cancelSend = this.cancelSend.bind(this);
    this.confirmSend = this.confirmSend.bind(this);
    this.onPassPhraseChange = this.onPassPhraseChange.bind(this);
  }

  componentDidMount(){
    this.checkIfWalletEncrypted();
  }

  checkIfWalletEncrypted() {
    const self = this;
    wallet.help().then((data) => {
      // console.log(data);
      if (data.indexOf('walletlock') > -1) {
        self.setState({ step: 3 });
      } else {
        self.setState({ step: 1 });
      }
    }).catch((err) => {
      ErrorService.handleWalletError(err, this.props.history);
    });
  }

  _handleGenericFormChange(event) {
    const name = event.target.name;
    const value = event.target.value;
    this.setState({
      [name]: value
    });
  }

  onPassPhraseChange(event) {
    this.setState({
      passPhrase: event.target.value
    });
  }

  _handleSendToAddress() {
    const self = this;
    if (this.state.eccAddress !== '') {
      wallet.validate(this.state.eccAddress).then((isAddressValid) => {
        if (!isAddressValid.isvalid) {
          event.emit('animate', lang.addressInvalidError);
        } else {
          if (this.state.amount > 0) {
            $('.loading').hide();
            $('.btn_confirm').removeClass('disable');
            self.setState({ dialog: true, passPhraseError: '', passPhrase: '' });
          } else {
            event.emit('animate', lang.amountLessOrEqualTo0);
          }
        }
      }).catch((err) => {
        console.log(err);
        event.emit('animate', lang.addressValidadeError);
      });
    } else {
      event.emit('animate', lang.invalidFields);
    }
  }

  friendClicked(friend) {
    this.setState({
      eccAddress: friend.address
    });
  }

  handleClear() {
    this.setState({ eccAddress: '', amount: '' });
  }

  cancelSend() {
    this.setState({
      dialog: false,
      passPhraseError: '',
      passPhrase: '',
      eccAddress: '',
      amount: ''
    });
    $('.loading').hide();
    $('.btn_confirm').removeClass('disable');
  }

  confirmSend() {
    const self = this;
    const passPhrase = this.state.passPhrase;

    if (self.state.encrypted && passPhrase.length > 0) {
      self.winfo();
    } else if (!self.state.encrypted) {
      self.wsend();
    } else {
      self.setState({
        passPhraseError: lang.invalidFields
      });
    }
  }

  winfo() {
    const self = this;
    wallet.getInfo().then((data) => {
      let utl = 0;
      if (data.unlocked_until !== null && data.unlocked_until !== 0) {
        utl = data.unlocked_until;
        let t2 = new Date(utl);
        if (t2.getFullYear() < 2000) {
          t2 = new Date(utl * 1000);
        }
        const t1 = new Date();
        const dif = t2.getTime() - t1.getTime();
        const secondsFromtT1toT2 = dif / 1000;
        const diffSeconds = Math.abs(secondsFromtT1toT2);
        utl = parseInt(diffSeconds);
        if (!utl) {
          utl = 0;
        }
      }
      self.setState({
        utl
      });
      self.wlock();
    }).catch((err) => {
      console.log(err);
      self.setState({
        dialog: false,
        eccAddress: '',
        amount: ''
      });
      event.emit('animate', lang.moneySendError);
    });
  }

  wlock() {
    let self = this;

    $('.loading').show();
    $('.btn_confirm').addClass('disable');

    wallet.walletlock().then((data) => {
      if (data === null) {
        self.wunlock(true, 5);
      } else {
        log.debug(data);
        self.setState({ dialog: false, eccAddress: '', amount: '' });
        event.emit('animate', lang.moneySendError);
      }
    }).catch((err) => {
      console.log(err);
      self.setState({ dialog: false, eccAddress: '', amount: '' });
      event.emit('animate', lang.moneySendError);
    });
  }

  wunlock(keepGoing, newSeconds){
    const self = this;
    const passPhrase = this.state.passPhrase;

    wallet.walletpassphrase(passPhrase, newSeconds).then((data) => {
      if (data !== null && data.code === -14) { // wrong password
        $('.loading').hide();
        $('.btn_confirm').removeClass('disable');
        self.setState({passPhraseError: lang.walletWrongPass});
      } else if (data !== null && data.code === 'ECONNREFUSED') { // connection refused
        event.emit('animate', lang.notificationWalletDownOrSyncing);
        self.setState({ dialog: false, eccAddress: '', amount: '' });
      } else if (data !== null && data.code === -17) { // already unlocked - auto locked - try again
        self.wunlock(false, newSeconds);
      } else if (data === null && keepGoing) { // success unlock continue to send
        self.wsend();
      } else if (data === null && !keepGoing) { // success unlock terminate
        self.setState({ dialog: false, eccAddress: '', amount: '' });
        event.emit('animate', lang.moneySent);
      } else if (!keepGoing) { // error
        log.debug(data);
        event.emit('animate', lang.moneySendError);
        self.setState({ dialog: false, eccAddress: '', amount: '' });
      }
    }).catch((err) => {
      console.log(err);
      if (!keepGoing) {
        self.setState({ dialog: false, eccAddress: '', amount: '' });
        event.emit('animate', lang.moneySendError);
      }
    });
  }

  wsend() {
    const self = this;

    wallet.sendMoney(self.state.eccAddress, self.state.amount).then((res, reject) => {
      if (self.state.utl !== 0) {
        setTimeout(() => {
          self.wunlock(false, self.state.utl);
        }, 3000);
      } else {
        self.setState({ dialog: false, eccAddress: '', amount: ''});
        event.emit('animate', lang.moneySent);
      }
    }).catch((err) => {
      self.setState({ dialog: false, eccAddress: '', amount: ''});
      event.emit('animate', ErrorService.getErrorFromCode(err.code));
    });
  }

  renderDialog(){
    if (!this.state.dialog) {
      return null;
    }
    let passStyle = { display: 'block' };
    if (!this.state.encrypted) {
      passStyle = { display: 'none' };
    }
    return (
      <div className="mancha">
        <div className="dialog">
          <div className="header">
            <p className="title">{lang.popupMessageConfirmationRequired}</p>
             <ReactLoading className="loading" type="bars" color="#444"/>
          </div>
          <div className="body">
            <p className="desc">{lang.popupMessageSendConfirmation1} <span className="desc2">{this.state.amount}</span> {lang.popupMessageSendConfirmation2} <span className="desc2">{this.state.eccAddress}</span> ?</p>
            <div className="row" style={passStyle}>
              <div className="col-md-10 col-md-offset-1 input-group">
                <input className="form-control inpuText" type="password" value={this.state.passPhrase} onChange={this.onPassPhraseChange} placeholder={lang.walletPassPhrase} />
              </div>
              <p className="passPhraseError">{this.state.passPhraseError}</p>
            </div>
          </div>
          <div className="footer">
            <p className="button btn_cancel" onClick={this.cancelSend}>{lang.cancel}</p>
            <p className="button btn_confirm" onClick={this.confirmSend}>{lang.confirm}</p>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="send">
        <div className="row">
          <div className="col-md-6">
            <p className="title">{lang.send}</p>
          </div>
          <div className="col-md-6">

          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="panel panel-default">
              <div className="panel-body">
                <div className="input-group">
                  <input type="text" className="inpuText form-control" name="eccAddress" placeholder={lang.sendNameAddress} onChange={this._handleGenericFormChange} value={this.state.eccAddress} />
                  <span className="input-group-btn" style={{ paddingRight: '0px' }}>
                    <button className="greenBtn btn btn-success btn-raised" type="button" onClick={this.handleClear}> {lang.sendClear} </button>
                  </span>
                </div>
                <div className="input-group" style={{ marginTop: '10px' }}>
                  <input type="number" className="inpuText form-control" name="amount" placeholder={lang.sendAmountToSend} onChange={this._handleGenericFormChange} value={this.state.amount} />
                  <span className="input-group-btn" style={{ paddingRight: '0px' }}>
                    <button className="greenBtn btn btn-success btn-raised" type="button" onClick={this._handleSendToAddress}> {lang.send} </button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <p className="title">{lang.addressBook}</p>
          </div>
          <div className="col-md-6">

          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="panel panel-default">
              <div className="panel-body">
                <AddressBook friendClicked={this.friendClicked} />
              </div>
            </div>
          </div>
        </div>

        {this.renderDialog()}
      </div>
    );
  }
}

export default Send;
