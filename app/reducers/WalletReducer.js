import {
  GET_BLOCKCHAIN_INFO,
  GET_INFO,
  GET_WALLET_INFO,
  GET_MINING_INFO,
  SET_UNLOCKED_UNTIL,
  EVALUATE_STATUS,
  IS_WALLET_INSTALLED,
  IS_INSTALLING_PRIVATE_KEY
} from '../actions/WalletAction';


const initialState = {
  // Wallet State
  off: true,
  starting: false,
  running: false,
  stopping: false,
  walletInstalled: false,
  importingKey: false,

  // getblockchaininfo
  chain: '',
  bestblockhash: '',

  // getinfo
  versionformatted: "",
  version: 0,
  protocolversion: 0,
  walletversion: 0,
  balance: 0,
  newmint: 0,
  stake: 0,
  blocks: 0,
  headers: 0,
  connections: 0,
  difficulty: "0",
  moneysupply: "0",
  encrypted: false,
  unlocked_until: 0,
  mining: false,
  staking: false,
  paytxfee: 0,
  relayfee: 0,

  // getwalletinfo
  unconfirmed_balance: 0,
  immature_balance: 0,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case IS_WALLET_INSTALLED:
      return {
        ...state,
        walletInstalled: action.payload.walletInstalled,
      };
    case GET_BLOCKCHAIN_INFO:
      return {
        ...state,
        chain: action.payload.chain,
        bestblockhash: action.payload.bestblockhash,
      };
    case IS_INSTALLING_PRIVATE_KEY:
      return {
        ...state,
        importingKey: action.payload.importingKey
      };
    case GET_INFO:
      return {
        ...state,
        versionformatted: action.payload.versionformatted,
        version: action.payload.version,
        protocolversion: action.payload.protocolversion,
        walletversion: action.payload.walletversion,
        balance: action.payload.balance,
        newmint: action.payload.newmint,
        stake: action.payload.stake,
        blocks: action.payload.blocks,
        headers: action.payload.headers,
        moneysupply: action.payload.moneysupply,
        connections: action.payload.connections,
        difficulty: action.payload.difficulty,
        encrypted: action.payload.encrypted,
        paytxfee: action.payload.paytxfee,
        relayfee: action.payload.relayfee,
      };
    case GET_WALLET_INFO:
      return {
        ...state,
        unconfirmed_balance: action.payload.unconfirmed_balance,
        immature_balance: action.payload.immature_balance,
      };
    case GET_MINING_INFO:
      return {
        ...state,
        mining: action.payload.generate,
        staking: action.payload.generatepos,
      };
    case SET_UNLOCKED_UNTIL:
      return {
        ...state,
        unlocked_until: action.payload.unlocked_until,
      };
    case EVALUATE_STATUS:
      return {
        ...state,
        starting: action.payload.starting,
        running: action.payload.running,
        stopping: action.payload.stopping,
        off: action.payload.off,
      };
    default:
      return state;
  }
};
