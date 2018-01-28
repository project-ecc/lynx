import $ from 'jquery';
import React, { Component } from 'react';
import Wallet from '../../utils/wallet';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import glob from 'glob';
const settings = require('electron-settings');
const event = require('../../utils/eventhandler');

const lang = traduction();
const wallet = new Wallet();

class TransactionTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      canAutoUpdate: true,
      page: 1,
    };
    this.rowClicked = this.rowClicked.bind(this);
    // this.getAllTransactions();
  }

  componentDidMount() {
    const self = this;
    self.getAllTransactions();
    self.timerInfo = setInterval(() => {
      if (!self.state.requesting) {
        self.getAllTransactions();
      }
    }, 5000);
  }

  componentWillUnmount() {
    this.state.requesting = false;
    this.state.canAutoUpdate = true;
    clearInterval(this.timerInfo);
  }

  getAllTransactions() {
    if (this.state.canAutoUpdate) {
      const self = this;
      const countTras = self.props.countTras;

      self.setState({ requesting: true });

      wallet.getTransactions(null, countTras, 0).then((data) => {
        if (this.state.requesting) {
          self.setState({ transactions: data, requesting: false });
        }
      }).catch((err) => {
        if (err.message !== 'Loading block index...' && err.message !== 'connect ECONNREFUSED 127.0.0.1:19119') {
          event.emit('animate', err.message);
        }
      });
    }
  }

  renderStatus(opt) {
    if (opt === 0) {
      return (
        <span className="desc_p">{lang.pending}</span>
      );
    } else if (opt > 0) {
      return (
        <span className="desc_c">{lang.confirmed}</span>
      );
    } else if (opt < 0) {
      return (
        <span className="desc_o">{lang.orphaned}</span>
      );
    }
  }

  rowClicked(index) {
    const transactionBottom = $(`#trans_bottom_${index}`);
    if (transactionBottom.attr('sd') === 'false' || transactionBottom.attr('sd') === undefined) {
      $(transactionBottom).slideDown();
      $(transactionBottom).attr('sd', 'true');
    } else {
      transactionBottom.slideUp();
      transactionBottom.attr('sd', 'false');
    }
  }

  orderTransactions(data) {
    const aux = [];
    for (let i = data.length - 1; i >= 0; i -= 1) {
      aux.push(data[i]);
    }
    return aux;
  }

  loadmore() {
    const self = this;
    const countTras = self.props.countTras;
    const currentTrans = [];

    const p = self.state.page + 1;
    self.setState({ requesting: true, page: p });

    wallet.getTransactions(null, countTras, countTras * p).then((data) => {
      if (self.state.requesting) {
        if (data.length > 0) {
          for (let i = 0; i < data.length; i += 1) {
            currentTrans.push(data[i]);
          }
          event.emit('hide');
          self.setState({ transactions: currentTrans });
        } else {
          event.emit('animate', lang.transactionsNoMoreToLoad);
        }
        self.setState({ requesting: false, canAutoUpdate: false });
      }
    }).catch((err) => {
      console.log(err);
      if (this.state.requesting) {
        event.emit('animate', lang.notificationWalletDownOrSyncing);
        self.setState({ requesting: false });
      }
    });
  }

  loadless() {
    const self = this;
    const countTras = self.props.countTras;
    const currentTrans = [];

    if (self.state.page > 0) {
      let p = self.state.page - 1;
      self.setState({ requesting: true, page: p });

      wallet.getTransactions(null, countTras, countTras * p).then((data) => {
        if (self.state.requesting) {
          if (data.length > 0) {
            for (let i = 0; i < data.length; i += 1) {
              currentTrans.push(data[i]);
            }
            event.emit('hide');
            self.setState({
              transactions: currentTrans,
              requesting: false,
              canAutoUpdate: false
            });
          }
        }
      }).catch((err) => {
        console.log(err);
        if (this.state.requesting) {
          event.emit('animate', lang.notificationWalletDownOrSyncing);
          self.setState({ requesting: false });
        }
      });
    } else {
      event.emit('animate', lang.transactionsNoMoreToLoad);
    }
  }

  render() {
    const h = this.props.h;
    const data = this.orderTransactions(this.state.transactions);
    const self = this;
    const today = new Date();

    return (
      <div className="transactions_table" style={{ height: h }}>
        <div className="row" style={{ marginLeft: '0', marginRight: '0' }}>
          <div className="col-md-5 trans_col">
            <p className="header">{lang.type}</p>
          </div>
          <div className="col-md-3 trans_col">
            <p className="header">{lang.amount}</p>
          </div>
          <div className="col-md-2 trans_col">
            <p className="header">{lang.status}</p>
          </div>
          <div className="col-md-2 trans_col">
            <p className="header">{lang.time}</p>
          </div>
        </div>
        {data.map((t, index) => {
          if (self.props.option === 'all'
            || self.props.option === t.category
            || self.props.option === t.confirmations
            || (self.props.option === 1 && t.confirmations > 0)
            || (self.props.option === -1 && t.confirmations < 0)) {
            let cr = '';
            if (index % 2 === 0) {
              cr = 'stripped';
            }
            const iTime = new Date(t.time * 1000);

            let delta = Math.abs(today.getTime() - iTime.getTime()) / 1000;
            const days = Math.floor(delta / 86400);
            delta -= days * 86400;
            const hours = Math.floor(delta / 3600) % 24;
            delta -= hours * 3600;
            const minutes = Math.floor(delta / 60) % 60;


            let time = '';
            if (settings.get('settings.lang') === 'fr') {
              time = `${lang.translationExclusiveForFrench} `;
            }
            if (days > 0) {
              time += `${days} `;
              if (days === 1) {
                time += lang.transactionsDay;
              } else {
                time += lang.transactionsDays;
              }
            } else if (hours > 0) {
              time += `${hours} `;
              if (hours === 1) {
                time += lang.transactionsHour;
              } else {
                time += lang.transactionsHours;
              }
            } else if (minutes === 1) {
              time += `${minutes} ${lang.transactionsMinute}`;
            } else {
              time += `${minutes} ${lang.transactionsMinutes}`;
            }

            let category = t.category;
            if (category === 'generate') {
              category = lang.stakedMin;
            }
            if (category === 'staked') {
              category = lang.staked;
            }
            else if (category === 'send') {
              category = lang.sent;
            }
            else if (category === 'receive') {
              category = lang.received;
            }
            else if (category === 'immature') {
              category = lang.immature;
            }

            return (
              <div key={`transaction_${index}_${t.txid}`}>
                <div className={`row trans_row ${cr}`}>
                  <div className="col-md-5 trans_col" onClick={self.rowClicked.bind(self, index)}>
                    <p style={{ margin: '0px' }}><span className="desc1">{category}</span><span className="desc2"> ({t.address})</span></p>
                  </div>
                  <div className="col-md-3 trans_col" onClick={self.rowClicked.bind(self, index)}>
                    <p style={{ margin: '0px' }}><span className="desc1">{t.amount} ecc</span></p>
                  </div>
                  <div className="col-md-2 trans_col" onClick={self.rowClicked.bind(self, index)}>
                    <p style={{ margin: '0px' }}>{self.renderStatus(t.confirmations)}</p>
                  </div>
                  <div className="col-md-2 trans_col" onClick={self.rowClicked.bind(self, index)}>
                    <p style={{ margin: '0px' }}><span className="desc1">{time}</span></p>
                  </div>
                  <div id={`trans_bottom_${index}`} className="col-md-12 trans_col trans_bottom">
                    <div className="col-md-8 trans_col2">
                      <p style={{ margin: '5px 0px 0px 0px' }}><span className="desc2">{lang.dateString}</span></p>
                      <p style={{ margin: '0px 0px 5px 0px' }}><span className="desc3">{(new Date(t.time * 1000)).toString()}</span></p>
                    </div>
                    <div className="col-md-4 trans_col2">
                      <p style={{ margin: '5px 0px 0px 0px' }}><span className="desc2">{lang.confirmations}</span></p>
                      <p style={{ margin: '0px 0px 5px 0px' }}><span className="desc3">{t.confirmations}</span></p>
                    </div>
                    <div className="col-md-8 trans_col2">
                      <p style={{ margin: '5px 0px 0px 0px' }}><span className="desc2">{lang.transactionId}</span></p>
                      <p style={{ margin: '0px 0px 5px 0px' }}><span className="desc3">{t.txid}</span></p>
                    </div>
                    <div className="col-md-4 trans_col2">
                      <p style={{ margin: '5px 0px 0px 0px' }}><span className="desc2">{lang.transactionFee}</span></p>
                      <p style={{ margin: '0px 0px 5px 0px' }}><span className="desc3">...</span></p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  }
}

export default TransactionTable;
