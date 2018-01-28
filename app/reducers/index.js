import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import WalletReducer from './WalletReducer';

const rootReducer = combineReducers({
  router,
  wallet: WalletReducer,
});

export default rootReducer;
