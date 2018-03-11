import { traduction } from '../lang/lang';
import { getPlatformWalletUri } from '../services/platform.service';
import glob from 'glob';

const event = require('../utils/eventhandler');
const l = traduction();

// //! General application defined errors
// RPC_MISC_ERROR                  = -1,  //! std::exception thrown in command handling
// RPC_FORBIDDEN_BY_SAFE_MODE      = -2,  //! Server is in safe mode, and command is not allowed in safe mode
// RPC_TYPE_ERROR                  = -3,  //! Unexpected type was passed as parameter
// RPC_INVALID_ADDRESS_OR_KEY      = -5,  //! Invalid address or key
// RPC_OUT_OF_MEMORY               = -7,  //! Ran out of memory during operation
// RPC_INVALID_PARAMETER           = -8,  //! Invalid, missing or duplicate parameter
// RPC_DATABASE_ERROR              = -20, //! Database error
// RPC_DESERIALIZATION_ERROR       = -22, //! Error parsing or validating structure in raw format
// RPC_VERIFY_ERROR                = -25, //! General error during transaction or block submission
// RPC_VERIFY_REJECTED             = -26, //! Transaction or block was rejected by network rules
// RPC_VERIFY_ALREADY_IN_CHAIN     = -27, //! Transaction already in chain
// RPC_IN_WARMUP                   = -28, //! Client still warming up

const GeneralErrEnum = Object.freeze({
  RPC_MISC_ERROR                  :l.rpcStandardError,  //! std::exception thrown in command handling
  RPC_FORBIDDEN_BY_SAFE_MODE      :l.serverSafeMode,  //! Server is in safe mode, and command is not allowed in safe mode
  RPC_TYPE_ERROR                  :l.invalidArgumentType,  //! Unexpected type was passed as parameter
  RPC_INVALID_ADDRESS_OR_KEY      :l.invalidAddress,  //! Invalid address or key
  RPC_OUT_OF_MEMORY               :l.outOfMemory,  //! Ran out of memory during operation
  RPC_INVALID_PARAMETER           :l.invalidparam,  //! Invalid, missing or duplicate parameter
  RPC_DATABASE_ERROR              :l.databaseError, //! Database error
  RPC_DESERIALIZATION_ERROR       :l.errorValidatingStructure, //! Error parsing or validating structure in raw format
  RPC_VERIFY_ERROR                :l.blockOrTransationValidation, //! General error during transaction or block submission
  RPC_VERIFY_REJECTED             :l.verifyRejected, //! Transaction or block was rejected by network rules
  RPC_VERIFY_ALREADY_IN_CHAIN     :l.transactionInChain, //! Transaction already in chain
  RPC_IN_WARMUP                   :l.loadingWallet //! Client still warming up
});

const P2PClientErrEnum = Object.freeze({
  RPC_CLIENT_NOT_CONNECTED:       l.coinNotConnected,        //! -9,  //! Bitcoin is not connected
  RPC_CLIENT_IN_INITIAL_DOWNLOAD: l.downloadingInitialBlocks,  //! -10, //! Still downloading initial blocks
  RPC_CLIENT_NODE_ALREADY_ADDED:  l.nodeAlreadyAdded,   //! -23, //! Node is already added
  RPC_CLIENT_NODE_NOT_ADDED:      l.nodeNotAdded,       //! -24, //! Node has not been added before
  RPC_CLIENT_NODE_NOT_CONNECTED:  l.nodeNotConnected,   //! -29, //! Node to disconnect not found in connected nodes
  RPC_CLIENT_INVALID_IP_OR_SUBNET:l.invalidNetAddress, //! -30, //! Invalid IP/Subnet
});

// //! Wallet errors
// RPC_WALLET_ERROR                = -4,  //! Unspecified problem with wallet (key not found etc.)
// RPC_WALLET_INSUFFICIENT_FUNDS   = -6,  //! Not enough funds in wallet or account
// RPC_WALLET_INVALID_ACCOUNT_NAME = -11, //! Invalid account name
// RPC_WALLET_KEYPOOL_RAN_OUT      = -12, //! Keypool ran out, call keypoolrefill first
// RPC_WALLET_UNLOCK_NEEDED        = -13, //! Enter the wallet passphrase with walletpassphrase first
// RPC_WALLET_PASSPHRASE_INCORRECT = -14, //! The wallet passphrase entered was incorrect
// RPC_WALLET_WRONG_ENC_STATE      = -15, //! Command given in wrong wallet encryption state (encrypting an encrypted wallet etc.)
// RPC_WALLET_ENCRYPTION_FAILED    = -16, //! Failed to encrypt the wallet
// RPC_WALLET_ALREADY_UNLOCKED     = -17 //! Wallet is already unlocked

const WalletErrEnum = Object.freeze({
  RPC_WALLET_ERROR: l.generalWalletError, //! Unspecified problem with wallet (key not found etc.)
  RPC_WALLET_INSUFFICIENT_FUNDS:l.insufficentFunds,    //! Not enough funds in wallet or account
  RPC_WALLET_INVALID_ACCOUNT_NAME: l.invalidAddress, //! Invalid account name
  RPC_WALLET_KEYPOOL_RAN_OUT: l.keypoolRanOut,      //! Keypool ran out, call keypoolrefill first
  RPC_WALLET_UNLOCK_NEEDED: l.unlockWalletFirst,        //! Enter the wallet passphrase with walletpassphrase first
  RPC_WALLET_PASSPHRASE_INCORRECT: l.walletWrongPass, //! The wallet passphrase entered was incorrect
  RPC_WALLET_WRONG_ENC_STATE: l.wrongEncState,      //! Command given in wrong wallet encryption state (encrypting an encrypted wallet etc.)
  RPC_WALLET_ENCRYPTION_FAILED: l.walletEncryptionFailed,    //! Failed to encrypt the wallet
  RPC_WALLET_ALREADY_UNLOCKED: l.walletAlreadyUnlocked,     //! Wallet is already unlocked

});

const HTTPErrEnum = Object.freeze({
  RPC_401_ERROR: l.invalidCredentials
});
export function getErrorFromCode (status, message = null) {
  console.log(status)
  switch (status) {
    //General errors
    case -1:
      return GeneralErrEnum.RPC_MISC_ERROR;
    case -2:
      return GeneralErrEnum.RPC_FORBIDDEN_BY_SAFE_MODE;
    case -3:
      return GeneralErrEnum.RPC_TYPE_ERROR;
    case -5:
      return GeneralErrEnum.RPC_INVALID_ADDRESS_OR_KEY;
    case -7:
      return GeneralErrEnum.RPC_OUT_OF_MEMORY;
    case -8:
      return GeneralErrEnum.RPC_INVALID_PARAMETER;
    case -20:
      return GeneralErrEnum.RPC_DATABASE_ERROR;
    case -22:
      return GeneralErrEnum.RPC_DESERIALIZATION_ERROR;
    case -25:
      return GeneralErrEnum.RPC_VERIFY_ERROR;
    case -26:
      return GeneralErrEnum.RPC_VERIFY_REJECTED;
    case -27:
      return GeneralErrEnum.RPC_VERIFY_ALREADY_IN_CHAIN;
    case -28:
      return GeneralErrEnum.RPC_IN_WARMUP + ': ' + message;


    //P2P errors
    case -9:
      return P2PClientErrEnum.RPC_CLIENT_NOT_CONNECTED;
    case -10:
      return P2PClientErrEnum.RPC_CLIENT_IN_INITIAL_DOWNLOAD;
    case -23:
      return P2PClientErrEnum.RPC_CLIENT_NODE_ALREADY_ADDED;
    case -24:
      return P2PClientErrEnum.RPC_CLIENT_NODE_NOT_ADDED;
    case -29:
      return P2PClientErrEnum.RPC_CLIENT_NODE_NOT_CONNECTED;
    case -30:
      return P2PClientErrEnum.RPC_CLIENT_INVALID_IP_OR_SUBNET;


    //Wallet errors
    case -4:
      return WalletErrEnum.RPC_WALLET_ERROR + message;
    case -6:
      return WalletErrEnum.RPC_WALLET_INSUFFICIENT_FUNDS;
    case -11:
      return WalletErrEnum.RPC_WALLET_INVALID_ACCOUNT_NAME;
    case -12:
      return WalletErrEnum.RPC_WALLET_KEYPOOL_RAN_OUT;
    case -13:
      return WalletErrEnum.RPC_WALLET_UNLOCK_NEEDED;
    case -14:
      return WalletErrEnum.RPC_WALLET_PASSPHRASE_INCORRECT;
    case -15:
      return WalletErrEnum.RPC_WALLET_WRONG_ENC_STATE;
    case -16:
      return WalletErrEnum.RPC_WALLET_ENCRYPTION_FAILED;
    case -17:
      return WalletErrEnum.RPC_WALLET_ALREADY_UNLOCKED;

    // HTTP errors
    case 401:
      return HTTPErrEnum.RPC_401_ERROR;
    default:
      return 'An Error Occurred: '+ message;
  }
}
export function handleWalletError (err, history) {
  if (err.code === 'ECONNREFUSED') {
    glob(getPlatformWalletUri(), (err, files) => {
      if (!files.length) {
        event.emit('animate', l.walletNotInstalled);
        // event.emit('animate', 'Wallet not installed. Choose a wallet to download above.');
        // history.push('/downloads');
      } else {
        event.emit('animate', l.walletNotRunning);
      }
    })
  } else {
    if (err.code !== 'undefined' || err.code !== null){
      event.emit('animate', getErrorFromCode(err.code));
    }
    console.log(err);
  }
}
