import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactLoading from 'react-loading';
import WalletService from '../../services/wallet.service';
import { getErrorFromCode } from '../../services/error.service';
import { traduction } from '../../lang/lang';
import wallet from '../../utils/wallet';

const event = require('../../utils/eventhandler');
const remote = require('electron').remote;
const appVersion = require('../../../package.json').version;
const config = require('../../../config');
const dialog = remote.require('electron').dialog;
const lang = traduction();

class StatusPage extends Component {
  static propTypes = {
    version: PropTypes.number,
    subversion: PropTypes.string,
    paytxfee: PropTypes.number,
    relayfee: PropTypes.number,
    blocks: PropTypes.number,
    headers: PropTypes.number,
    bestblockhash: PropTypes.string,
    difficulty: PropTypes.number,
    moneysupply: PropTypes.number,
    staking: PropTypes.bool,
    encrypted: PropTypes.bool,
    unlocked_until: PropTypes.number,
  };
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      pass1: '',
      pass2: '',
      dialog: false,
      passStrength: lang.backup1PasswordWeak,
      passEqual: '',
      passValidated: false,
      passPhraseError: '',
      currPass: '',
      changePassRequesting: false,
      loading: false
    };
    this.onClickBackupLocation = this.onClickBackupLocation.bind(this);
    this.encryptWallet = this.encryptWallet.bind(this);
    this.openModalForEncryption = this.openModalForEncryption.bind(this);
    this.openModalToChangePassword = this.openModalToChangePassword.bind(this);
    this.cancelModal = this.cancelModal.bind(this);
    this.checkIfEncrypted = this.checkIfEncrypted.bind(this);
    this._handleGenericFormChange = this._handleGenericFormChange.bind(this);
  }

  componentDidMount() {
    this.props.getInfoGet;
  }

  _handleGenericFormChange(event) {
    const name = event.target.name;
    const value = event.target.value;
    this.setState({
      [name]: value
    });
  }

  checkIfEncrypted(){
    wallet.help().then((data) => {
      if (data.indexOf('walletlock') > -1) {
        return true;
      } else {
        return false;
      }
    }).catch((err) => {
      console.log("error checking if encrypted: ", err);
      var self = this;
      setTimeout(function(){
        self.checkIfEncrypted();
      }, 1000);
    });
  }
  async encryptWallet(){

    let message = ''
    this.setState({
      passPhraseError: ''
    })

    if(this.state.changePassRequesting){
      // Change password
      if (this.state.pass1 !== this.state.pass2){
        this.setState({
          passPhraseError: 'Passwords do not match'
        })
        return;
      }

      this.setState({
        loading: true
      })

      try {
        const result = await wallet.walletChangePassphrase(this.state.currPass, this.state.pass1);

        if(result === null){
          message = 'Password changed!';
        }
        else if(result.code && result.code === -14) {
          this.setState({
            passPhraseError: 'Wallet Passphrase Incorrect',
            loading: false
          })
          return;
        }
        console.log(result)

      } catch (e) {
        console.log(e)
        this.setState({
          passPhraseError: 'An Error Occured',
          loading: false
        })
        return;
      }
    } else {
      // set password
      if (this.state.pass1 !== this.state.pass2){
        this.setState({
          passPhraseError: 'Passwords do not match'
        })
        return;
      }

      this.setState({
        loading: true
      })

      try {
        const result = await wallet.encryptWallet(this.state.pass1);
        console.log(result)
        message = 'Wallet Encrypted';
      } catch (e) {
        console.log(e)
        this.setState({
          passPhraseError: 'An Error Occured',
          loading: false
        })
        return;
      }
    }

    this.setState({
      loading: false,
      dialog: false,
      passPhraseError: ''
    })

    event.emit('animate', message);
  }

  openModalForEncryption(){
    this.setState({
      dialog: true
    })
  }
  openModalToChangePassword(){
    this.setState({
      dialog: true,
      changePassRequesting: true
    })
  }

  cancelModal(){
    this.setState({
      dialog: false,
      changePassRequesting: false
    })
  }

  onClickBackupLocation() {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, (folderPaths) => {
      if (folderPaths === undefined) {
        event.emit('animate', lang.noFolderSelected);
        return;
      }

      WalletService.backupWallet(`${folderPaths}/walletBackup.dat`).then((data) => {
        if(data === null) {
          event.emit('animate', lang.backupOk);
        } else {
          event.emit('animate', getErrorFromCode(data.code, data.message));
        }
      }).catch((err) => {
        event.emit('animate', getErrorFromCode(-99));
      });
    });
  }

  renderDialog(){
    if (!this.state.dialog) {
      return null;
    }
    return (
      <div className="mancha">
        <div className="dialog">
          <div className="header">
            <p className="title">Encrypt Wallet</p>
            {this.state.loading ? <ReactLoading className="loading" type="bars" color="#444"/> : null}
          </div>
          <div className="body">
            {this.state.changePassRequesting ? <div className="row">
              <div className="col-md-10 col-md-offset-1 input-group">
                <input className="form-control inputText" name="currPass" type="password" onChange={this._handleGenericFormChange} placeholder={lang.currentPassword} />
              </div>
            </div> : null}
            <div className="row">
              <div className="col-md-10 col-md-offset-1 input-group">
                <input className="form-control inputText" name="pass1" type="password" onChange={this._handleGenericFormChange} placeholder={lang.walletPassPhrase} />
              </div>
            </div>
            <div className="row">
              <div className="col-md-10 col-md-offset-1 input-group">
                <input className="form-control inputText" name="pass2" type="password" onChange={this._handleGenericFormChange} placeholder={lang.walletPassPhraseConfirm} />
              </div>
              <p className="passPhraseError">{this.state.passPhraseError}</p>
            </div>
          </div>
          <div className="footer">
            <p className="button btn_cancel" onClick={this.cancelModal}>{lang.cancel}</p>
            <p className="button btn_confirm" onClick={this.encryptWallet}>{lang.confirm}</p>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <div className="row stauts-row status-panel-bottom">
          <div className="col-sm-6 col-md-6 col-lg-6 status-panel">
            <p className="title">{config.guiName} Status</p>
            <p>Version: {appVersion}</p>
          </div>
          <div className="col-sm-6 col-md-6 col-lg-6 status-panel">
            <p className="title">{config.coinName} Node Status</p>
            <p>Version: {`${this.props.version}`}</p>
            <p>Subversion: {`${this.props.subversion}`}</p>
            <p>Pay Tx Fee: {`${this.props.paytxfee}`}</p>
            <p>Relay Fee: {`${this.props.relayfee}`}</p>
          </div>
        </div>
        <div className="row status-row status-panel-bottom">
          <div className="col-md-12 col-md-12 col-lg-12 status-panel">
            <p className="title">{config.coinName} Network Status</p>
            <p>Blocks: {`${this.props.blocks}`}</p>
            <p>Headers: {`${this.props.headers}`}</p>
            <p>Best Block Hash: {`${this.props.bestblockhash}`}</p>
            <p>Difficulty: {`${this.props.difficulty}`}</p>
            <p>Available Rewards: {25000000000 - `${this.props.moneysupply}`}</p>
          </div>
        </div>
        <div className="row status-row">
          <div className="col-md-12 col-md-12 col-lg-12 status-panel">
            <p className="title">{config.coinName} Wallet Status</p>
            <p>Staking: {`${this.props.staking}`}</p>
            <p>Encrypted: {`${this.props.encrypted}`} {!this.props.encrypted ? <button className="button btn_confirm" onClick={this.openModalForEncryption}>Encrypt Wallet</button> : <button className="button btn_confirm" onClick={this.openModalToChangePassword}>Change Wallet Password</button>}</p>

          </div>
        </div>
        {this.renderDialog()}
      </div>
    );
  }
}
export default StatusPage;
