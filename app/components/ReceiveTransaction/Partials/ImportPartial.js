import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { traduction } from '../../../lang/lang';
import WalletService from '../../../services/wallet.service';
import { isImportingPrivateKey } from '../../../reducers/WalletReducer';
const lang = traduction();
const event = require('../../../utils/eventhandler');
import SmoothCollapse from 'react-smooth-collapse';
var Loader=require('react-loader-display').loader;

// const dialog = require('electron').remote.require('electron').dialog;

class ImportPartial extends React.Component {
  static propTypes = {
    isOpened: PropTypes.bool,
    isImportingDux: PropTypes.func,
    importingKey: PropTypes.bool
  };

  static defaultProps = {
    isOpened: false
  };

  constructor(props) {
    super(props);
    this.state = {
      importingKey: this.props.importingKey,
      isOpened: this.props.isOpened,
      privateKey: ''
    };
    // this.importWallet = this.importWallet.bind(this);
    this._handleGenericFormChange = this._handleGenericFormChange.bind(this);
    this.importPrivateKey = this.importPrivateKey.bind(this);
    this.checkDaemonStatus = this.checkDaemonStatus.bind(this);
    this.failedToImportAddress = this.failedToImportAddress.bind(this);
    this.successfullyImportedAddress = this.successfullyImportedAddress.bind(this);
  }

  // importWallet() {
  //   dialog.showOpenDialog({
  //     properties: ['openFile'],
  //     filters: [
  //       {name: 'data', extensions: ['dat']}
  //     ]
  //   }, (file) => {
  //     if (file === undefined) {
  //       event.emit('animate', lang.noFolderSelected);
  //       return;
  //     } else {
  //       WalletService.importWallet(String(file)).then((response) => {
  //         if (response === null) {
  //           event.emit('animate', 'Wallet Imported');
  //         } else {
  //           event.emit('animate', 'An Error Occurred');
  //         }
  //         return true;
  //       }).catch((error) => {
  //         console.log(error);
  //       });
  //     }
  //   });
  // }

  _handleGenericFormChange(event) {
    const name = event.target.name;
    const value = event.target.value;
    this.setState({ [name]: value });
  }

  checkDaemonStatus () {
    const self = this;
    WalletService.checkDaemonStatus().then((data) => {
      this.successfullyImportedAddress();
    }).catch((error) => {
      setTimeout(() =>{
        self.checkDaemonStatus();
      }, 1000)
    })
  }

  failedToImportAddress(message = null) {
    event.emit('animate', lang.failedToImportAddress + " " + message);
    this.refs.loader.HideLoading();
  }

  successfullyImportedAddress() {
    const { isImportingDux } = this.props;
    this.refs.loader.HideLoading();
    isImportingDux({
      importingKey: false
    });
    this.state.privateKey = '';
    this.props.isOpened = false;
    event.emit('animate', lang.keyImported);
  }

  importPrivateKey() {
    console.log('ere')
    const { isImportingDux } = this.props;
    this.state.importingKey = true;
    this.refs.loader.ShowLoading();
    WalletService.importPrivateKey(String(this.state.privateKey)).then((response) => {
      if (response === null) {
        isImportingDux({
          importingKey: true
        });
        this.checkDaemonStatus();
        event.emit('animate', lang.keyImported);
      } else if (response[0].code === "-28") {
        setTimeout(() => {
          this.importPrivateKey();
        }, 100);
      } else {
        this.failedToImportAddress();
      }
    }).catch((error) => {
      console.log(error.code);
      if(error.code ===  "ECONNREFUSED") {
        this.failedToImportAddress();
      } else if (error.code === "ESOCKETTIMEDOUT") {
        isImportingDux({
          importingKey: true
        });
        this.checkDaemonStatus();
      } else {
        if(error.status){
          const message = WalletService.processErrorCode(error.status);
          this.failedToImportAddress(message);
          event.emit('animate', message);
        } else {
          console.log(error);
        }
      }
    });
  }

  render() {
    return (
      <div>
          <div className="col-md-12">
            <SmoothCollapse expanded={this.props.isOpened}>
              <div className="contents">
                <div className="panel panel-default">
                  <div className="panel-body">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="col-md-8">
                          <div>
                            <input
                              className="inpuText form-control"
                              onChange={this._handleGenericFormChange}
                              value={this.state.privateKey}
                              name="privateKey"
                              placeholder="Insert Private key"
                              type="text"
                              ref="key"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">

                          <button className="greenBtn btn btn-success btn-raised pull-right" type="button" onClick={this.importPrivateKey} >{lang.importPrivKey}</button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </SmoothCollapse>
          </div>
        <Loader
          ref="loader"
          IsLoading={this.state.importingKey}
          LoadingImage="http://bestanimations.com/Science/Gears/loadinggears/gear-animation-5.gif"
          ZIndex={100}
          LoaderMessage={lang.importingKey}
          BackDropRGBA="rgba(0,0,0,0.2)"
          ForeGroundColor="white"
          TextColor="black"
          DisplayType="FadeIn"
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    importingKey: state.wallet.importingKey
  };
};

const mapActionsToProps = dispatch => {
  return {
    isImportingDux: (data) => {
      dispatch(isImportingPrivateKey(data));
    }
  };
};

export default connect(mapStateToProps, mapActionsToProps)(ImportPartial);
