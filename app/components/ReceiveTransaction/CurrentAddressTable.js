import React, { Component } from 'react';
import Wallet from '../../utils/wallet';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
const event = require('../../utils/eventhandler');
import glob from 'glob';
const lang = traduction();
const wallet = new Wallet();
const { clipboard } = require('electron');

class CurrentAddresses extends Component {
  constructor(props) {
    super(props);
    this.state = {
      existingAddresses: []
    };
    this.rowClick = this.rowClick.bind(this);
  }

  componentDidMount(){
    if (!this.state.requesting) {
      this.getAllAddresses();
    }
  }

  componentWillUnmount() {
    this.state.requesting = false;
  }


  rowClick(address) {
    event.emit('animate', lang.notificationAddressCopiedToClipboard);
    clipboard.writeText(address);
  }


  getAllAddresses() {
    const self = this;
    self.setState({ requesting: true });
    wallet.listAllAccounts().then((data) => {
      this.setState({ existingAddresses: data, requesting: false });
    }).catch((err) => {
      if (err.message === 'connect ECONNREFUSED 127.0.0.1:19119') {
        glob(`${homedir}/.eccoin-wallet/Eccoind*`, (error, files) => {
          if (!files.length) {
            event.emit('show', 'Install wallet by clicking the button in the bottom left.');
          } else {
            event.emit('show', 'Wallet not running.');
          }
        });
      } else if (err.message !== 'Loading block index...') {
        event.emit('animate', err.message);
      }
      if (this.state.requesting) {
        self.setState({ requesting: false });
      }
    });
  }

  render() {
    const self = this;
    let data = [];
    if (this.state.existingAddresses !== null){
      data = this.state.existingAddresses;
    }
    return (
      <div>
        <div className="addresses_table">
          <div className="row" style={{ marginLeft: '0', marginRight: '0' }}>
            <div className="col-md-2 trans_col">
              <p className="header">{lang.account}</p>
            </div>
            <div className="col-md-5 trans_col">
              <p className="header">{lang.address}</p>
            </div>
            <div className="col-md-3 trans_col">
              <p className="header">{lang.amount}</p>
            </div>
            <div className="col-md-2 trans_col">
              <p className="header">{lang.confirmations}</p>
            </div>
          </div>
          {data.map((address, index) => {
            let cr = '';
            if (index % 2 === 0) {
              cr = 'stripped';
            }
            return (
              <div key={`address_${index}`} onClick={self.rowClick.bind(self, address.address)}>
                <div className={`row trans_row ${cr}`}>
                  <div className="col-md-2 trans_col">
                    <p style={{ margin: '0px' }}><span className="desc1">{address.account}</span></p>
                  </div>
                  <div className="col-md-5 trans_col">
                    <p style={{ margin: '0px' }}><span className="desc1">{address.address}</span></p>
                  </div>
                  <div className="col-md-3 trans_col">
                    <p style={{ margin: '0px' }}><span className="desc1">{address.amount}</span></p>
                  </div>
                  <div className="col-md-2 trans_col">
                    <p style={{ margin: '0px' }}><span className="desc1">{address.confirmations}</span></p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default CurrentAddresses;
