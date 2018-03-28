import { GET_BLOCKCHAIN_INFO,
GET_INFO,
GET_WALLET_INFO,
SET_UNLOCKED_UNTIL,
EVALUATE_STATUS,
IS_WALLET_INSTALLED,
IS_INSTALLING_PRIVATE_KEY } from '../actions/WalletAction';


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
  difficulty: 0,
  encrypted: false,
  unlocked_until: 0,
  staking: false,

  // getwalletinfo
  unconfirmed_balance: 0,
  immature_balance: 0,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_BLOCKCHAIN_INFO:
      return Object.assign({}, state, {
        chain: action.payload.chain,
        bestblockhash: action.payload.bestblockhash,
      });
    case IS_INSTALLING_PRIVATE_KEY:
      return Object.assign({}, state, {
        importingKey: action.payload.importingKey
      });
    case GET_INFO:
      return Object.assign({}, state, {
        versionformatted: action.payload.versionformatted,
        version: action.payload.version,
        protocolversion: action.payload.protocolversion,
        walletversion: action.payload.walletversion,
        balance: action.payload.balance,
        newmint: action.payload.newmint,
        stake: action.payload.stake,
        blocks: action.payload.blocks,
        headers: action.payload.headers,
        connections: action.payload.connections,
        difficulty: action.payload.difficulty,
        encrypted: action.payload.encrypted,
        staking: action.payload.staking,
      });
    case GET_WALLET_INFO:
      return Object.assign({}, state, {
        unconfirmed_balance: action.payload.unconfirmed_balance,
        immature_balance: action.payload.immature_balance,
      });
    case SET_UNLOCKED_UNTIL:
      return Object.assign({}, state, {
        unlocked_until: action.payload.unlocked_until,
      });
    case IS_WALLET_INSTALLED:
      return Object.assign({}, state, {
        walletInstalled: action.payload.walletInstalled,
      });
    case EVALUATE_STATUS:
      return Object.assign({}, state, {
        starting: action.payload.starting,
        running: action.payload.running,
        stopping: action.payload.stopping,
        off: action.payload.off,
      });
    default:
      return state;
  }
};
