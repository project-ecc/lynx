import { traduction } from '../lang/lang';

const lang = traduction();

const ErrorEnum = Object.freeze(
  {
    RPC_MISC_ERROR: lang.invalidEccAddress,
    RPC_IN_WARMUP: lang.loadingBlockIndex,
    RPC_UNLOCK_WALLET: lang.unlockWalletFirst,
    RPC_INVALID_ADDRESS: lang.invalidEccAddress,
    RPC_WRONG_PASSPHASE: lang.walletWrongPass
  }
);

export default {
  getErrorFromCode: (status) => {
    switch (status) {
      case -5:
        return ErrorEnum.RPC_INVALID_ADDRESS;
      case -13:
        return ErrorEnum.RPC_UNLOCK_WALLET;
      case -14:
        return ErrorEnum.RPC_WRONG_PASSPHASE;
      case -28:
        return ErrorEnum.RPC_IN_WARMUP;
      default:
        return 'An Error Occurred';
    }
  }
};
