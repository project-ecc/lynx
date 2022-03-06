import { grabWalletDir, getPlatformWalletUri, extractChecksum, getPlatformName} from '../services/platform.service';
import config from '../../config.json';
import wallet from './wallet';
const semver = require('semver')

const fs = require('fs');
const request = require('request-promise-native');

const releaseUrl = config.releaseUrl;
var lastCheck = 0;
var gitlabVersion = 0;
var lastRemoteChecksum = 0;

export default class Updater {

  checkForWalletVersion() {
    return fs.existsSync(getPlatformWalletUri());
  }

  checkWalletVersion(cb) {
    return wallet.getWalletVersion().then((data) => {
        const version = semver.valid(semver.coerce(data[0]));
        console.log(version);
        console.log(gitlabVersion);
        const now = Date.now();
        console.log(now);
        // if we do not have a local checksum to check the hash for,
        // download it. we need it
        if (data[1] == -1)
        {
            cb(true);
        }
        if (lastCheck == 0 || lastCheck < now - 600000)
        {
            lastCheck = now;
            const opts = {
                url: releaseUrl,
                headers: {
                    'User-Agent': 'request'
                },
            };
            return request(opts).then((response) =>
            {
                const parsed = JSON.parse(response);
                gitlabVersion = semver.valid(semver.coerce(parsed[0].tag_name));
                console.log(gitlabVersion);
                if (semver.lt(String(version), String(gitlabVersion)))
                {
                    cb(true);
                }
                else if (semver.eq(String(version), String(gitlabVersion))) {
                    const remoteChecksum = extractChecksum(getPlatformName(), parsed[0].description);
                    if ( data[1] !=  remoteChecksum) {
                        lastRemoteChecksum = remoteChecksum;
                        cb(true);
                    }
                    else
                    {
                        cb(false);
                    }
                }
                else
                {
                    cb(false);
                }
            }).catch(error => console.log(error.message));
        }
        else
        {
            if (semver.lt(String(version), String(gitlabVersion)))
            {
                cb(true);
            }
            else if (semver.eq(String(version), String(gitlabVersion))) {
                if ( data[1] != lastRemoteChecksum) {
                    cb(true);
                }
                else
                {
                    cb(false);
                }
            }
            else
            {
                cb(false);
            }
        }
    }).catch((err)=>{throw err;});
  }
}

export const updater = new Updater();
