import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import glob from 'glob';
import wallet from '../../utils/wallet';
import WalletService from '../../services/wallet.service';
import { getErrorFromCode } from '../../services/error.service';
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
    this.onClickBackupLocation = this.onClickBackupLocation.bind(this);
  }

  componentDidMount() {
    this.props.getInfoGet;
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
            <p>Encrypted: {`${this.props.encrypted}`}</p>
          </div>
        </div>
      </div>
    );
  }
}
export default StatusPage;
