import React, { Component } from 'react';
import wallet from '../../utils/wallet';
import { traduction } from '../../lang/lang';
import { handleWalletError } from '../../services/error.service';

const event = require('../../utils/eventhandler');

const lang = traduction();

const { clipboard } = require('electron');

class CurrentAddresses extends Component {
  constructor(props) {
    super(props);
    this.state = {
      existingAddresses: []
    };
    this.rowClick = this.rowClick.bind(this);
  }

  componentDidMount() {
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
    wallet.listaddresses().then((data) => {
      this.setState({ existingAddresses: data, requesting: false });
    }).catch((err) => {
      handleWalletError(err, this.props.history);

      if (this.state.requesting) {
        self.setState({ requesting: false });
      }
    });
  }

  render() {
    const self = this;
    let data = [];
    if (this.state.existingAddresses !== null) {
      data = this.state.existingAddresses;
    }
    return (
      <div>
        <div className="addresses_table">
          <div className="row" style={{ marginLeft: '0', marginRight: '0' }}>
            <div className="col-md-5 trans_col">
              <p className="header">{lang.address}</p>
            </div>
          </div>
          {data.map((address, index) => {
            let cr = '';
            if (index % 2 === 0) {
              cr = 'stripped';
            }
            return (
              <div key={`address_${index}`} onClick={self.rowClick.bind(self, address)}>
                <div className={`row trans_row ${cr}`}>
                  <div className="col-md-5 trans_col">
                    <p style={{ margin: '0px' }}><span className="desc1">{address}</span></p>
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
