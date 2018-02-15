import React, { Component } from 'react';

import fs from 'fs';
import { getConfUri } from '../../services/platform.service';

const event = require('../../utils/eventhandler');

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
    this.changeStaking = this.changeStaking.bind(this);
    this.getInfo = this.getInfo.bind(this);
  }

  componentDidMount() {
    this.getConfigInfo();
  }

  getInfo(directory) {
    fs.readFile(directory, 'utf8', (err, data) => {
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
        fs.appendFile(directory, 'staking=0', 'utf8', (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  }

  getConfigInfo() {
    this.getInfo(getConfUri());
  }

  changeStaking(directory, staking) {
    fs.readFile(directory, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
      }

      if (/staking=[0-9]/g.test(data)) {
        console.log('STAKING EXISTS');
        const result = data.replace(/staking=[0-9]/g, `staking=${staking}`);

        console.log(result);

        fs.writeFile(directory, result, 'utf8', (err) => {
          if (err) {
            console.log(err);
          }
          this.getConfigInfo();
        });
      } else {
        console.log('STAKING NOT FOUND');
        const result = `${data}staking=${staking}`;

        fs.writeFile(directory, result, 'utf8', (err) => {
          if (err) {
            console.log(err);
          }
          this.getConfigInfo();
        });
      }
    });
  }

  toggleStaking(event) {
    event.persist();
    // Grab the event stack.
    const toggleState = event.target.value;
    this.changeStaking(getConfUri(), toggleState);
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
