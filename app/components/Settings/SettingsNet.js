import React, { Component } from 'react';
import { traduction } from '../../lang/lang';

const remote = require('electron').remote;
const settings = require('electron-settings');

const app = remote.app;
const lang = traduction();

class SettingsNet extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dialog: false,
      disableInputs: '',
      socks5_proxy: false,
      proxy_ip: false,
      ip: '',
      port: 19119,
      ipv4: false,
      ipv6: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.btnConfirm = this.btnConfirm.bind(this);
    this.btnCancel = this.btnCancel.bind(this);
    this.btnConfirmRestart = this.btnConfirmRestart.bind(this);
  }

  componentDidMount() {
    this.loadSettings();
  }

  loadSettings() {
    if (settings.has('settings.net')) {
      const ds = settings.get('settings.net');
      this.setState(ds);
      if (!ds.proxy_ip) {
        this.setState({ disableInputs: 'disable' });
      } else {
        this.setState({ disableInputs: '' });
      }
    } else {
      const s = {
        socks5_proxy: false,
        proxy_ip: false,
        ip: '127.0.0.1',
        port: 19119,
        ipv4: false,
        ipv6: false,
      };
      settings.set('settings.net', s);
      this.setState(s);
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    if (name === 'ipv4' ) {
      this.setState({
        ipv6: false
      });
    } else if (name === 'ipv6') {
      this.setState({
        ipv4: false
      });
    } else if (name === 'proxy_ip') {
      if (value === true) {
        this.setState({ disableInputs: '' });
      } else {
        this.setState({ disableInputs: 'disable', ip: '127.0.0.1', port: 19119 });
      }
    }

    this.setState({
      [name]: value
    });
  }

  btnConfirm() {
    settings.set('settings.net', {
      socks5_proxy: this.state.socks5_proxy,
      proxy_ip: this.state.proxy_ip,
      ip: this.state.ip,
      port: this.state.port,
      ipv4: this.state.ipv4,
      ipv6: this.state.ipv6,
    });

    this.setState({
      dialog: true
    });
  }

  btnCancel(){
    this.loadSettings();
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
                <div className="col-md-12 rule disable">
                  <input className="radios" type="checkbox" name="socks5_proxy" checked={this.state.socks5_proxy} onChange={this.handleInputChange.bind(this)} />
                  <span className="desc">{lang.settingsNetworkConnectProxy}</span>
                </div>
                <div className="col-md-12 rule disable">
                  <input className="radios" type="checkbox" name="proxy_ip" checked={this.state.proxy_ip} onChange={this.handleInputChange.bind(this)} />
                  <span className="desc">{lang.settingsNetworkProxyIp}</span>
                  <input className={`text_fields ${this.state.disableInputs}`} type="text" name="ip" placeholder="127.0.0.1" value={this.state.ip} onChange={this.handleInputChange.bind(this)} />
                  <span className="desc">{lang.settingsNetworProxyPort}</span>
                  <input className={`text_fields ${this.state.disableInputs}`} type="text" name="port" placeholder="19119" value={this.state.port} onChange={this.handleInputChange.bind(this)} />
                  <div className="col-md-12 rule disable">
                    <span className="desc">{lang.settingsNetworReachPeersVia}</span>
                    <span className="desc" style={{marginRight:"10px"}}>IPv4</span>
                    <input className={`radios ${this.state.disableInputs}`} type="radio" name="ipv4" checked={this.state.ipv4} onChange={this.handleInputChange.bind(this)}/>
                    <span className="desc" style={{marginRight:"10px"}}>IPv6</span>
                    <input className={`radios ${this.state.disableInputs}`} type="radio" name="ipv6" checked={this.state.ipv6} onChange={this.handleInputChange.bind(this)}/>
                  </div>
                </div>
              </div>
              <div className="buttons">
                <p className="greenButton left disable" onClick={this.btnConfirm.bind(this)}>{lang.confirm}</p>
                <p className="greenButton right disable" onClick={this.btnCancel.bind(this)}>{lang.cancel}</p>
              </div>
            </div>
          </div>
        </div>
        {this.renderDialog()}
      </div>
    );
  }
}

export default SettingsNet;
