import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import WalletInstallerPartial from './Partials/WalletInstallerPartial';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { updater } from '../utils/updater';
import { traduction } from '../lang/lang';
import {getErrorFromCode} from "../services/error.service";
import WalletService from '../services/wallet.service'

const event = require('../utils/eventhandler');
const { ipcRenderer } = require('electron');
const usericon = require('../../resources/images/logo1.png');
const lockedPad = require('../../resources/images/padclose.png');
const unlockedPad = require('../../resources/images/padopen.png');

const lang = traduction();

class Sidebar extends Component {
  static propTypes = {
    startStopWalletHandler: PropTypes.func,
    starting: PropTypes.bool,
    running: PropTypes.bool,
    stopping: PropTypes.bool,
    off: PropTypes.bool,
    blocks: PropTypes.number,
    headers: PropTypes.number,
    connections: PropTypes.number,
    walletInstalled: PropTypes.bool,
  };
  constructor(props) {
    super(props);
    this.state = {
      pathname: props.route.location.pathname,
      active: {
        default: '',
        send: '',
        receive: '',
        transactions: '',
        about: '',
        wallet: '',
      },
      icons: {
        default: '',
        send: '',
        receive: '',
        transactions: '',
        about: '',
        wallet: '',
      },
      newVersionAvailable: false,
      daemonDownloading: false,
      downloadPercent: 0,
      select: 'all',
      dialog: false,
      timeL: '',
      passPhrase: '',
      stakeUnlock: false
    };

    this.checkWalletVersion = this.checkWalletVersion.bind(this);
    this.checkWalletState = this.checkWalletState.bind(this);
    this.showWalletUnlockDialog = this.showWalletUnlockDialog.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.showWalletUnlockDialog = this.showWalletUnlockDialog.bind(this);
    this.cancelDialog = this.cancelDialog.bind(this);
    this.confirmDialog = this.confirmDialog.bind(this);
    this.onPassPhraseChange = this.onPassPhraseChange.bind(this);
    this.onTimeLChange = this.onTimeLChange.bind(this);
    this.checkboxChange = this.checkboxChange.bind(this);
  }

  componentDidMount() {
    this.checkStateMenu(this.state.pathname);

    this.timerCheckWalletVersion = setInterval(() => {
      this.checkWalletVersion();
    }, 600000);

    this.checkWalletVersion();


    ipcRenderer.once('wallet-version-updated', (e, err) => {
      this.checkWalletVersion();
    });

    this.timerCheckWalletState = setInterval(() => {
      this.checkWalletState();
    }, 3000);
  }

  componentWillReceiveProps(props) {
    this.checkStateMenu(props.route.location.pathname);
    this.setState({ pathname: props.route.location.pathname });
  }

  componentWillUnmount() {
    clearInterval(this.timerCheckWalletVersion);
  }

  async checkWalletVersion() {
    try {
      const exists = await updater.checkForWalletVersion();
      if (exists) {
        updater.checkWalletVersion((result) => {
          //          this.setState(() => { return { newVersionAvailable: result, }; });
        });
      }
    } catch (err) { console.log(err); }
  }

  checkWalletState() {
    this.props.updateWalletStatus;
  }

  checkStateMenu(pathname) {
    const aLinks = this.state.active;
    const aIcons = this.state.icons;

    aLinks.default = '';
    aLinks.send = '';
    aLinks.receive = '';
    aLinks.transactions = '';
    aLinks.statuspage = '';
    aLinks.about = '';
    aLinks.settings = '';

    aIcons.default = require('../../resources/images/overview1.ico');
    aIcons.send = require('../../resources/images/send1.ico');
    aIcons.receive = require('../../resources/images/receive1.ico');
    aIcons.transactions = require('../../resources/images/trans1.ico');
    aIcons.statuspage = require('../../resources/images/backup1.ico');
    aIcons.about = require('../../resources/images/about1.ico');
    aIcons.settings = require('../../resources/images/settings1.ico');

    if (pathname === '/') {
      aLinks.default = 'sidebaritem_active';
      aIcons.default = require('../../resources/images/overview2.ico');
    } else if (pathname === '/send'){
      aLinks.send = 'sidebaritem_active';
      aIcons.send = require('../../resources/images/send2.ico');
    } else if (pathname === '/receive') {
      aLinks.receive = 'sidebaritem_active';
      aIcons.receive = require('../../resources/images/receive2.ico');
    } else if (pathname === '/transaction') {
      aLinks.transactions = 'sidebaritem_active';
      aIcons.transactions = require('../../resources/images/trans2.ico');
    } else if (pathname === '/statuspage') {
      aLinks.statuspage = 'sidebaritem_active';
      aIcons.statuspage = require('../../resources/images/backup2.ico');
    } else if (pathname === '/about') {
      aLinks.about = 'sidebaritem_active';
      aIcons.about = require('../../resources/images/about2.ico');
    } else if (pathname === '/settings') {
      aLinks.settings = 'sidebaritem_active';
      aIcons.settings = require('../../resources/images/settings2.ico');
    }

    this.setState({ active: aLinks, icons: aIcons });
  }

  renderRectRound(opt) {
    if (opt === this.state.pathname) {
      return (
        <div className="rectround" />
      );
    }
    return null;
  }

  handleChange(event) {
    this.setState({ select: event.target.value });
  }

  onPassPhraseChange(event) {
    this.setState({ passPhrase: event.target.value });
  }

  onTimeLChange(event) {
    this.setState({ timeL: event.target.value });
  }

  showWalletUnlockDialog() {
    this.setState(() => {
      return { dialog: true };
    });
  }
  checkboxChange(evt) {
    if (this.state.checked !== evt.target.checked) {
      this.setState({
        stakeUnlock: evt.target.checked
      });
    }
  }

  renderDialogBody() {
    if (this.props.unlocked_until === 0) {
      return (
        <div>
          <div className="header">
            <p className="title">{lang.overviewModalAuthTitle}</p>
          </div>
          <div className="body">
            <p className="desc">{lang.ovweviewModalAuthDesc}</p>
            <div className="row">
              <div className="col-md-10 col-md-offset-1 input-group">
                <input className="form-control inputText" type="password" value={this.state.passPhrase} onChange={this.onPassPhraseChange} placeholder={lang.walletPassPhrase} />
              </div>
              <div className="col-md-10 col-md-offset-1 input-group" style={{ marginTop: '15px' }}>
                <input className="form-control inputText" type="number" value={this.state.timeL} onChange={this.onTimeLChange} placeholder={lang.secondsUnlocked} />
              </div>
              <div className="col-md-10 col-md-offset-1 input-group" style={{ marginTop: '15px' }}>
                <div className="form-check">
                  <input style={{marginRight: '10px'}} className="form-check-input" type="checkbox" value="" id="defaultCheck1" checked={this.state.stakeUnlock} onChange={this.checkboxChange} />
                  <label className="form-check-label" htmlFor="defaultCheck1">
                    {lang.unlockForStatking}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <div className="header">
            <p className="title">{lang.popupMessageConfirmationRequired}</p>
          </div>
          <div className="body">
            <p className="desc">{lang.ovweviewModalLockQuestion}</p>
          </div>
        </div>
      );
    }
  }

  renderDialog() {
    if (!this.state.dialog) {
      return null;
    } else {
      return (
        <div className="mancha">
          <div className="dialog">
            {this.renderDialogBody()}
            <div className="footer">
              <p className="button btn_cancel" onClick={this.cancelDialog}>{lang.cancel}</p>
              <p className="button btn_confirm" onClick={this.confirmDialog}>{lang.confirm}</p>
            </div>
          </div>
        </div>
      );
    }
  }

  cancelDialog() {
    this.setState({ dialog: false, passPhrase: '', timeL: '' });
  }

  confirmDialog() {
    const self = this;
    if (this.props.unlocked_until === 0) {
      const passPhrase = this.state.passPhrase;
      let timeL = this.state.timeL;
      const staking = this.state.stakeUnlock;
      if (timeL === 0 || timeL.length === 0) {
        timeL = 300000;
      }
      WalletService.unlockWallet(passPhrase, timeL, staking).then((data) => {
        if (data === null) {
          event.emit('animate', `${lang.walletUnlockedFor} ${timeL} ${lang.seconds}`);
        } else {
          event.emit('animate', getErrorFromCode(data.code));
        }
        self.setState({ dialog: false, passPhrase: '', timeL: '' });
      }).catch((err) => {
        const message = getErrorFromCode(err.code);
        event.emit('animate', message);
        self.setState({ dialog: false, passPhrase: '', timeL: '' });
      });
    } else {
      WalletService.lockWallet().then((data) => {
        if (data === null) {
          event.emit('animate', lang.walletLocked);
        } else {
          event.emit('animate', lang.walletLockedError);
        }
      }).catch((err) => {
        console.log(err);
        event.emit('animate', lang.walletLockedError);
      });
      self.setState({ dialog: false, passPhrase: '', timeL: '' });
    }
  }

  render() {
    let progressBar = 0;
    if (this.props.blocks !== 0 && this.props.headers !== 0) {
      progressBar = (this.props.blocks / this.props.headers) * 100;
    }

    if (progressBar >= 100 && this.props.blocks < this.props.headers) {
      progressBar = 99.99;
    }

    return (
      <div className="sidebar" style={{zIndex: '10'}}>
        <div className="userimage">
          <img src={usericon} />
        </div>
        <ul className="sidebarlist">
          <div className={`sidebaritem ${this.state.active.default}`}>
            <Link to="/" className={this.state.active.default}>
              <img className="sidebaricon" src={this.state.icons.default} />
              {lang.navBarOverviewButton}
            </Link>
            {this.renderRectRound('/')}
          </div>
          <div className={`sidebaritem ${this.state.active.send}`}>
            <Link to="/send" className={this.state.active.send}>
              <img className={'sidebaricon'} src={this.state.icons.send} />
              {lang.navBarSendButton}
            </Link>
            {this.renderRectRound('/send')}
          </div>
          <div className={`sidebaritem ${this.state.active.receive}`}>
            <Link to="/receive" className={this.state.active.receive}>
              <img className="sidebaricon" src={this.state.icons.receive} />
              {lang.navBarReceiveButton}
            </Link>
            {this.renderRectRound('/receive')}
          </div>
          <div className={`sidebaritem ${this.state.active.transactions}`}>
            <Link to="/transaction" className={this.state.active.transactions}>
              <img className="sidebaricon" src={this.state.icons.transactions} />
              {lang.navBarTransactionsButton}
            </Link>
            {this.renderRectRound('/transaction')}
          </div>
          <div className={`sidebaritem ${this.state.active.statuspage}`}>
            <Link to="/statuspage" className={this.state.active.statuspage}>
              <img className="sidebaricon" src={this.state.icons.statuspage} />
              Status
            </Link>
            {this.renderRectRound('/statuspage')}
          </div>
          <div className={`sidebaritem ${this.state.active.about}`}>
            <Link to="/about" className={this.state.active.about}>
              <img className="sidebaricon" src={this.state.icons.about} />
              {lang.navBarAboutButton}
            </Link>
            {this.renderRectRound('/about')}
          </div>
          <div className={`sidebaritem ${this.state.active.settings}`}>
            <Link to="/settings" className={this.state.active.settings}>
              <img className="sidebaricon" src={this.state.icons.settings} />
              {lang.navBarSettingsButton}
            </Link>
            {this.renderRectRound('/settings')}
          </div>
        </ul>
        <div className="connections sidebar-section-container">
          <p>{`${lang.nabBarNetworkInfoSyncing} ${progressBar.toFixed(2)}%`}</p>
          <div className="progress custom_progress">
            <div
              className="progress-bar progress-bar-success progress-bar-striped"
              role="progressbar"
              aria-valuenow="40"
              aria-valuemin="0"
              aria-valuemax="100"
              style={{ width: `${progressBar.toFixed(2)}%`, backgroundColor: '#8DA557' }}
            />
          </div>
          <p>{`${this.props.blocks} blocks / ${this.props.headers} headers`}</p>
          <p>{`${lang.nabBarNetworkInfoActiveConnections}: ${this.props.connections}`}</p>
        </div>
        <div id='unlock_pane' style={{padding: '10px', textAlign: 'center', color: 'white'}}>
          { this.props.running //eslint-disable-line
            ? this.props.unlocked_until === 0
              ? <span className="title" style={{cursor: 'pointer'}} onClick={this.showWalletUnlockDialog}>Unlock Wallet</span>
              : <span className="title" style={{cursor: 'pointer'}} onClick={this.showWalletUnlockDialog}>Lock Wallet</span> :
            null
          }
        </div>
        <div className="sidebar-section-container">
          {this.props.running //eslint-disable-line
            ? !this.props.stopping
              ? <button className="stopStartButton" onClick={this.props.startStopWalletHandler}>{lang.stopWallet}</button>
              : <button className="stopStartButton" disabled>{lang.stoppingWallet}</button>
            : !this.props.starting
              ?
              this.props.walletInstalled
                ?
                <button
                  className="stopStartButton"
                  onClick={this.props.startStopWalletHandler}
                >
                  {lang.startWallet}
                </button>
                :
                null

              : <button className="stopStartButton" disabled>{lang.startingWallet}</button>
          }

          <br />
          <WalletInstallerPartial isWalletInstalled={this.props.walletInstalled} isNewVersionAvailable={this.state.newVersionAvailable} />
        </div>
        {this.renderDialog()}
      </div>
    );
  }
}

export default Sidebar;

