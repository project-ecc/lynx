const fs = require('fs');
const request = require('request-promise-native');
import { grabWalletDir } from '../services/platform.service';

export default class Updater {

  checkForWalletVersion() {
    return fs.existsSync(`${grabWalletDir()}wallet-version.txt`);
  }

  checkWalletVersion(cb) {
    return fs.readFile(`${grabWalletDir()}wallet-version.txt`, 'utf8', (err, data) => {
      if (err) { throw err; } else {
        const version = data.split(' ')[1];
        const opts = {
          url: 'https://api.github.com/repos/Greg-Griffith/eccoin/releases/latest',
          headers: {
            'User-Agent': 'request'
          },
        };
        return request(opts).then((response) => {
          const parsed = JSON.parse(response);
          const githubVersion = parsed.name.split(' ')[1];
          if (version !== githubVersion) {
            cb(true);
          } else {
            cb(false);
          }
        }).catch(error => console.log(error));
      }
    });
  }
}

export const updater = new Updater();
