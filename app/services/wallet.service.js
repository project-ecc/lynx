import Wallet from '../utils/wallet';

const wallet = new Wallet();

export default {
  unlockWallet: (passPhrase, seconds, only_staking) => {
    return wallet.walletpassphrase(passPhrase, seconds, only_staking);
  },
  lockWallet: () => {
    return wallet.walletlock();
  }
};
