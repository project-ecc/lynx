import wallet from '../utils/wallet';

export default {
  unlockWallet: (passPhrase, seconds, onlyStaking) => {
    console.log(passPhrase, seconds, onlyStaking);
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
  dumpPrivateKey: (walletAddress) => {
    return wallet.dumpPrivateKey(walletAddress);
  },
  changePassphase: (oldPassphase, newPassphase) => {
    return wallet.walletChangePassphrase(oldPassphase, newPassphase);
  }
}
;
