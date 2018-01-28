import React, { Component } from 'react';
import CurrentAddresses from './CurrentAddressTable';
import low from '../../utils/low';
import Wallet from '../../utils/wallet';
import { traduction } from '../../lang/lang';

const event = require('../../utils/eventhandler');

const lang = traduction();
const wallet = new Wallet();
const { clipboard } = require('electron');


class Receive extends Component {

  constructor(props) {
    super(props);
    this.state = {
      nameOfNewAddress: '',
      theNewAddress: '',
      eccAddress: '',
      amout: ''
    };
    this._handleAddressClick = this._handleAddressClick.bind(this);
    this._handleGenericFormChange = this._handleGenericFormChange.bind(this);
  }

  componentWillUnmount() {
    this.state.requesting = false;
  }

  _handleAddressClick() {
    const self = this;
    let name;

    if (self.state.nameOfNewAddress === ''){
      name = null;
    } else {
      name = self.state.nameOfNewAddress;
    }

    self.setState({ requesting: true });

    wallet.createNewAddress(name).then((newAddress) => {
      self.setState({ requesting: false, nameOfNewAddress: '' });
      event.emit('animate', lang.notificationAddressCopiedToClipboard);
      clipboard.writeText(newAddress);
      self.child_current_addresses.getAllAddresses();
    }).catch((err) => {
      if (this.state.requesting) {
        self.setState({ requesting: false, nameOfNewAddress: '' });
        event.emit('animate', lang.notificationErrorCreatingAdrress);
      }
    });

  }

  _handleGenericFormChange(event) {
    const name = event.target.name;
    const value = event.target.value;
    this.setState({ [name]: value });
  }

  render() {
    return (
      <div className="receive">
        <div className="row">
          <div className="col-md-12">
            <p className="title">{lang.receiveNewAdress}</p>
            <div className="panel panel-default">
              <div className="panel-body">
                <div className="input-group">
                  <span className="input-group-btn" style={{ paddingLeft: '0px' }}>
                    <button className="greenBtn btn btn-success btn-raised" type="button" onClick={this._handleAddressClick}>{lang.receiveCreateNewAdress}</button>
                  </span>
                  <div>
                    <input
                      className="inpuText form-control"
                      onChange={this._handleGenericFormChange}
                      value={this.state.nameOfNewAddress}
                      name="nameOfNewAddress"
                      placeholder={lang.receiveAdressNameOptional}
                      type="text"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <p className="title">{lang.receiveExistingAddresses}</p>
            <div className="panel panel-default">
              <div className="panel-body">
                <CurrentAddresses ref={(input) => { this.child_current_addresses = input; }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Receive;
