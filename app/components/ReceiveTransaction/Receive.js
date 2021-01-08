import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CurrentAddresses from './CurrentAddressTable';

import wallet from '../../utils/wallet';
import { traduction } from '../../lang/lang';
import { handleWalletError } from '../../services/error.service';

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
      theNewAddress: '',
      address: '',
      amout: '',
      isOpened: this.props.isOpened
    };
    this._handleAddressClick = this._handleAddressClick.bind(this);
    this._handleGenericFormChange = this._handleGenericFormChange.bind(this);
  }

  componentWillUnmount() {
    this.state.requesting = false;
  }

  _handleAddressClick() {
    const self = this;
    let name = null;

    self.setState({ requesting: true });

    wallet.createNewAddress().then((newAddress) => {
      self.setState({ requesting: false, newAddress: newAddress});
      event.emit('animate', lang.notificationAddressCopiedToClipboard);
      clipboard.writeText(newAddress);
      self.child_current_addresses.getAllAddresses();
    }).catch((err) => {
      handleWalletError(err, this.props.history);

      if (this.state.requesting) {
        self.setState({ requesting: false,});
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
    const { isOpened } = this.state;
    return (
      <div className="receive">
        <div className="row">
          <div className="col-md-12">
            <p className="title">{lang.receiveNewAddress }</p>
            <div className="panel panel-default">
              <div className="panel-body">
                <div className="input-group">
                  <span className="input-group-btn" style={{ paddingLeft: '0px' }}>
                    <button className="orangeButton btn btn-raised" type="button" onClick={this._handleAddressClick}>{lang.receiveCreateNewAddress}</button>
                  </span>
                  <p>{this.state.newAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="row">
              <div className="col-md-12">
                <p className="title pull-left">{isOpened === true ? lang.receiveExistingAddresses : null }</p>
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
