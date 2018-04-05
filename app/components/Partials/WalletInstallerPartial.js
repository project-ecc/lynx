import React, { Component } from 'react';
import fs from 'fs';
import PropTypes from 'prop-types';
const request = require('request-promise-native');
import { traduction } from '../../lang/lang';
const event = require('../../utils/eventhandler');
const lang = traduction();
import config from '../../../config.json';
import { grabWalletDir, getPlatformFileName, formatDownloadURL, extractChecksum } from '../../services/platform.service';
import { downloadFile } from '../../utils/downloader';

class WalletInstallerPartial extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      isInstalling: false,
      progress: 0,
      progressMessage: ''
    };
    this.downloadDaemon = this.downloadDaemon.bind(this);
  }

  componentDidMount(){
    event.on('downloading-file', (payload) => {
      const walletPercent = payload.percent * 100;
      this.setState({
        isInstalling: true,
        progress: walletPercent.toFixed(2),
        progressMessage: `Downloading wallet \n ${walletPercent.toFixed(2)}%`
      });
    });

    event.on('verifying-file', (payload) => {
      const walletPercent = payload.percent * 100;
      this.setState({
        isInstalling: true,
        progress: walletPercent.toFixed(2),
        progressMessage: `Verifying wallet \n ${walletPercent.toFixed(2)}%`
      });
    });

    event.on('unzipping-file', (payload) => {
      const walletPercent = payload.percent * 100;
      this.setState({
        isInstalling: true,
        progress: walletPercent.toFixed(2),
        progressMessage: `${payload.message} \n ${walletPercent.toFixed(2)}%`
      });
    });

    event.on('file-download-complete', () => {
      this.setState({
        isInstalling: false,
        progress: 100,
        progressMessage: ''
      });
    });
  }

  async downloadDaemon() {
    const walletDirectory = grabWalletDir();
    const releaseUrl = config.releaseUrl;
    const platformFileName = getPlatformFileName();

    return new Promise((resolve, reject) => {
      console.log('downloading daemon');

      // download latest daemon info from server
      const opts = {
        url: releaseUrl,
        headers: {
          'User-Agent': 'request'
        },
      };

      request(opts).then(async (data) => {
        const parsed = JSON.parse(data);
        const latestDaemon = parsed[0].name.split(' ')[1];
        const zipChecksum = extractChecksum(platformFileName, parsed[0].body);
        const downloadUrl = formatDownloadURL('eccoin', 'v' + latestDaemon, platformFileName);
        console.log(downloadUrl);

        const downloaded = await downloadFile(downloadUrl, walletDirectory, 'Eccoind.zip', zipChecksum, true);

        if (downloaded) {

          fs.writeFile(`${grabWalletDir()}wallet-version.txt`, latestDaemon, (err) => {
            if (err) throw err;
            event.emit('hide');
            event.emit('show', 'Wallet downloaded and ready to start.');
          });

          resolve(true);
        } else {
          reject(downloaded);
        }

      }).catch(error => {
        console.log(error);
        reject(false);
      });
    });
  }

  render() {

    if(this.state.isInstalling){
      return (
        <div>
          <div className="col-md-12">
            <p style={{color: '#ffffff', textAlign: 'center' }}>{this.state.progressMessage}</p>
            <div className="progress custom_progress">
              <div
                className="progress-bar progress-bar-success progress-bar-striped"
                role="progressbar"
                aria-valuenow="40"
                aria-valuemin="0"
                aria-valuemax="100"
                style={{ width: `${this.state.progress}%`, backgroundColor: '#8DA557' }}
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <button className="stopStartButton" onClick={this.downloadDaemon}>
          {lang.clickInstallWallet}
        </button>
      );
    }


  }
}

export default WalletInstallerPartial;
