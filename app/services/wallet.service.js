import wallet from '../utils/wallet';

export default {
  unlockWallet: (passPhrase, seconds, onlyStaking) => {
    console.log(passPhrase, seconds, onlyStaking);
    return wallet.walletpassphrase(passPhrase, parseInt(seconds), parseInt(onlyStaking));
  },
  lockWallet: () => {
    return wallet.walletlock();
  }
};
