import React, { Component } from 'react';
import wallet from '../../utils/wallet';
import { traduction } from '../../lang/lang';
import { getConfUri, getDebugUri } from '../../services/platform.service';

import $ from 'jquery';

const event = require('../../utils/eventhandler');
const appVersion = require('../../../package.json').version;
const remote = require('electron').remote;
const config = require('../../../config');

const shell = remote.shell;
const app = remote.app;

const lang = traduction();

class SettingsDebug extends Component {

  constructor(props) {
    super(props);
    this.state = {
      command_input: '',
      consoleOpen: false,
      commandList: [],
      responseList: [],
      navigation: 0,
      ctrlKeyDown: false,
      lKeyDown: false,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.onenter = this.onenter.bind(this);
  }

  componentDidMount() {
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    let n = this.state.navigation;
    if (value.length === 0) {
      n = this.state.commandList.length;
    }

    this.setState({
      [name]: value,
      navigation: n
    });
  }

  openDebugFile() {
    console.log(getDebugUri());
    shell.openItem(getDebugUri());
  }

  openConfigFile() {
    console.log(getConfUri());
    shell.openItem(getConfUri());
  }

  renderHelpMsg() {
    if (this.state.commandList.length === 0) {
      const time = (((new Date()).toTimeString()).split(' '))[0];
      return (
        <div>
          <div className="hours_list col-md-1">
            <p>{time}</p>
          </div>
          <div className="commands_list col-md-11">
            <p>{lang.console1}</p>
            <p>{lang.console2} <span className="text_green">{lang.console3}</span> {lang.console4}</p>
            <p>{lang.console5} <span className="text_green">{lang.console6}</span> {lang.console7}</p>
          </div>
        </div>
      );
    }
    return null;
  }

  switchLayout() {
    this.setState({ consoleOpen: !this.state.consoleOpen });
  }

  onenter() {
    this.handleNewCommand();
    $('#console').animate({
      scrollTop: $('#console')[0].scrollHeight - $('#console')[0].clientHeight
    }, 1000);
  }

  handleKeyUp(event) {
    if (event.keyCode === 17) { // CTRL
      this.setState({
        ctrlKeyDown: false
      });
    } else if (event.keyCode === 76) { // L
      this.setState({
        lKeyDown: false
      });
    }
  }

  handleKeyDown(event) {

    if (event.keyCode === 38){ // arrow up
      if (this.state.commandList[this.state.navigation-1] !== undefined){
        this.setState({
          command_input: this.state.commandList[this.state.navigation-1].desc,
          navigation: this.state.navigation-1
        });
      }
    } else if (event.keyCode === 40){ // arrow down
      if (this.state.commandList[this.state.navigation+1] !== undefined) {
        this.setState({
          command_input: this.state.commandList[this.state.navigation+1].desc,
          navigation: this.state.navigation+1
        });
      }
    } else if (event.keyCode === 13) { // enter
      this.handleNewCommand();
    } else if (event.keyCode === 17) { // CTRL
      if (this.state.lKeyDown) {
        this.setState({
          navigation: 0,
          commandList: []
        });
      } else {
        this.setState({
          ctrlKeyDown: true
        });
      }
    } else if (event.keyCode === 76) { // L
      if (this.state.ctrlKeyDown) {
        this.setState({
          navigation: 0,
          commandList: []
        });
      } else {
        this.setState({
          lKeyDown: true
        });
      }
    }
  }

  handleNewCommand() {

    if (this.state.command_input !== '')
    {
      const currentList = this.state.commandList;
      const time = (((new Date()).toTimeString()).split(' '))[0];
      try {
        const input = this.state.command_input;
        this.setState({ command_input: '' });

        let preCommandParsed = input.split(' ');
        console.log(preCommandParsed);
        let stringStart = false;
        let startIndex = 0;
        let commandParsed = [];
        for (let index = 0; index < preCommandParsed.length; index++)
        {
            let current = preCommandParsed[index];
            console.log(current)
            if (stringStart == false && (current[0] === "'" || current[0] === '"'))
            {
                stringStart = true;
                startIndex = index;
            }
            if (stringStart == true && (current[current.length - 1] === "'" || current[current.length - 1 ] === '"'))
            {
                stringStart = false;
                if (startIndex != index)
                {
                    let newIndex = "";
                    let firstIndex = true;
                    for (let partial = startIndex; partial <= index; partial++)
                    {
                        if (firstIndex)
                        {
                            newIndex = newIndex + String(preCommandParsed[partial])
                            firstIndex = false;
                        }
                        else
                        {
                            newIndex = newIndex + " " + String(preCommandParsed[partial])
                        }
                    }
                    commandParsed.push(newIndex);
                    startIndex = index;
                    continue;
                }
                else
                {
                    commandParsed.push(current);
                    startIndex = index;
                }
            }
            else if (stringStart == false)
            {
                commandParsed.push(current);
            }
        }
        console.log(commandParsed);
        const method = commandParsed[0];
        const parameters = [];

        for (let i = 1; i < commandParsed.length; i++)
        {
          let p = commandParsed[i];
          if (p[0] === '"' || p[0] === "'")
          {
              p = p.substr(1, p.length);
          }
          if (p[p.length - 1] === '"' || p[p.length - 1] === "'")
          {
              p = p.substr(0, p.length - 1);
          }
          if (!isNaN(p)) // is number
          {
            if (p % 1 === 0) // integer
            {
              p = parseInt(p);
            }
            else // float
            {
              p = parseFloat(p);
            }
          }
          parameters.push(p);
        }
        console.log(parameters);

        wallet.command([{ method, parameters }]).then((response) => {
          currentList.push({
            time,
            desc: input,
            res: response
          });

          this.setState({ commandList: currentList, navigation: currentList.length });

          $('#console').animate({
            scrollTop: $('#console')[0].scrollHeight - $('#console')[0].clientHeight
          }, 100);
        }).catch((error) => {
          currentList.push({
            time,
            desc: 'An error occured processing command'
          });
          this.setState({ commandList: currentList });
        });
      } catch (err) {
        currentList.push({
          time,
          desc: 'Invalid command'
        });
        this.setState({ commandList: currentList });
      }
      console.log(this.state.commandList);
    }
  }

  renderBody() {
    if (!this.state.consoleOpen) {
      return (
        <div>
          <div className="col-md-12">
            <p className="subtitle">Debug Console</p>
            <div className="row">
              <div className="col-md-4">
                <button className="orangeButton btn btn-raised" onClick={this.switchLayout.bind(this)}>{lang.console}</button>
              </div>
            </div>
          </div>
          <div className="col-md-12">
            <p className="subtitle">{lang.settingsDebugLogFile}</p>
            <div className="row">
              <div className="col-md-4">
                <button className="orangeButton btn btn-raised" onClick={this.openDebugFile}>{lang.settingsDebugOpen}</button>
              </div>
            </div>
          </div>
          <div className="col-md-12">
            <p className="subtitle">{lang.settingsDebugConfigurationFile}</p>
            <div className="row">
              <div className="col-md-4">
                <button className="orangeButton btn btn-raised" onClick={this.openConfigFile}>{lang.settingsDebugOpen}</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className='col'> 
        <div className='row'>
          <div className='col-12'>
          <button className="orangeButton btn btn-raised" onClick={this.switchLayout.bind(this)}>{lang.backupBack}</button>
          </div>
        </div>
        <div className="col-md-12 col-sm-12 col-xs-12 col-lg-12">
          
        <div className="row console_body">
          <div id="console" className="col-md-12 console_wrapper">
            {this.renderHelpMsg()}
            {this.state.commandList.map((cmd, index) => {
              let res = cmd.res;
              if (res instanceof Object && cmd.desc !== 'help') {
                if (res.length > 0 && res[0] !== undefined) {
                  res = JSON.stringify(res[0], null, 2);
                } else {
                  res = JSON.stringify(res, null, 2);
                }
                return (
                  <div key={`command_key_${index}`}>
                    <div className="hours_list col-md-1">
                      <p>{cmd.time}</p>
                    </div>
                    <div id="commands-list" className="commands_list col-md-11">
                      <p><span style={{ fontWeight: '400' }}>{cmd.desc}</span>: <span style={{ fontWeight: '300', fontSize: '0.9em' }}>{res}</span></p>
                    </div>
                  </div>
                );
              } else if (cmd.desc === 'help') {
                let res = cmd.res.toString();
                res = res.split('\n');

                return (
                  <div key={`command_key_${index}`}>
                    <div className="hours_list col-md-1">
                      <p>{cmd.time}</p>
                    </div>
                    <div className="commands_list col-md-11">
                      <p><span style={{ fontWeight: '400' }}>{cmd.desc}</span>:</p>
                      {res.map((el, index) => {
                        return (
                          <p key={`help_command_${index}`}>
                            <span style={{ fontWeight: '300', fontSize: '0.9em' }}>
                              {el}
                            </span>
                          </p>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
        <div className="row console_body">
            <div className="col-md-10" style={{ padding: '0px' }}>
              <input style={{maxHeight: '39px'}} className="command_input" type="text" name="command_input" value={this.state.command_input} onChange={this.handleInputChange.bind(this)} onKeyDown={this.handleKeyDown} onKeyUp={this.handleKeyUp} />
            </div>
            <div className="col-md-2" style={{ paddingLeft: '5px', paddingRight: '18px', width: '100%' }}>
              <button className="orangeButton btn btn-raised" onClick={this.onenter.bind(this)}>Enter</button>
            </div>
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
                {this.renderBody()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SettingsDebug;
