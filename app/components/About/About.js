import React, { Component } from 'react';
import bitcoinImage from '../../../resources/images/bitcoin.png';
import slackImage from '../../../resources/images/slack.png';
import githubImage from '../../../resources/images/github.png';
import { traduction } from '../../lang/lang';

const config = require('../../../config');

const shell = require('electron').shell;

const lang = traduction();

export default class About extends Component {
  openLink(link) {
    shell.openExternal(link);
  }

  render() {
    return (
      <div className={'row about'}>
        <div className="col-md-12">
          <p className="title">{lang.aboutTitle}</p>
        </div>
        <div className="col-md-12">
          <div className="panel panel-default">
            <div className="panel-body larger-text">
              <div className="col-md-12 col-lg-12 col-xs-12">
                <p>
                  This application is open source. Check us out on github
                  <img src={githubImage} style={{ width: '5%', cursor: 'pointer' }} alt="" onClick={this.openLink.bind(this, config.githubLink)} />
                </p>
                <p>If you like this project and want to show your support for future development of this and other free software, you may send a donation to</p>
              </div>
              <div className="col-md-12 col-lg-12 col-xs-12">
                <p>ECC: ESnoQdpHH5vLafzj9nvXqRugPSkd2ZNrch</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
