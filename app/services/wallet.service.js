import wallet from '../utils/wallet';
import ErrorService from './error.service'


export function formatNumber(number) {
  return number.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 8 });
}

export default {
  unlockWallet: (passPhrase, seconds, onlyStaking) => {
    return wallet.walletpassphrase(passPhrase, parseInt(seconds), parseInt(onlyStaking));
  },
  lockWallet: () => {
    return wallet.walletlock();
  },
  backupWallet: (path) => {
    return wallet.backupWallet(path);
  },
  importWallet: (walletPath) => {
    return wallet.importWallet(walletPath);
  },
  importPrivateKey: (privateKey) => {
    return wallet.importPrivateKey(privateKey);
  },
  dumpPrivateKey: (walletAddress) => {
    return wallet.dumpPrivateKey(walletAddress);
  },
  changePassphase: (oldPassphase, newPassphase) => {
    return wallet.walletChangePassphrase(oldPassphase, newPassphase);
  },
  processErrorCode: (code) => {
    return ErrorService.getErrorFromCode(code)
  },
  checkDaemonStatus: () => {
    return wallet.getInfo();
  },
  generateId: function(length){
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  },
};

