import config from '../../config.json';

const homedir = require('os').homedir();
const os = require('os');

/**
 * This function returns the directory Uri for the wallet daemon and version files.
 * @returns {string}
 */

export function grabWalletDir() {
  if (process.platform === 'linux') {
    // linux directory
    return `${homedir}/.${config.daemonFolder}/`;
  } else if (process.platform === 'darwin') {
    // OSX
    return `${homedir}/Library/Application Support/.${config.daemonFolder}/`;
  } else if (process.platform.indexOf('win') > -1) {
    // Windows
    return `${homedir}\\.${config.daemonFolder}\\`;
  }
}

/**
 * Extracts the platform zip checksum from the body of text on the github release page.
 * @param platform
 * @param text
 * @returns {string}
 */

export function extractChecksum (platform, text) {
  // kinda shitty...node doesn't have dotall (s flag) as of this code...whitespace/not whitespace is a hack...
  const checksumMatches = text.match(new RegExp(`[\\s\\S]*checksum-${platform}: (\\w+)[\\s\\S]*`));

  return (checksumMatches && checksumMatches.length > 1) ? checksumMatches[1] : '';
}

export function extractDownloadURL (platform, text) {
  const delimit = "download-" + platform + ":";
  console.log(delimit)
  const downloadMatches = text.split(delimit);
  const url = downloadMatches[1].split(" ");
  console.log(url[1])
  return url[1];
}

/**
 * Returns the daemons file name, Works accross platforms.
 * @returns {string}
 */

export function getPlatformFileName() {
  if (process.platform === 'linux') {

    return os.arch() === 'x32' ? `${config.daemonName}-linux32` : `${config.daemonName}-linux64`;

  } else if (process.platform === 'darwin') {

    return `${config.daemonName}`;

  } else if (process.platform.indexOf('win') > -1) {

    return os.arch() === 'x32' ? `${config.daemonName}-win32.exe` : `${config.daemonName}-win64.exe`;
  }
}

export function getPlatformFileExtension() {
  if (process.platform === 'linux') {

    return "";

  } else if (process.platform === 'darwin') {

    return "";

  } else if (process.platform.indexOf('win') > -1) {

    return ".exe";
  }
}


export function getPlatformName() {
  if (process.platform === 'linux') {

    return os.arch() === 'x32' ? "linux32" : "linux64";

  } else if (process.platform === 'darwin') {

    return "osx64";

  } else if (process.platform.indexOf('win') > -1) {

    return os.arch() === 'x32' ? "win32" : "win64";
  }
}

/**
 * returns the coin Dir which contains the block Db, wallet.dat and conf files.
 * @returns {string}
 */

export function grabCoinDir() {
  if (process.platform === 'linux') {
    // linux directory
    return `${homedir}/.${config.resourceFolder}/`;
  } else if (process.platform === 'darwin') {
    // OSX
    return `${homedir}/Library/Application Support/${config.resourceFolder}/`;
  } else if (process.platform.indexOf('win') > -1) {
    // Windows
    return `${homedir}\\Appdata\\roaming\\${config.resourceFolder}\\`;
  }
}

/**
 * Returns the full path to the wallet daemon.
 * @returns {string}
 */

export function getPlatformWalletUri() {
  if (process.platform === 'linux') {
    // linux directory
    return `${grabWalletDir()}${getPlatformFileName()}`;
  } else if (process.platform === 'darwin') {
    // OSX
    return `${grabWalletDir()}${getPlatformFileName()}`;
  } else if (process.platform.indexOf('win') > -1) {
    // Windows
    return `${grabWalletDir()}${getPlatformFileName()}`;
  }
}

/**
 * Returns the conf file full path.
 * @returns {string}
 */

export function getConfUri() {
  return `${grabCoinDir()}eccoin.conf`;
}

/**
 * returns the debug file full path.
 * @returns {string}
 */

export function getDebugUri() {
  return `${grabCoinDir()}debug.log`;
}
