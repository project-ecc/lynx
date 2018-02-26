import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CurrentAddresses from './CurrentAddressTable';

import wallet from '../../utils/wallet';
import { traduction } from '../../lang/lang';
import ErrorService from '../../services/error.service';
import ImportPartial from './Partials/ImportPartial';

const event = require('../../utils/eventhandler');

const lang = traduction();
const { clipboard } = require('electron');


class Receive extends Component {

  static propTypes = {
    isOpened: PropTypes.bool
  };


  static defaultProps = {
    isOpened: false
  };
  constructor(props) {
    super(props);
    this.state = {
      nameOfNewAddress: '',
      theNewAddress: '',
      eccAddress: '',
      amout: '',
      isOpened: this.props.isOpened
    };
    this._handleAddressClick = this._handleAddressClick.bind(this);
    this._handleGenericFormChange = this._handleGenericFormChange.bind(this);
    this.toggleImport = this.toggleImport.bind(this);
  }

  componentWillUnmount() {
    this.state.requesting = false;
  }

  toggleImport() {
    this.setState({
      isOpened: !this.state.isOpened
    });
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
      ErrorService.handleWalletError(err, this.props.history);
      
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
    const {isOpened} = this.state;
    return (
      <div className="receive">
        <div className="row">
          <div className="col-md-12">
            <p className="title">{lang.receiveNewAddress }</p>
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
                <p className="title">{isOpened === true ? lang.importPrivKey : lang.receiveExistingAddresses }</p>
              </div>
              <div className="col-md-6">
                <button type="button" className="btn btn-default btn-sm pull-right" onClick={this.toggleImport} style={{ marginTop: '-10px', paddingTop: '10px' }}>
                  <span className="glyphicon glyphicon-plus"></span> {lang.import}
                </button>
              </div>

            </div>
            <div className="row">

              <ImportPartial isOpened={isOpened} />
            </div>
            <div className="row">
              <div className="col-md-12">
                <p className="title pull-left">{isOpened === true ? lang.receiveExistingAddresses: null }</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="panel panel-default">
                  <div className="panel-body">
                    <CurrentAddresses ref={(input) => { this.child_current_addresses = input; }} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Receive;
