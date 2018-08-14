import Client from 'bitcoin-core';
import shell from 'node-powershell';
import fs from 'fs';

import { getPlatformWalletUri, getConfUri } from '../services/platform.service';
const { exec, spawn } = require('child_process');


class Wallet {

  constructor() {
    this._u = 'yourusername';
    this._p = 'yourpassword';
    this.client = null;

    this.loadClient().then((loaded) => {
      console.log('client loaded' + loaded);
    })
    .catch((err)=>{
      console.log();
    });

  }

  get username() {
    return this._u;
  }

  get password() {
    return this._p;
  }

  set username(username) {
    this._u = username;
  }

  set password(password) {
    this._p = password;
  }

  loadClient() {
    return new Promise((resolve, reject) => {
      readRpcCredentials().then((data) => {
        if (data !== null) {
          this.username = data.username;
          this.password = data.password;
        }

        this.client = new Client({
          host: '127.0.0.1',
          port: 19119,
          username: this.username,
          password: this.password
        });
        resolve(true);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
    });

  }

  async help() {
    return new Promise((resolve, reject) => {
      this.client.help().then((data) => {
        return resolve(data);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  async command(batch) {
    return new Promise((resolve, reject) => {
      this.client.command(batch).then((responses) => {
        return resolve(responses);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  async reloadConfig() {
    return new Promise((resolve, reject) => {
      this.client.reloadconfig().then((response) => {
        return resolve(response);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  async getInfo() {
    if (typeof this.client === 'undefined' || !this.client) {
      return Promise.reject(new Error('RPC this.client was not defined'));
    }

    return this.client.getInfo().then(res => {
      return Promise.resolve(res);
    }).catch((err) => {
      return Promise.reject(err);
    });
  }

  async getBlockchainInfo() {
    return new Promise((resolve, reject) => {
      this.client.getBlockchainInfo().then((data) => {
        return resolve(data);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  async getWalletInfo() {

    return this.client.getWalletInfo().then(res => {
      return Promise.resolve(res);
    }).catch((err) => {
      return Promise.reject(new Error(err))
    });
  }


  async getTransactions(account, count, skip) {
    return new Promise((resolve, reject) => {
      let a = account;
      if (a === null) {
        a = '*';
      }
      this.client.listTransactions(a, count, skip).then((transactions) => {
        return resolve(transactions);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  async listAllAccounts() {
    return new Promise((resolve, reject) => {
      this.client.listReceivedByAddress(0, true).then((addresses) => {
        return resolve(addresses);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  async importPrivateKey(privateKey){
    const result = await this.client.importPrivKey(privateKey);
    return result;
  }

  async createNewAddress(nameOpt) {
    const name = nameOpt || null;
    let newAddress;
    if (name === null) {
      newAddress = await this.client.getNewAddress();
    } else {
      newAddress = await this.client.getNewAddress(name);
    }
    return newAddress;
  }

  async sendMoney(sendAddress, amount) {
    const amountNum = parseFloat(amount);
    const sendAddressStr = `${sendAddress}`;
    await this.client.sendToAddress(sendAddressStr, amountNum);
  }

  async setTxFee(amount) {
    const amountNum = parseFloat(amount);
    await this.client.setTxFee(amountNum);
  }

  async validate(address) {
    const result = await this.client.validateAddress(address);
    return result;
  }

  async getblockcount() {
    const result = await this.client.getBlockCount();
    return result;
  }

  async getblockhash(hash) {
    const result = await this.client.getBlockHash(hash);
    return result;
  }

  async getpeerinfo() {
    const result = await this.client.getPeerInfo();
    return result;
  }

  async encryptWallet(passphrase) {
    try {
      const result = await this.client.encryptWallet(passphrase);
      return result;
    } catch (err) {
      return err;
    }
  }

  async walletlock() {
    try {
      const result = await this.client.walletLock();
      return result;
    } catch (err) {
      return err;
    }
  }

  async walletpassphrase(passphrase, time) {
    try {
      const ntime = parseInt(time);
      const result = await this.client.walletPassphrase(passphrase, ntime);
      return result;
    } catch (err) {
      return err;
    }
  }

  async walletChangePassphrase(oldPassphrase, newPassphrase) {
    try {
      return await this.client.walletPassphraseChange(oldPassphrase, newPassphrase);
    } catch (err) {
      return err;
    }
  }

  async dumpPrivateKey(walletAddress){
    try {
      return await this.client.dumpPrivKey(walletAddress);
    } catch (err) {
      return err;
    }
  }

  async importWallet(walletPath) {
    try {
      return await this.client.importWallet(walletPath);
    } catch (err) {
      return err;
    }
  }

  async backupWallet(path) {
    try {
      return await this.client.backupWallet(path);
    } catch (err) {
      return err;
    }
  }

  async walletstop() {
    try {
      return await this.client.stop();
    } catch (err) {
      return err;
    }
  }

  walletstart(cb) {
    let path = getPlatformWalletUri();
    console.log(path);
    if (process.platform === 'linux') {
      runExec(`chmod +x "${path}" && "${path}"`, 1000).then(() => {
        return cb(true);
      })
        .catch(() => {
          cb(false);
        });
    } else if (process.platform === 'darwin') {
      console.log(path);
      runExec(`chmod +x "${path}" && "${path}"`, 1000).then(() => {
        return cb(true);
      })
      .catch((err) => {
        console.log(err);
        cb(false);
      });
    } else if (process.platform.indexOf('win') > -1) {
      path = `& "${path}"`;
      const ps = new shell({ //eslint-disable-line
        executionPolicy: 'Bypass',
        noProfile: true
      });

      ps.addCommand(path);
      ps.invoke()
        .then(() => {
          return cb(true);
        })
        .catch(err => {
          console.log(err);
          cb(false);
          ps.dispose();
        });
    }
  }

}

const instance = new Wallet();

export default instance;

function readRpcCredentials () {
  let toReturn = null;
  return new Promise((resolve, reject) => {
    fs.exists(getConfUri(), (exists) => {
      if(!exists){
        resolve(toReturn);
        return;
      }
      fs.readFile(getConfUri(), 'utf8', (err, data) => {
        if (err) {
          console.log("readFile error: ", err);
          resolve(toReturn);
          return;
        }
        toReturn = {
          username: "",
          password: ""
        };
        let patt = /(rpcuser=(.*))/g
        let myArray = patt.exec(data);
        if(myArray && myArray.length > 2)
        {
          toReturn.username = myArray[2];
        }

        patt = /(rpcpassword=(.*))/g
        myArray = patt.exec(data);
        if(myArray && myArray.length > 2)
        {
          toReturn.password = myArray[2];
        }
        // console.log(toReturn);
        resolve(toReturn);
      });
    })
  });
}

function runExec(cmd, timeout, cb) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve('program exited without an error');
      }
    });
    setTimeout(() => {
      resolve('program still running');
    }, timeout);
  });
}
