import React, { Component } from 'react';
import { traduction } from '../../lang/lang';

const settings = require('electron-settings');

const remote = require('electron').remote;
const exec = require('child_process').exec;

const app = remote.app;
const lang = traduction();

class SettingsDisplay extends Component {

  constructor(props) {
    super(props);
    this.state = {
      select: 'en',
      dialog: false,
      tray_icon: false,
      minimise_to_tray: false,
      minimise_on_close: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.btnConfirm = this.btnConfirm.bind(this);
    this.btnCancel = this.btnCancel.bind(this);
    this.btnConfirmRestart = this.btnConfirmRestart.bind(this);
  }

  componentDidMount(){
    this.loadSettings();
  }

  loadSettings(){

    if (settings.has('settings.display')) {
      const ds = settings.get('settings.display');
      this.setState(ds);
    } else {
      const s = {
        tray_icon: false,
        minimise_to_tray: false,
        minimise_on_close: false
      };
      settings.set('settings.display', s);
      this.setState(s);
    }

    if (settings.has('settings.lang')) {
      this.setState({
        select: settings.get('settings.lang')
      });
    } else {
      settings.set('settings.lang', 'en');
      this.setState({
        select: 'en'
      });
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });

    if (name === 'tray_icon' && value === true) {
      this.setState({
        minimise_to_tray: false
      });
    } else if (name === 'minimise_to_tray' && value === true && this.state.tray_icon) {
      this.setState({
        minimise_to_tray: false
      });
    }
  }

  handleChange(event) {
    this.setState({ select: event.target.value });
  }

  btnCancel() {
    this.loadSettings();
  }

  btnConfirm(){
    settings.set('settings.display', {
      tray_icon: this.state.tray_icon,
      minimise_to_tray: this.state.minimise_to_tray,
      minimise_on_close: this.state.minimise_on_close
    });
    settings.set('settings.lang', this.state.select);

    this.setState({
      dialog: true
    });
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
                  <input className="radios" type="checkbox" name="tray_icon" checked={this.state.tray_icon} onChange={this.handleInputChange.bind(this)} />
                  <span className="desc">{lang.settingsDisplayHideTrayIcon}</span>
                </div>
                <div className="col-md-12 rule">
                  <input className="radios" type="checkbox" name="minimise_to_tray" checked={this.state.minimise_to_tray} onChange={this.handleInputChange.bind(this)} />
                  <span className="desc">{lang.settingsDisplayMinimizeToTray}</span>
                </div>
                <div className="col-md-12 rule">
                  <input className="radios" type="checkbox" name="minimise_on_close" checked={this.state.minimise_on_close} onChange={this.handleInputChange.bind(this)} />
                  <span className="desc">{lang.settingsDisplayMinimizeOnClose}</span>
                </div>
                <div className="col-md-12 rule" style={{ paddingLeft: '0px' }}>
                  <div className="col-md-12">
                    <p><span className="desc">{lang.language}</span></p>
                  </div>
                  <div className="col-md-4">
                    <div className="selectfield">
                      <select className="form-control" value={this.state.select} onChange={this.handleChange}>
                        <option value="bg">български (Bulgarian)</option>
                        <option value="zh_cn">简体中文—中国 (Chinese - CN)</option>
                        <option value="zh_hk">繁體中文-中華人民共和國香港特別行政區 (Chinese - HK)</option>
                        <option value="nl">Nederlands (Dutch)</option>
							          <option value="en">English</option>
                        <option value="fr">Français (French)</option>
                        <option value="de">Deutsch (German)</option>
                        <option value="el">ελληνικά (Greek)</option>
                        <option value="ko">한국어(Korean)</option>
                        <option value="pl">Polski (Polish)</option>
                        <option value="pt">Português (Portuguese)</option>
                        <option value="ru">Русский язык (Russian)</option>
                        <option value="sl">Slovenčina (Slovenian)</option>
                        <option value="es">Español (Spanish)</option>
                        <option value="tr">Türkçe (Turkish)</option>
                        <option value="vn">Tiếng việt (Vietnamese)</option>
                      </select>
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

export default SettingsDisplay;
