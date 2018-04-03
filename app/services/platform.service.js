const homedir = require('os').homedir();

import config from '../../config.json';

const releaseUrl = config.releaseUrl;

export function grabWalletDir() {
  if (process.platform === 'linux') {
    // linux directory
    return `${homedir}/.eccoin-wallet/`;
  } else if (process.platform === 'darwin') {
    // OSX
    return `${homedir}/Library/Application Support/.eccoin-wallet/`;
  } else if (process.platform.indexOf('win') > -1) {
    // Windows
    return `${homedir}\\.eccoin-wallet\\`;
  }
}
export function formatDownloadURL(product, version, platform) {
  return `https://github.com/project-ecc/${product}/releases/download/${version}/${product}-${version}-${platform}.zip`;
}

export function extractChecksum (platform, text) {
  // kinda shitty...node doesn't have dotall (s flag) as of this code...whitespace/not whitespace is a hack...
  const checksumMatches = text.match(new RegExp(`[\\s\\S]*checksum-${platform}: (\\w+)[\\s\\S]*`));

  return (checksumMatches && checksumMatches.length > 1) ? checksumMatches[1] : '';
}

export function getPlatformFileName() {

  if (process.platform === 'linux') {

    return os.arch() === 'x32' ? daemonConfig.linux32 : daemonConfig.linux64;

  } else if (process.platform === 'darwin') {

    return daemonConfig.osx;

  } else if (process.platform.indexOf('win') > -1) {

    os.arch() === 'x32' ? daemonConfig.win32 : daemonConfig.win64;
  }
}

export function grabEccoinDir() {
  if (process.platform === 'linux') {
    // linux directory
    return `${homedir}/.eccoin/`;
  } else if (process.platform === 'darwin') {
    // OSX
    return `${homedir}/Library/Application Support/eccoin/`;
  } else if (process.platform.indexOf('win') > -1) {
    // Windows
    return `${homedir}\\Appdata\\roaming\\eccoin\\`;
  }
}

export function getPlatformWalletUri() {
  if (process.platform === 'linux') {
    // linux directory
    return `${grabWalletDir()}Eccoind`;
  } else if (process.platform === 'darwin') {
    // OSX
    return `${grabWalletDir()}Eccoind.app/Contents/MacOS/eccoind`;
  } else if (process.platform.indexOf('win') > -1) {
    // Windows
    return `${grabWalletDir()}Eccoind.exe`;
  }
}

export function getConfUri() {
  return `${grabEccoinDir()}eccoin.conf`;
}

export function getDebugUri() {
  return `${grabEccoinDir()}debug.log`;
}

