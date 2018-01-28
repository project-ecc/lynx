import React, { Component } from 'react';
import TransTable from './TransactionTable';
import { traduction } from '../../lang/lang';

const lang = traduction();


class Transaction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      select: 'all'
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ select: event.target.value });
  }

  loadmore() {
    this.child_load_more.loadmore();
  }

  loadless() {
    this.child_load_more.loadless();
  }

  render() {
    return (
      <div className="transactions">
        <div className="row">
          <div className="col-md-12">
            <div className="panel panel-default">
              <div className="panel-body">
                <p className="title">{lang.transactionsLatestTransactions}</p>
                <div className="selectfield">
                  <select className="form-control" value={this.state.select} onChange={this.handleChange}>
                    <option value="all">{lang.all}</option>
                    <option value="send">{lang.send}</option>
                    <option value="receive">{lang.received}</option>
                    <option value="generate">{lang.staked}</option>
                    <option value={0}>{lang.pending}</option>
                    <option value={1}>{lang.confirmed}</option>
                    <option value={-1}>{lang.orphaned}</option>
                  </select>
                </div>
                <TransTable h={'90%'} option={this.state.select} countTras={100} ref={(input) => { this.child_load_more = input; }} />
                <div className="bottomButtonContainer">
                  <button className="btn_load_less -grey-btn-hover" onClick={this.loadless.bind(this)}>{lang.transactionsLoadPrevious}</button>
                  <button className="btn_load_more -grey-btn-hover" onClick={this.loadmore.bind(this)}>{lang.transactionsLoadMore}</button>
                </div>
              </div>
            </div>
        </div>
        </div>
      </div>
    );
  }
}

export default Transaction;
