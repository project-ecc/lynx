import React, { Component } from 'react';
import { traduction } from '../../lang/lang';
import wallet from '../../utils/wallet';
import event from '../../utils/eventhandler';
import {getConfUri} from "../../services/platform.service";
import fs from 'fs';
import fsPath from 'fs-path';

const remote = require('electron').remote;
const settings = require('electron-settings');


const app = remote.app;

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
      reserve_amount: '',
      custom_rpc_credentials: false,
      random_credentials: false,
      username: '',
      password: ''

    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.btnConfirm = this.btnConfirm.bind(this);
    this.btnCancel = this.btnCancel.bind(this);
    this.btnConfirmRestart = this.btnConfirmRestart.bind(this);
    this.updateOrCreateConfig = this.updateOrCreateConfig.bind(this);
    this.readRpcCredentials = this.readRpcCredentials.bind(this);
    this.resetCredsToDefault = this.resetCredsToDefault.bind(this);
  }

  componentDidMount() {
    this.readRpcCredentials().then((data)=> {
      this.setState({
        username: data.username,
        password: data.password
      });
    })
    .catch((err) => {
      event.emit('animate', 'conf file not loaded')
    });

    this.loadSettings();
    this.getWalletInfo();
  }


  updateOrCreateConfig(username, password){
    return new Promise((resolve, reject) => {
      fs.exists(getConfUri(), (exists) => {
        if(!exists){
          //create
          const toWrite = "maxconnections=100" + os.EOL + "rpcuser=" + username + os.EOL + "rpcpassword=" + password + os.EOL + "addnode=www.cryptounited.io" + os.EOL + "rpcport=19119" + os.EOL + "rpcconnect=127.0.0.1" + os.EOL + "staking=0" + os.EOL + "zapwallettxes=0";
          fsPath.writeFile(getConfUri(), toWrite, 'utf8', (err) => {
            if (err) {
              console.log(err)
              resolve(false);
              return;
            }
            resolve(true);
          });
        }
        else{
          fs.readFile(getConfUri(), 'utf8', (err, data) => {
            if (err) {
              console.log("readFile error: ", err);
              resolve(false);
              return;
            }
            var patt = /(rpcuser=(.*))/g
            var myArray = patt.exec(data);
            var result = data;;
            if(myArray && myArray.length > 2)
            {
              result = result.replace('rpcuser='+myArray[2], 'rpcuser='+username);
            }
            else{
              result += `${os.EOL}rpcuser=${username}`;
            }

            patt = /(rpcpassword=(.*))/g
            myArray = patt.exec(data);
            if(myArray && myArray.length > 2)
            {
              result = result.replace('rpcpassword='+myArray[2], 'rpcpassword='+password);
            }
            else{
              result += `${os.EOL}rpcpassword=${password}`;
            }

            fs.writeFile(getConfUri(), result, 'utf8', (err) => {
              if(!err)
                resolve(true);
              else resolve(false);
            });
          });
        }
      });
    });
  }

  readRpcCredentials () {
    let toReturn = null;
    return new Promise((resolve, reject) => {
      fs.exists(getConfUri(), (exists) => {
        if(!exists){
          resolve(toReturn);
          return;
        }
        fs.readFile(getConfUri(), 'utf8', (err, data) => {
          if (err) {
            console.log("readFile error: ", err);
            resolve(toReturn);
            return;
          }
          toReturn = {
            username: "",
            password: ""
          };
          let patt = /(rpcuser=(.*))/g
          let myArray = patt.exec(data);
          if(myArray && myArray.length > 2)
          {
            toReturn.username = myArray[2];
          }

          patt = /(rpcpassword=(.*))/g
          myArray = patt.exec(data);
          if(myArray && myArray.length > 2)
          {
            toReturn.password = myArray[2];
          }
          console.log(toReturn);
          resolve(toReturn);
        });
      })
    });
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
      console.log(ds)
      this.setState(ds);
      if (!ds.optimal_tx_fee) {
        this.setState({ disableInputs1: 'disable' });
      } else {
        this.setState({ disableInputs1: '' });
      }
      if (!ds.custom_rpc_credentials) {
        this.setState({ disableInputs2: 'disable' });
      } else {
        this.setState({ disableInputs2: '' });
      }
    } else {
      const s = {
        optimal_tx_fee: false,
        custom_rpc_credentials: false,
        reserve_amount: ''
      };
      if (s.optimal_tx_fee === true) {
        this.setState({ disableInputs1: '' });
      } else {
        this.setState({ disableInputs1: 'disable' });
      }
      if (s.custom_rpc_credentials === true) {
        this.setState({ disableInputs2: '' });
      } else {
        this.setState({ disableInputs2: 'disable' });
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
        this.setState({ disableInputs1: '' });
      } else {
        this.setState({ disableInputs1: 'disable' });
      }
    } else if (name === 'custom_rpc_credentials') {
      if (value === true) {
        this.setState({ disableInputs2: '' });
      } else {
        this.setState({ disableInputs2: 'disable' });
        this.resetCredsToDefault();
      }
    }

    this.setState({
      [name]: value
    });
  }

  btnConfirm() {
    const self = this;
    let validationError = false;
    settings.set('settings.main', {
      optimal_tx_fee: self.state.optimal_tx_fee,
      tx_fee: self.state.tx_fee,
      custom_rpc_credentials: self.state.custom_rpc_credentials
    });

    let txfee = 0;

    if (self.state.optimal_tx_fee) {
      txfee = self.state.tx_fee;
    }

    if(this.state.optimal_tx_fee) {
      wallet.setTxFee(txfee).then((response) => {
        console.log(response);
      }).catch((err) => {
        console.log(err);
        event.emit('animate', err.message);
        validationError = true;
      });
    }

    let username = this.state.username;
    let password = this.state.password;

    if(!this.state.custom_rpc_credentials) {
      username = 'yourusername';
      password = 'yourpassword';
    }

    this.updateOrCreateConfig(username, password).then((boolResult) => {
      console.log(boolResult)
    })
      .catch((err) => {
        event.emit('animate', err);
        validationError = true
      });

    if(!validationError) {
      self.setState({
        dialog: true
      });
    }

  }

  btnCancel() {
    this.loadSettings();
    this.getWalletInfo();
  }

  btnConfirmRestart() {
    app.relaunch();
    app.exit(0);
  }

  resetCredsToDefault() {
    this.setState({
      username: 'yourusername',
      password: 'yourpassword'
    });
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
                  <p className="title">{lang.transactionFee}</p>
                  <input className="radios" type="checkbox" name="optimal_tx_fee" checked={this.state.optimal_tx_fee} onChange={this.handleInputChange.bind(this)} />
                  <span className="desc">{lang.settingsMainOptionalTransactionFee}</span>
                  <div className="row">
                    <div className="col-md-3 rule">
                      <input className={`inpuText form-control ${this.state.disableInputs1}`} type="number" name="tx_fee" placeholder="0.000000 ecc" value={this.state.tx_fee} onChange={this.handleInputChange.bind(this)} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <p className="title">RPC configuration</p>
                  <div className="row">
                    <div className="col-md-12">
                      <input className="radios" type="checkbox" name="custom_rpc_credentials" checked={this.state.custom_rpc_credentials} onChange={this.handleInputChange.bind(this)} />
                      <span className="desc">{lang.customRpcCredentials}</span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="input-group full-width" style={{width:'100%'}}>
                        <input type="text" className={`inpuText form-control ${this.state.disableInputs2}`} name="username" placeholder="Username"
                               value={this.state.username} onChange={this.handleInputChange.bind(this)}/>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="input-group" style={{width:'100%'}}>
                        <input type="text" className={`inpuText form-control ${this.state.disableInputs2}`} name="password" placeholder="Password" value={this.state.password} onChange={this.handleInputChange.bind(this)}/>
                      </div>
                    </div>
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
