import { grabWalletDir, getPlatformWalletUri} from '../services/platform.service';
import config from '../../config.json';
import wallet from './wallet';
const semver = require('semver')

const fs = require('fs');
const request = require('request-promise-native');

const releaseUrl = config.releaseUrl;

export default class Updater {

  checkForWalletVersion() {
    return fs.existsSync(getPlatformWalletUri());
  }

  checkWalletVersion(cb) {
    return wallet.getWalletVersion().then((data) => {
        const version = semver.valid(semver.coerce(data));
        console.log(version);
        const opts = {
          url: releaseUrl,
          headers: {
            'User-Agent': 'request'
          },
        };
        return request(opts).then((response) => {
          const parsed = JSON.parse(response);
          console.log(parsed)
          const gitlabVersion = semver.valid(semver.coerce(parsed[0].tag_name));
          console.log(gitlabVersion);
          if (semver.lt(String(version), String(gitlabVersion))) {
            cb(true);
          } else {
            cb(false);
          }
        }).catch(error => console.log(error.message));
    }).catch((err)=>{throw err;});
  }
}

export const updater = new Updater();
