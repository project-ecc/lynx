import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import glob from 'glob';
import wallet from '../../utils/wallet';
import WalletService from '../../services/wallet.service';
import {handleWalletError} from '../../services/error.service';
import { traduction } from '../../lang/lang';

const event = require('../../utils/eventhandler');
const remote = require('electron').remote;
const { clipboard } = require('electron');
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
    inboundpeers: PropTypes.number,
    outboundpeers: PropTypes.number,
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
      passStrength: lang.backup1PasswordWeak,
      passEqual: '',
      passValidated: false,
      currPass: '',
      newPass: '',
      reenteredNewPass: '',
      changePassRequesting: false,
      walletAddress: '' 
    };
  }

    checkIfWalletEncrypted = this.checkIfWalletEncrypted.bind(this);
    scorePassword = this.scorePassword.bind(this);
    onChangePass1 = this.onChangePass1.bind(this);
    onChangePass2 = this.onChangePass2.bind(this);
    onClickNext1 = this.onClickNext1.bind(this);
    onClickNext2 = this.onClickNext2.bind(this);
    onClickBack = this.onClickBack.bind(this);
    onClickBackupLocation = this.onClickBackupLocation.bind(this);
    renderCircle = this.renderCircle.bind(this);
    renderPageStep = this.renderPasswordStep.bind(this);
    changePassword = this.changePassword.bind(this);
    handleCurrPassChange = this.handleCurrPassChange.bind(this);
    handleNewPassChange = this.handleNewPassChange.bind(this);
    handleNewPassReenterChange = this.handleNewPassReenterChange.bind(this);
    clearPassResetState = this.clearPassResetState.bind(this);

  componentDidMount() {
    this.checkIfWalletEncrypted();
  }

  checkIfWalletEncrypted() {
    const self = this;
    wallet.help().then((data) => {
      // console.log(data);
      if (data.indexOf('walletlock') > -1) {
        self.setState({ step: 3 });
      } else {
        self.setState({ step: 1 });
      }
    }).catch((err) => {
      handleWalletError(err, this.props.history);
    });
  }

  scorePassword(pass) {
    let score = 0;
    if (!pass) {
      return score;
    }

    // award every unique letter until 5 repetitions
    const letters = {};
    for (let i = 0; i < pass.length; i += 1) {
      letters[pass[i]] = (letters[pass[i]] || 0) + 1;
      score += 5.0 / letters[pass[i]];
    }

    // bonus points for mixing it up
    const variations = {
      digits: /\d/.test(pass),
      lower: /[a-z]/.test(pass),
      upper: /[A-Z]/.test(pass),
      nonWords: /\W/.test(pass),
    };

    let variationCount = 0;
    for (const check in variations) {
      variationCount += (variations[check] === true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;

    return parseInt(score);
  }

  onChangePass1(event) {
    const score = this.scorePassword(event.target.value);
    let aux = lang.backup1PasswordWeak;
    if (score > 80) {
      aux = lang.backup1PasswordStrong;
    } else if (score > 60) {
      aux = lang.backup1PasswordGood;
    }
    this.setState({ pass1: event.target.value, passStrength: aux });
  }

  onChangePass2(event) {
    this.setState({ pass2: event.target.value });
  }

  onClickNext1() {
    if (this.state.pass1.length <= 0) {
      event.emit('animate', lang.invalidFields);
    } else {
      this.setState({ step: 2, pass2: '', passEqual: '' });
    }
  }

  onClickNext2() {
    const self = this;
    if (this.state.pass2.length <= 0) {
      event.emit('animate', lang.invalidFields);
    } else if (this.state.pass1 !== this.state.pass2) {
      this.setState({ passEqual: lang.backup2PasswordsDontMatch });
    } else {
      wallet.encryptWallet(self.state.pass2).then((data) => {
        if (data.code === -1) {
          event.emit('animate', lang.walletEncryptedError);
        } else {
          self.setState({ step: 3 });
          event.emit('animate', lang.walletEncrypted);
        }
      }).catch((err) => {
        event.emit('animate', err);
      });
    }
  }

  onClickBack() {
    this.setState({ step: 1, pass1: '', passStrength: '' });
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
          event.emit('animate', ErrorService.getErrorFromCode(data.code, data.message));
        }
      }).catch((err) => {
        event.emit('animate', ErrorService.getErrorFromCode(-99));
      });
    });
  }

  renderCircle(opt) {
    if (this.state.step === opt) {
      return 'circle_active';
    }
    return null;
  }

  handleCurrPassChange(event) {
    this.setState({ currPass: event.target.value });
  }

  handleNewPassChange(event) {
    const score = this.scorePassword(event.target.value);
    let aux = lang.backup1PasswordWeak;
    if (score > 80) {
      aux = lang.backup1PasswordStrong;
    } else if (score > 60) {
      aux = lang.backup1PasswordGood;
    }
    this.setState({ newPass: event.target.value, passStrength: aux });
  }

  handleNewPassReenterChange(event) {
    this.setState({
      reenteredNewPass: event.target.value,
      passValidated: event.target.value === this.state.newPass && this.state.currPass
    });
  }

  changePassword() {
    this.setState({ changePassRequesting: true });
    WalletService.changePassphase(this.state.currPass, this.state.newPass)
      .then((response) => {
        if (response !== null) {
          const message = ErrorService.getErrorFromCode(response.code);
          event.emit('animate', message);
          this.clearPassResetState();
        } else {
          this.setState({
            currPass: '',
            newPass: '',
            reenteredNewPass: '',
            passValidated: false,
            changePassRequesting: false,
            passStrength: lang.backup1PasswordWeak,
          });
          event.emit('show', 'Passphrase changed successfully.');
          setTimeout(() => {
            event.emit('hide');
          }, 2500);
        }
      })
      .catch(err => {
        this.clearPassResetState();
        console.error(err);
        return event.emit('show', err);
      });
  }

  clearPassResetState() {
    this.setState({
      currPass: '',
      newPass: '',
      reenteredNewPass: '',
      passValidated: false,
      changePassRequesting: false
    });
  }

  renderPasswordStep() {
    if (this.state.step === 1) {
      let passColor = '#f44336';

      if (this.state.passStrength === lang.backup1PasswordGood) {
        passColor = '#ffc107';
      } else if (this.state.passStrength === lang.backup1PasswordStrong) {
        passColor = '#4caf50';
      }

      return (
        <div className="page">
          <p className="title">{lang.backup1CreateYourPassword}</p>
          <p className="desc">{lang.backup1Warning1} <span className="desc_green">{lang.backup1Warning2Green}</span> {lang.backup1Warning3}</p>
          <input className="input" placeholder={lang.typeYourPassword} type="password" value={this.state.pass1} onChange={this.onChangePass1} />
          <p style={{ color: passColor }} className="desc_pass">{this.state.passStrength}</p>
          <p className="nextButton" onClick={this.onClickNext1.bind(this)}>{lang.backupNext}</p>
        </div>
      );
    } else if (this.state.step === 2) {
      return (
        <div className="page">
          <p className="title">{lang.backup2TitleBold}</p>
          <p className="desc">{lang.backup2Warning1} <span className="desc_green">{lang.backup2Warning2Green}</span> {lang.backup2Warning3}</p>
          <input className="input" placeholder={lang.typeYourPassword} type="password" value={this.state.pass2} onChange={this.onChangePass2} />
          <p className="desc_pass">{this.state.passEqual}</p>
          <p className="nextButton left" onClick={this.onClickBack.bind(this)}>{lang.backupBack}</p>
          <p className="nextButton right" onClick={this.onClickNext2.bind(this)}>{lang.backupNext}</p>
        </div>
      );
    } else if (this.state.step === 3) {
      let passColor = '#f44336';
      let equalColor = '#ff4336';

      if (this.state.passStrength === lang.backup1PasswordWeak) {
        passColor = '#f44336';
        equalColor = '#ff4336';
      } else if (this.state.passStrength === lang.backup1PasswordGood) {
        passColor = '#ffc107';
      } else if (this.state.passStrength === lang.backup1PasswordStrong) {
        passColor = '#4caf50';
      }

      if (this.state.passValidated) {
        equalColor = '#4caf50';
      }

      return (
        <div className="page">
          <p className="title">{lang.backup3TitleBold}</p>
          <p className="desc">{lang.backup3Message1}</p>
          <p className="desc">You may also change your password any time by filling in the fields below and pressing the "Change Passphrase" button.</p>
          <p className="desc">{lang.backup3Message4}</p>
          <div>
            <input value={this.state.currPass} onChange={this.handleCurrPassChange} type="password" className="passwordInput" placeholder="Current passphrase" />
            <input value={this.state.newPass} onChange={this.handleNewPassChange} type="password" className="passwordInput" placeholder="New passphrase" />
            <input value={this.state.reenteredNewPass} onChange={this.handleNewPassReenterChange} type="password" className="passwordInput" placeholder="Re-enter new passphrase" />
          </div>
          <div><p style={{ color: passColor }} className="desc_pass">{this.state.passStrength}</p></div>
          <div>
            <p
              style={{ color: equalColor }}
              className="desc_pass"
            >
              {this.state.currPass
                ? (this.state.reenteredNewPass
                  ? (this.state.passValidated
                    ? 'Passphrases match' : 'Passphrases do not match')
                  : 'Please fill out new passphrase fields')
                : 'Current passphrase field is empty'
              }
            </p>
          </div>
          <button
            className={`${!this.state.passValidated || this.state.changePassRequesting ? '-passButtonDisabled' : 'changePassButton '}`}
            disabled={!this.state.passValidated || this.state.changePassRequesting}
            onClick={this.changePassword}
          >
            Change Passphrase
          </button>

          <div className="row">
            <div className="col-md-12">
              <div className="col-md-6">
                <p className="desc -space-top">{lang.backup3Message2}
                  <span className="desc_green"> {lang.backup3Message3Green}</span>
                </p>
                <button className="nextButton" onClick={this.onClickBackupLocation}>{lang.backup3SetBackupLocation}</button>

              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  render() {
    console.log(this.props);
    return (
      <div>
        <p className="title">{config.guiName} Status</p>
        <p>Version: {appVersion}</p>
        <p>Release Date:</p>

        <p className="title">{config.coinName} Node Status</p>
        <p>Version: {`${this.props.version}`}</p>
        <p>Subversion: {`${this.props.subversion}`}</p>
        <p>Release Date: </p>
        <p>Pay Tx Fee: {`${this.props.paytxfee}`}</p>
        <p>Relay Fee: {`${this.props.relayfee}`}</p>

        <p className="title">{config.coinName} Network Status</p>
        <p>Blocks: {`${this.props.blocks}`}</p>
        <p>Headers: {`${this.props.headers}`}</p>
        <p>Best Block Hash: {`${this.props.bestblockhash}`}</p>
        <p>Difficulty: {`${this.props.difficulty}`}</p>
        <p>Inbound Peers: {`${this.props.inboundpeers}`}</p>
        <p>Outbound Peers: {`${this.props.outboundpeers}`}</p>
        <p>Available Staking Rewards: {`${this.props.moneysupply}`} - 25000000000</p>

        <p className="title">{config.coinName} Wallet Status</p>
        <p>Staking: {`${this.props.staking}`}</p>
        <p>Encrypted: {`${this.props.encrypted}`}</p>
        <p>{lang.backup1CreateYourPassword}</p>
        <p>{this.state.step ? `${lang.backup1Step} ${this.state.step} ${lang.conjuctionOf} 3` : null}</p>
          {this.renderPageStep()}
        <div className="tip">
          <p className="tip_title">{lang.backupTipBold}</p>
          <p className="tip_desc">{lang.backupTipMessage}</p>
        </div>
      </div>
    );
  }
}
export default StatusPage;
