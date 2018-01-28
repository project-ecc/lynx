import React, { Component } from 'react';
import fs from 'fs';
import Wallet from '../../utils/wallet';
const homedir = require('os').homedir();

const event = require('../../utils/eventhandler');

const wallet = new Wallet();

export default class Config extends Component {
  constructor(props) {
    super(props);

    this.state = {
      staking: false,
      dns: false,
      storage: false,
      encrypted: false,
      messaging: false,
      requesting1: false,
      requesting2: false,
    };

    this.toggleStaking = this.toggleStaking.bind(this);
  }

  componentDidMount() {
    this.getConfigInfo();
  }

  getConfigInfo() {
    if (process.platform === 'linux') {
      fs.readFile(`${homedir}/.eccoin/eccoin.conf`, 'utf8', (err, data) => {
        if (err) {
          return console.log(err);
        }

        if (/staking=[0-9]/g.test(data)) {
          if (/staking=1/g.test(data)) {
            this.setState({ staking: true });
          } else {
            this.setState({ staking: false });
          }
        } else {
          this.setState({ staking: false });
          fs.appendFile(`${homedir}/.eccoin/eccoin.conf`, 'staking=0', 'utf8', (err) => {
            if (err) {
              console.log(err);
            }
          });
        }
      });
    } else if (process.platform.indexOf('win') > -1) {
      if (fs.existsSync('C:/ProgramData/ECC/ecc.conf')) {
        fs.readFile('C:/ProgramData/ECC/ecc.conf', 'utf8', (err, data) => {
          if (err) {
            return console.log(err);
          }

          if (/staking=[0-9]/g.test(data)) {
            if (/staking=1/g.test(data)) {
              this.setState({ staking: true });
            } else {
              this.setState({ staking: false });
            }
          } else {
            this.setState({ staking: false });
            fs.appendFile('C:/ProgramData/ECC/ecc.conf', 'staking=0', 'utf8', (err) => {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      } else if (process.platform === 'darwin') {
        fs.readFile(`${homedir}/Library/Application Support/eccoin/eccoin.conf`, 'utf8', (err, data) => {
          if (err) {
            return console.log(err);
          }

          if (/staking=[0-9]/g.test(data)) {
            if (/staking=1/g.test(data)) {
              this.setState({ staking: true });
            } else {
              this.setState({ staking: false });
            }
          } else {
            this.setState({ staking: false });
            fs.appendFile(`${homedir}/Library/Application Support/eccoin/eccoin.conf`, 'staking=0', 'utf8', (err) => {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      } else if (fs.existsSync(`${homedir}/appdata/roaming/eccoin/eccoin.conf`)) {
        fs.readFile(`${homedir}/appdata/roaming/eccoin/eccoin.conf`, 'utf8', (err, data) => {
          if (err) {
            return console.log(err);
          }

          if (/staking=[0-9]/g.test(data)) {
            if (/staking=1/g.test(data)) {
              this.setState({ staking: true });
            } else {
              this.setState({ staking: false });
            }
          } else {
            this.setState({ staking: false });
            fs.appendFile(`${homedir}/appdata/roaming/eccoin/eccoin.conf`, 'staking=0', 'utf8', (err) => {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      }
    }
  }

  toggleStaking(event) {
    event.persist();
    if (process.platform === 'linux') {
      fs.readFile(`${homedir}/.eccoin/eccoin.conf`, 'utf8', (err, data) => {
        if (err) {
          console.log(err);
        }

        const result = data.replace(/staking=[0-9]/g, `staking=${event.target.value}`);

        fs.writeFile(`${homedir}/.eccoin/eccoin.conf`, result, 'utf8', (err) => {
          if (err) {
            console.log(err);
          }
          this.getConfigInfo();
        });
      });
    } else if (process.platform.indexOf('win') > -1) {
      if (fs.existsSync('C:/ProgramData/ECC/ecc.conf')) {
        fs.readFile('C:/ProgramData/ECC/ecc.conf', 'utf8', (err, data) => {
          if (err) {
            console.log(err);
          }

          const result = data.replace(/staking=[0-9]/g, `staking=${event.target.value}`);

          fs.writeFile('C:/ProgramData/ECC/ecc.conf', result, 'utf8', (err) => {
            if (err) {
              console.log(err);
            }
            this.getConfigInfo();
          });
        });
      } else if (fs.existsSync(`${homedir}/appdata/roaming/eccoin/eccoin.conf`)) {
        fs.readFile(`${homedir}/appdata/roaming/eccoin/eccoin.conf`, 'utf8', (err, data) => {
          if (err) {
            console.log(err);
          }

          if (/staking=[0-9]/g.test(data)) {
            console.log('STAKING EXISTS');
            const result = data.replace(/staking=[0-9]/g, `staking=${event.target.value}`);

            console.log(result);

            fs.writeFile(`${homedir}/appdata/roaming/eccoin/eccoin.conf`, result, 'utf8', (err) => {
              if (err) {
                console.log(err);
              }
              this.getConfigInfo();
            });
          } else {
            console.log('STAKING NOT FOUND');
            const result = `${data}staking=${event.target.value}`;

            fs.writeFile(`${homedir}/appdata/roaming/eccoin/eccoin.conf`, result, 'utf8', (err) => {
              if (err) {
                console.log(err);
              }
              this.getConfigInfo();
            });
          }
        });
      }
    }
  }

  render() {
    return (
      <div className="row tab_wrapp">
      <div className="col-md-12 tab_body">
      <div className="panel panel-default">
      <div className="panel-body">
      <div className="row">
      <div className="configuration">
        <div className="row">
          <div className="col-md-12">
            <div className="panel panel-default">
              <div className="panel-body">
                <p className="title">Configuration (wallet must be stopped for changes to take effect)</p>
                <div className="row config-row">
                  <div className="col-md-6 col-sm-6 col-xs-6">Options</div>
                  <div className="col-md-3 col-sm-3 col-xs-3">On</div>
                  <div className="col-md-3 col-sm-3 col-xs-3">Off</div>
                </div>

                <div className="row config-row">
                  <div className="col-md-6 col-sm-6 col-xs-6">Staking</div>
                  <div className="col-md-3 col-sm-3 col-xs-3"><input onChange={this.toggleStaking} type="radio" value={1} name="staking" checked={this.state.staking} /></div>
                  <div className="col-md-3 col-sm-3 col-xs-3"><input onChange={this.toggleStaking} type="radio" value={0} name="staking" checked={!this.state.staking} /></div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>
    );
  }
}
