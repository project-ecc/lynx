import Client from 'eccoin-js';
import Shell from 'node-powershell';
import fs from 'fs';
import {runExec, runExecFile} from './runExec';

import { getPlatformWalletUri, getConfUri, grabWalletDir } from '../services/platform.service';
import { getChecksum } from './downloader';

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
    console.log('in load')
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
    if (typeof this.client === 'undefined' || !this.client)
    {
        return Promise.reject(new Error('RPC this.client was not defined'));
    }
    return this.client.getInfo().then(res =>
    {
        return Promise.resolve(res);
    }).catch((err) =>
    {
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
      return Promise.reject(new Error(err));
    });
  }

  async getMiningInfo() {
    return this.client.getMiningInfo().then(res => {
      return Promise.resolve(res);
    }).catch((err) => {
      return Promise.reject(new Error(err));
    });
  }

  async getTransactions(count, skip) {
    return new Promise((resolve, reject) => {
      this.client.listTransactions(count, skip).then((transactions) => {
        return resolve(transactions);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  async listaddresses() {
    return new Promise((resolve, reject) => {
      this.client.listAddresses().then((addresses) => {
        return resolve(addresses);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  async importPrivateKey(privateKey) {
    const result = await this.client.importPrivKey(privateKey);
    return result;
  }

  async createNewAddress(nameOpt) {
    let newAddress = await this.client.getNewAddress();
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

  async setgeneratepos() {
    try {
      const result = await this.client.setGeneratepos();
      return result;
    } catch (err) {
      return err;
    }
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

  async dumpPrivateKey(walletAddress) {
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

  getWalletVersion(){
    return new Promise(async (resolve, reject) => {
      let path = getPlatformWalletUri();
      this.runWalletWithOptions(path, ['-version']).then((data)=>{
        // Eccoind version v0.2.5.15-06804e7
        let firstLine = data.split(/\r?\n/)[0];
        let splitOnSpace = firstLine.split(" ")[2];
        // this will return vxx.xx.xx.xx IE v0.2.5.15
        let cleaned = splitOnSpace.split("-")[0];
        // also get the hash
        const walletDirectory = grabWalletDir();
        const fileName = walletDirectory + cleaned + ".bak";
        getChecksum(fileName).then(checksum => {
            resolve([cleaned, checksum]);
        });
      }).catch((err)=>{
        reject(err)
      })
    });
  }

  async walletstop() {
    try {
      return await this.client.stop();
    } catch (err) {
      return err;
    }
  }

  async runWalletWithOptions(path, options){
    // options = options.join(" ");
    return new Promise(async (resolve, reject) => {
      if (process.platform === 'linux' || process.platform === 'darwin') {
        await runExec(`chmod +x "${path}"`, 1000)
          .then(() => {
            runExecFile(path, options).then((data)=>{
              return resolve(data);
            }).catch((err)=>{
              reject(err);
            })
          })
          .catch((err) => {
            reject(err);
          });
      } else if (process.platform.indexOf('win') > -1) {
        let command = ''

        if(options.join(' ').indexOf('version') > -1){
          command = `${path} -version`;
          console.log(command)
        } else {
          command = `& start-process "${path}" -ArgumentList "${options.join(' ')}" -verb runAs -WindowStyle Hidden`;
          console.log(command)
        }

        const ps = new Shell({
          executionPolicy: 'Bypass',
          noProfile: true
        });
        ps.addCommand(command);
        ps.invoke()
          .then(data => {
            console.log(data)
            ps.dispose();
            return resolve(data);
          })
          .catch(err => {
            console.log(err);
            ps.dispose();
            return reject(err);
          });
      }
    });
  }

  walletstart(rescan = false) {
    console.log('in wallet start');
    return new Promise(async (resolve, reject) => {
      let options = [];
      options.push('-daemon');
      if(rescan == true){
        options.push('-reindex');
      }
      let path = getPlatformWalletUri();
      this.runWalletWithOptions(path, options).then(()=>{
        resolve(true);
      }).catch((err)=>{
        reject(err)
      })
    });
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
