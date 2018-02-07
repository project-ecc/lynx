import { traduction } from '../lang/lang';

const lang = traduction();

export default {
  getErrorFromCode: (status) => {
    switch (status) {
      case -5:
        return lang.invalidEccAddress;
      case -13:
        return lang.unlockWalletFirst;
      case -14:
        return lang.walletWrongPass;

      default:
        return 'An Error Occurred';
    }
  }
};
