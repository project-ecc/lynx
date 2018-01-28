import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
import Wallet from '../../utils/wallet';

const remote = require('electron').remote;
const settings = require('electron-settings');

const app = remote.app;

const wallet = new Wallet();
const lang = traduction();

class SettingsMain extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dialog: false,
      disableInputs1: '',
      disableInputs2: '',
      optimal_tx_fee: false,
      tx_fee: '',
      reserve_amount: ''

    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.btnConfirm = this.btnConfirm.bind(this);
    this.btnCancel = this.btnCancel.bind(this);
    this.btnConfirmRestart = this.btnConfirmRestart.bind(this);
  }

  componentDidMount() {
    this.loadSettings();
    this.getWalletInfo();
  }

  getWalletInfo() {
    const self = this;

    wallet.getInfo().then((data) => {
      self.setState({ tx_fee: data.paytxfee });
    }).catch((err) => {
      if (err.message === 'connect ECONNREFUSED 127.0.0.1:19119') {
        event.emit('animate', 'Wallet not running.');
      } else if (!err.message === 'Loading block index...') {
        event.emit('animate', err.message);
      }
    });
  }

  loadSettings() {

    if (settings.has('settings.main')) {
      const ds = settings.get('settings.main');
      this.setState(ds);
      if (!ds.optimal_tx_fee) {
        this.setState({ disableInputs1: 'disable' });
      } else {
        this.setState({ disableInputs1: '' });
      }
    } else {
      const s = {
        optimal_tx_fee: false,
        reserve_amount: ''
      };
      if (s.optimal_tx_fee === true) {
        this.setState({ disableInputs1: '' });
      } else {
        this.setState({ disableInputs1: 'disable' });
      }
      settings.set('settings.main', s);
      this.setState(s);
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    if (name === 'optimal_tx_fee') {
      if (value === true) {
        this.setState({disableInputs1: ''});
      } else {
        this.setState({ disableInputs1: 'disable' });
      }
    } 

    this.setState({
      [name]: value
    });
  }

  btnConfirm() {
    const self = this;
    settings.set('settings.main', {
      optimal_tx_fee: self.state.optimal_tx_fee,
      tx_fee: self.state.tx_fee,
    });

    let txfee = 0;

    if (self.state.optimal_tx_fee) {
      txfee = self.state.tx_fee;
    }

    wallet.setTxFee(txfee).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
    });

    self.setState({
      dialog: true
    });

  }

  btnCancel() {
    this.loadSettings();
    this.getWalletInfo();
  }

  btnConfirmRestart() {
    app.relaunch();
    app.exit(0);
  }

  renderDialog() {
    if (!this.state.dialog) {
      return null;
    }
    return (
      <div className="mancha">
        <div className="dialog">
          <div className="header">
            <p className="title">{lang.restartRequiredTitle}</p>
          </div>
          <div className="body">
            <p className="desc">{lang.restartRequiredDesc}</p>
          </div>
          <div className="footer">
            <p className="button btn_confirm" onClick={this.btnConfirmRestart}>{lang.confirm}</p>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="row tab_wrapp">
        <div className="col-md-12 tab_body">
          <div className="panel panel-default">
            <div className="panel-body">
              <div className="row">
                <div className="col-md-12 rule">
                  <input className="radios" type="checkbox" name="optimal_tx_fee" checked={this.state.optimal_tx_fee} onChange={this.handleInputChange.bind(this)} />
                  <span className="desc">{lang.settingsMainOptionalTransactionFee}</span>
                  <div className="col-md-12 rule">
                    <span className="desc">{lang.transactionFee}</span>
                    <input className={`text_fields ${this.state.disableInputs1}`} type="number" name="tx_fee" placeholder="0.000000 ecc" value={this.state.tx_fee} onChange={this.handleInputChange.bind(this)} />
                  </div>
                </div>
              </div>
              <div className="buttons">
                <p className="greenButton left" onClick={this.btnConfirm.bind(this)}>{lang.confirm}</p>
                <p className="greenButton right" onClick={this.btnCancel.bind(this)}>{lang.cancel}</p>
              </div>
            </div>
          </div>
        </div>
        {this.renderDialog()}
      </div>
    );
  }
}

export default SettingsMain;
