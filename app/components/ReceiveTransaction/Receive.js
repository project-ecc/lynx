import React, { Component } from 'react';
import CurrentAddresses from './CurrentAddressTable';
import low from '../../utils/low';
import WalletService from '../../services/wallet.service';
import wallet from '../../utils/wallet';
import { traduction } from '../../lang/lang';

const event = require('../../utils/eventhandler');

const lang = traduction();
const { clipboard } = require('electron');
const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;

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
    this.importWallet = this.importWallet.bind(this);
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

  importWallet() {
    dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        {name: 'data', extensions: ['dat']}
      ]
    }, (file) => {
      if (file === undefined) {
        event.emit('animate', lang.noFolderSelected);
        return;
      } else {
        WalletService.importWallet(String(file)).then((response) => {
          if (response == null) {
            event.emit('animate', 'Wallet Imported');
          } else {

            event.emit('animate', 'An Error Occurred');
          }
          return true;
        }).catch((error) => {
          console.log(error);
        });
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
            <p className="title">{lang.receiveNewAddress}</p>
            <div className="panel panel-default">
              <div className="panel-body">
                <div className="input-group">
                  <span className="input-group-btn" style={{ paddingLeft: '0px' }}>
                    <button className="greenBtn btn btn-success btn-raised" type="button" onClick={this._handleAddressClick}>{lang.receiveCreateNewAddress}</button>
                  </span>
                  <div>
                    <input
                      className="inpuText form-control"
                      onChange={this._handleGenericFormChange}
                      value={this.state.nameOfNewAddress}
                      name="nameOfNewAddress"
                      placeholder={lang.receiveAddressNameOptional}
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
            <div className="row">
              <div className="col-md-6">
                <p className="title">{lang.receiveExistingAddresses}</p>
              </div>
              <div className="col-md-6">
                <button type="button" className="btn btn-default btn-sm pull-right" onClick={this.importWallet} style={{ marginTop: '-10px', paddingTop: '10px' }}>
                  <span className="glyphicon glyphicon-plus"></span> {lang.importWallet}
                </button>
              </div>
            </div>
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
