import React, { Component } from 'react';
import fs from 'fs';
import PropTypes from 'prop-types';
import { traduction } from '../../lang/lang';
import config from '../../../config.json';
import { grabWalletDir, getPlatformFileName, getPlatformFileExtension, extractDownloadURL, extractChecksum, getPlatformName } from '../../services/platform.service';
import { downloadFile } from '../../utils/downloader';

const request = require('request-promise-native');
const event = require('../../utils/eventhandler');

const lang = traduction();

class WalletInstallerPartial extends React.Component {
  static propTypes = {
    isWalletInstalled: PropTypes.bool,
    isNewVersionAvailable: PropTypes.bool,
    isWalletOff: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      isInstalling: false,
      progress: 0,
      progressMessage: ''
    };
    this.downloadDaemon = this.downloadDaemon.bind(this);
  }

  componentDidMount() {
    event.on('downloading-file', (payload) => {
      const walletPercent = payload.percent * 100;
      this.setState({
        isInstalling: true,
        progress: walletPercent.toFixed(2),
        progressMessage: `Downloading wallet \n ${walletPercent.toFixed(2)}%`
      });
    });

    event.on('downloaded-file', () => {
      this.setState({
        isInstalling: true,
        progress: 100,
        progressMessage: 'Downloaded wallet 100%'
      });
    });

    event.on('verifying-file', () => {
      this.setState({
        isInstalling: true,
        progressMessage: 'Verifying wallet...'
      });
    });

    event.on('unzipping-file', (payload) => {
      this.setState({
        isInstalling: true,
        progressMessage: `${payload.message}`
      });
    });

    event.on('file-download-complete', () => {
      this.setState({
        isInstalling: false,
        progressMessage: ''
      });
    });
  }

  async downloadDaemon() {
    this.setState({
      isInstalling: true,
      progressMessage: 'Attempting to download...'
    });
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
        const latestDaemon = parsed[0].name;
        const latestVersion = latestDaemon.split("eccoin")[1];
        console.log(latestVersion)
        const zipChecksum = extractChecksum(getPlatformName(), parsed[0].description);
        console.log(zipChecksum)
        const downloadUrl = extractDownloadURL(getPlatformName(), parsed[0].description);
        console.log(downloadUrl);
        reject(false);
        const downloaded = await downloadFile(downloadUrl, walletDirectory, 'Eccoind.zip', latestVersion, zipChecksum, true);

        if (downloaded) {
          event.emit('file-download-complete');
          event.emit('hide');
          event.emit('animate', 'Wallet downloaded and ready to start.');


          const platFileName = getPlatformFileName();
          const fileExtension = getPlatformFileExtension();
          fs.rename(`${walletDirectory}eccoin-${latestVersion}/bin/eccoind${fileExtension}`, walletDirectory + platFileName, (err) => {
            if (err) throw err;
            console.log('Successfully renamed - AKA moved!');
            event.emit('file-download-complete');
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
    if (this.state.isInstalling) {
      return (
        <div>
          <div className="col-md-12">
            <p style={{ color: '#ffffff', textAlign: 'center' }}>{this.state.progressMessage}</p>
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
    } else if (this.props.isWalletInstalled && this.props.isNewVersionAvailable) {
      return (
        <button className="orangeButton btn btn-raised sidebar-button" disabled={!this.props.isWalletOff} onClick={this.downloadDaemon}>
          {lang.clickUpdateWallet}
        </button>
      );
    } else if (!this.props.isWalletInstalled) {
      return (
        <button className="orangeButton btn btn-raised sidebar-button" disabled={!this.props.isWalletOff} onClick={this.downloadDaemon}>
          {lang.clickInstallWallet}
        </button>
      );
    }
    return (null);
  }
}

export default WalletInstallerPartial;
