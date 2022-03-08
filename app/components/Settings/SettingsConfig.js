import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { traduction } from '../../lang/lang';
import { getConfUri } from '../../services/platform.service';
import WalletService from '../../services/wallet.service';
import fs from 'fs';
import fsPath from 'fs-path';
import os from 'os';

const lang = traduction();

const event = require('../../utils/eventhandler');

class SettingsConfig extends Component {

  static propTypes = {
    startStopWalletHandler: PropTypes.func,
    walletInstalled: PropTypes.bool,
    off: PropTypes.bool,
    starting: PropTypes.bool,
    running: PropTypes.bool,
    stopping: PropTypes.bool,
    importingKey: PropTypes.bool
  };
  constructor(props) {
    super(props);

    this.state = {
      dns: false,
      storage: false,
      encrypted: false,
      messaging: false,
      requesting1: false,
      requesting2: false,
      username: '',
      password: ''
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.updateOrCreateConfig = this.updateOrCreateConfig.bind(this);
    this.readRpcCredentials = this.readRpcCredentials.bind(this);
    this.save = this.save.bind(this);
    this.renderSaveButton = this.renderSaveButton.bind(this);
  }

  componentDidMount() {
    this.readRpcCredentials().then((data) => {
      this.setState({
        username: data.username,
        password: data.password
      });
    })
    .catch((err) => {
      console.log(err);
      event.emit('animate', 'conf file not loaded');
    });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  updateOrCreateConfig(username, password){
    return new Promise((resolve, reject) => {
      fs.exists(getConfUri(), (exists) => {
        if(!exists){
          //create
          const toWrite = "rpcuser=" + username + os.EOL + "rpcpassword=" + password + os.EOL + "rpcport=19119" + os.EOL + "rpcconnect=127.0.0.1" + os.EOL;
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

  save(){
    this.updateOrCreateConfig(this.state.username, this.state.password).then((boolResult) => {
      if(boolResult){
        WalletService.loadclient().then((loaded) => {
          if (loaded) {
            event.emit('animate', lang.savedRPC);
          }
        }).catch((err)=> {
          console.log(err)
        });

      }
    })
    .catch((err) => {
      event.emit('animate', err);
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

  renderSaveButton (){
    if(!this.props.running){
      return (
        <div className="row">
          <div className="col-md-12">
            <div style={{ position: 'absolute', right: '25px' }}>
              <p className="greenButton right" onClick={this.save}>Save</p>
            </div>
          </div>
        </div>
      );
    }
  }

  render() {
    return (
      <div className="row tab_wrapp">
        <div className="col-md-12 tab_body">
          <div className="panel panel-default">
            <div className="panel-body">
              <p className="title">Configuration</p>
              <div className="row">
                <div className="col-md-12">
                  <p className="title">RPC configuration (Stop wallet to make changes)</p>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="input-group full-width" style={{width:'100%'}}>
                        <input type="text" className={`inpuText form-control`} name="username" placeholder="Username"
                               value={this.state.username} disabled={this.props.running} onChange={this.handleInputChange.bind(this)}/>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="input-group" style={{width:'100%'}}>
                        <input type="text" className={`inpuText form-control`} name="password" placeholder="Password" disabled={this.props.running} value={this.state.password} onChange={this.handleInputChange.bind(this)}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {this.renderSaveButton()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    off: state.wallet.off,
    running: state.wallet.running,
    starting: state.wallet.starting,
    stopping: state.wallet.stopping,
    walletInstalled: state.wallet.walletInstalled,
    importingKey: state.wallet.importingKey
  };
};

export default connect(mapStateToProps)(SettingsConfig);
