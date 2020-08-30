/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */

import MenuBuilder from './menu';
import { grabWalletDir } from './services/platform.service';

const { app, Tray, Menu, BrowserWindow, nativeImage, ipcMain } = require('electron');

const settings = require('electron-settings');
const event = require('./utils/eventhandler');
const { logo } = require('./base-sixty-four');
const extract = require('extract-zip');
const fs = require('fs');
const config = require('../config.json');

const iconPath = nativeImage.createFromDataURL(logo);

let tray = null;

function sendStatusToWindow(text) {
  console.log(text);
  mainWindow.webContents.send('message', text);
}

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};

const DownloadManager = require('electron-download-manager');

if (process.platform === 'darwin') {
  DownloadManager.register({ downloadFolder: grabWalletDir(), filename: `${config.downloadFileName}.zip` });
} else if (process.platform === 'linux') {
  DownloadManager.register({ downloadFolder: grabWalletDir(), filename: config.downloadFileName });
} else if (process.platform.indexOf('win') > -1) {
  DownloadManager.register({ downloadFolder: grabWalletDir(), filename: `${config.downloadFileName}.exe` });
}

app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  const ds = settings.get('settings.display');

  mainWindow = new BrowserWindow({
    show: false,
    width: 1280,
    height: 800,
    minWidth: 1200,
    minHeight: 620,
    icon: iconPath,
    title: `${config.coinName}-${config.guiName}`
  });

  mainWindow.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('minimize', (event) => {
    if (ds !== undefined && ds.minimise_to_tray !== undefined && ds.minimise_to_tray) {
      event.preventDefault();
      mainWindow.setSkipTaskbar(true);
      mainWindow.hide();
      return false;
    }
  });

  mainWindow.on('show', (event) => {
    mainWindow.setSkipTaskbar(false);
  });


  mainWindow.on('close', (event) => {
    if (ds !== undefined && ds.minimise_on_close !== undefined && ds.minimise_on_close) {
      event.preventDefault();
      if (!ds.minimise_to_tray) {
        mainWindow.minimize();
      } else {
        mainWindow.hide();
      }
    } else {
      app.quit();
    }
    return false;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  if (ds === undefined || ds.tray_icon === undefined || !ds.tray_icon) {
    const defaultMenu = [
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
          app.exit(0);
        }
      },
    ];


    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate(defaultMenu);
    tray.setToolTip(`${config.coinName}-${config.guiName}`);
    tray.setContextMenu(contextMenu);

    if (process.platform === 'darwin') {
      tray.setImage(iconPath);
    } else if (process.platform === 'linux') {
      tray.setImage(iconPath);
    } else if (process.platform.indexOf('win') > -1) {
      tray.setImage(iconPath);
    }

    tray.on('click', () => {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
  }
});

ipcMain.on('wallet-version-created', (e, args) => {
  e.sender.send('wallet-version-updated');
});
