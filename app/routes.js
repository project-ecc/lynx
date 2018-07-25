/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './components/App';
import Home from './components/Home';
import About from './components/About/About';
import StatusPage from './containers/Status';
import Receive from './components/ReceiveTransaction/Receive';
import Transaction from './components/Transactions/Transaction';
import Send from './components/SendTransactions/Send';
import Settings from './components/Settings/Settings';

export default function Routes({route}) {
  return (
    <App route={route}>
      <Switch>
        <Route path="/settings" component={Settings} />
        <Route path="/transaction" component={Transaction} />
        <Route path="/about" component={About} />
        <Route path="/receive" component={Receive} />
        <Route path="/send" component={Send} />
        <Route path="/statuspage" component={StatusPage} />
        <Route path="/" component={Home} />
      </Switch>
    </App>
  );
}
