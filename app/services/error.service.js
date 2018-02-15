import { traduction } from '../lang/lang';

const lang = traduction();

const DaysEnum = Object.freeze(
  {
    RPC_MISC_ERROR: lang.invalidEccAddress,
    RPC_IN_WARMUP: 'Loading Block Index..'
  }
);

export default {
  getErrorFromCode: (status) => {
    switch (status) {
      case -5:
        return lang.invalidEccAddress;
      case -13:
        return lang.unlockWalletFirst;
      case -14:
        return lang.walletWrongPass;
      case -28:
        return DaysEnum.RPC_IN_WARMUP;
      default:
        return 'An Error Occurred';
    }
  }
};
