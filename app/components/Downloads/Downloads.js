import React, { Component } from 'react';
import fs from 'fs';

const config = require('../../../config');

const request = require('request-promise-native');

// axios.defaults.adapter = require('axios/lib/adapters/http');

const homedir = require('os').homedir();

const { ipcRenderer } = require('electron');

const event = require('../../utils/eventhandler');

export default class Downloads extends Component {
  componentWillMount() {
    ipcRenderer.on('wallet-downloaded', (e, err) => {
        console.log("dan");
      if (err) {
        event.emit('hide');
        event.emit('animate', err);
      } else {
        const opts = {
          url: 'https://api.github.com/repos/Greg-Griffith/eccoin/releases/latest',
          headers: {
            'User-Agent': 'request',
          },
        };
        return request(opts)
          .then((response) => {
            console.log(response);
            const path = `${homedir}/.eccoin-wallet`;
            const parsed = JSON.parse(response);
            const version = parsed.name;
            fs.writeFile(`${path}/wallet-version.txt`, version, (err) => {
              if (err) throw err;
              ipcRenderer.send('wallet-version-created');
              event.emit('hide');
              event.emit('show', 'Wallet downloaded and ready to start.');
            });
          })
          .catch(error => console.log(error));
      }
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('wallet-downloaded');
  }
  downloadLinux64 = () => {
    event.emit('show', 'Wallet downloading...');
    ipcRenderer.send('wallet-download', { url: config.linux64, filename: config.downloadFileName });
  };
  downloadLinux32 = () => {
    event.emit('show', 'Wallet downloading...');
    ipcRenderer.send('wallet-download', { url: config.linux32, filename: config.downloadFileName });
  };
  downloadWindows64 = () => {
    event.emit('show', 'Wallet downloading...');
    ipcRenderer.send('wallet-download', { url: config.win32, filename: config.downloadFileName });
  };
  downloadWindows32 = () => {
    event.emit('show', 'Wallet downloading...');
    ipcRenderer.send('wallet-download', { url: config.win64, filename: config.downloadFileName });
  };
  downloadMacOSX = () => {
    event.emit('show', 'Wallet downloading...');
    ipcRenderer.send('wallet-download', { url: config.osx, filename: config.downloadFileName });
  };
  render() {
    return (
      <div className="downloads">
        <div className="col-md-12">
          <p className="title">Downloads</p>
          <div className="panel panel-default">
            <div className="panel-body text-center larger-text">
              <div className="download-link-container">
                <a className="download-link" onClick={this.downloadLinux32} style={{ cursor: 'pointer' }}>Linux 32 Bit</a>
              </div>
              <div className="download-link-container">
                <a className="download-link" onClick={this.downloadLinux64} style={{ cursor: 'pointer' }}>Linux 64 Bit</a>
              </div>
              <div className="download-link-container">
                <a className="download-link" onClick={this.downloadMacOSX} style={{ cursor: 'pointer' }}>Mac OS X</a>
              </div>
              <div className="download-link-container">
                <a className="download-link" onClick={this.downloadWindows32} style={{ cursor: 'pointer' }}>Windows 32 Bit</a>
              </div>
              <div className="download-link-container">
                <a className="download-link" onClick={this.downloadWindows64} style={{ cursor: 'pointer' }}>Windows 64 Bit</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

