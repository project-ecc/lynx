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
          <div className="panel panel-default">
            <div className="panel-body text-center larger-text">
              <div className="col-md-12 col-lg-12 col-xs-12 " style={{ marginBottom: '25px' }}>
                <p>This User Interface for {config.coinName} is built off of the Sapling base created by <a style={{ cursor: 'pointer' }} onClick={this.openLink.bind(this, 'https://www.cryptounited.io/')}>CryptoUnited 2017-2018 &#169;</a></p>
              </div>
              <div className="col-md-6 col-lg-6 col-xs-6" style={{ cursor: 'pointer' }}>
                <a onClick={this.openLink.bind(this, config.bitcointalkLink)} className="section">
                  <img src={bitcoinImage} style={{ width: '50%' }} alt="" />
                  <span className="sub">{config.bitcointalkText}</span>
                </a>
              </div>
              <div className="col-md-6 col-lg-6 col-xs-6">
                <img src={githubImage} style={{ width: '50%' }} alt="" />
                <div className="section">
                  <a style={{ cursor: 'pointer' }} onClick={this.openLink.bind(this, config.githubLink)}> {config.githubText} </a>
                </div>
              </div>
            </div>
            <div style={{marginTop:'25px'}} className="panel panel-default">
                <div className="panel-body text-center larger-text">
                    <div className="col-md-12 col-lg-12 col-xs-12">
                        <p>The Sapling code base for this user interface is brought to you free of charge by the engineers at CryptoUnited. </p>
                        <p>The Sapling github can be found <a style={{ cursor: 'pointer' }} onClick={this.openLink.bind(this, 'https://www.github.com/cryptounited/sapling')}> HERE. </a></p>
                        <p>If you like this product and would like to show your support for future development of this and other free software, you may send a donation to</p> <p>BTC: 1LWdVxMkdYDSJKoLEXddUKFh5b2AWqu4M6</p> <p>BCH: 1LWdVxMkdYDSJKoLEXddUKFh5b2AWqu4M6</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
