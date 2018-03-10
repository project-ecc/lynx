const GET_BLOCKCHAIN_INFO = 'GET_BLOCKCHAIN_INFO';
const GET_INFO = 'GET_INFO';
const GET_WALLET_INFO = 'GET_WALLET_INFO';
const SET_UNLOCKED_UNTIL = 'SET_UNLOCKED_UNTIL';
const EVALUATE_STATUS = 'EVALUATE_STATUS';
const IS_WALLET_INSTALLED = 'IS_WALLET_INSTALLED';
const IS_INSTALLING_PRIVATE_KEY = 'IS_INSTALLING_PRIVATE_KEY';

export const getBlockchainInfo = data => {
  return {
    type: GET_BLOCKCHAIN_INFO,
    payload: {
      chain: data.chain,
      bestblockhash: data.bestblockhash,
    },
  };
};

export const getInfo = data => {
  return {
    type: GET_INFO,
    payload: {
      versionformatted: data.versionformatted,
      version: data.version,
      protocolversion: data.protocolversion,
      walletversion: data.walletversion,
      balance: data.balance,
      newmint: data.newmint,
      stake: data.stake,
      blocks: data.blocks,
      headers: data.headers,
      connections: data.connections,
      difficulty: data.difficulty,
      encrypted: data.encrypted,
      staking: data.staking,
    },
  };
};

export const getWalletInfo = data => {
  return {
    type: GET_WALLET_INFO,
    payload: {
      unconfirmed_balance: data.unconfirmed_balance,
      immature_balance: data.immature_balance,
    }
  };
};

export const setUnlockedUntil = data => {
  return {
    type: SET_UNLOCKED_UNTIL,
    payload: {
      unlocked_until: data.unlocked_until,
    },
  };
};

export const evaluateStatus = data => {
  return {
    type: EVALUATE_STATUS,
    payload: {
      starting: data.starting,
      running: data.running,
      stopping: data.stopping,
      off: data.off,
    }
  };
};

export const isWalletInstalled = data => {
  return {
    type: IS_WALLET_INSTALLED,
    payload: {
      walletInstalled: data.walletInstalled,
    }
  };
};
export const isImportingPrivateKey = data => {
  return {
    type : IS_INSTALLING_PRIVATE_KEY,
    payload: {
      importingKey: data.importingKey
    }
  }
};

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
