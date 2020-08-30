// @flow
import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import Routes from '../routes';
import { updateWalletStatus } from '../actions/WalletAction';

require('jquery');

type RootType = {
  store: {},
  history: {}
};

const updateTimer = store => setTimeout(() => {
  store.dispatch(updateWalletStatus());
  updateTimer(store);
}, 3000);

export default function Root({ store, history }: RootType) {
  store.dispatch(updateWalletStatus());

  updateTimer(store);

  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Routes route={history} />
      </ConnectedRouter>
    </Provider>
  );
}
