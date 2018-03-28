// @flow
import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import Routes from '../routes';
import { getBlockchainInfo, getInfo, getWalletInfo } from '../actions/WalletAction.js';

require('jquery');

type RootType = {
  store: {},
  history: {}
};

export default function Root({ store, history }: RootType) {
  store.dispatch(getBlockchainInfo());
  store.dispatch(getInfo());
  store.dispatch(getWalletInfo());

  setTimeout(() => {
    store.dispatch(getBlockchainInfo());
    store.dispatch(getInfo());
    store.dispatch(getWalletInfo());
  }, 750);

  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Routes route={history} />
      </ConnectedRouter>
    </Provider>
  );
}
