import config from '../../config.json';

const homedir = require('os').homedir();
const releaseUrl = config.releaseUrl;
const os = require('os');

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

    return os.arch() === 'x32' ? config.linux32 : config.linux64;

  } else if (process.platform === 'darwin') {

    return config.osx;

  } else if (process.platform.indexOf('win') > -1) {

    return os.arch() === 'x32' ? config.win32 : config.win64;
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

