import React, { Component } from 'react';
import { Collapse } from 'react-collapse';
import PropTypes from 'prop-types';
import { traduction } from '../../../lang/lang';
import WalletService from '../../../services/wallet.service';
const lang = traduction();
const event = require('../../../utils/eventhandler');


const dialog = require('electron').remote.require('electron').dialog;


class ImportPartial extends Component {
  static propTypes = {
    isOpened: PropTypes.bool
  };

  static defaultProps = {
    isOpened: false
  };

  constructor(props) {
    super(props);
    this.state = {
      isOpened: this.props.isOpened,
      privateKey: ''
    };
    this.importWallet = this.importWallet.bind(this);
    this._handleGenericFormChange = this._handleGenericFormChange.bind(this);
    this.importPrivateKey = this.importPrivateKey.bind(this);
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

  importPrivateKey() {
    WalletService.importPrivateKey(String(this.state.privateKey)).then((response) => {
      if (response === null) {
        event.emit('animate', 'Key Imported (rescan started)');
      } else {
        event.emit('animate', 'An Error Occurred');
      }
      return true;
    }).catch((error) => {
      event.emit('animate', error.message);
      console.log(error);
    });
    this.state.privateKey = '';
    this.refs.key.value = '';
  }

  render() {

    return (
      <div>
        <Collapse isOpened={this.props.isOpened}>
          <div className="row">
            <div style={{ marginLeft: '15px' }} className="col-md-12">
              <div className="panel panel-default">
                <div className="panel-body">
                  <div className="col-md-12">
                      <div className="col-md-4 col-sm-2">
                        <div>
                          <input
                            ref="key"
                            className="inputText form-control"
                            onChange={this._handleGenericFormChange}
                            value={this.state.privateKey}
                            name="privateKey"
                            placeholder="Insert Private key"
                            type="text"
                          />
                        </div>
                      </div>
                      <div className="col-md-2 col-sm-1">
                        <span className="input-group-btn" style={{ paddingLeft: '0px' }}>
                          <button className="greenBtn btn btn-success btn-raised" type="button" onClick={this.importPrivateKey} >{lang.importPrivKey}</button>
                        </span>
                      </div>
                    <div className="col-md-6 col-sm-3">
                      <p style={{ color: '#000' }}>Hi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Collapse>
      </div>
    );
  }
}

export default ImportPartial;
