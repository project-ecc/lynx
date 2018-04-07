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
 * This function forwards the daemon zip download url given the inputted parameters.
 * @param product
 * @param version
 * @param platform
 * @returns {string}
 */

export function formatDownloadURL(product, version, platform) {
  return `https://github.com/project-ecc/${product}/releases/download/${version}/${product}-${version}-${platform}.zip`;
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

/**
 * Returns the daemons file name, Works accross platforms.
 * @returns {string}
 */

export function getPlatformFileName() {
  if (process.platform === 'linux') {

    return os.arch() === 'x32' ? `${config.daemonName}-linux32` : `${config.daemonName}-linux64`;

  } else if (process.platform === 'darwin') {

    return `${config.daemonName}.app`;

  } else if (process.platform.indexOf('win') > -1) {

    return os.arch() === 'x32' ? `${config.daemonName}-win32.exe` : `${config.daemonName}-win64.exe`;
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
    return `${grabWalletDir()}${getPlatformFileName()}/Contents/MacOS/${config.daemonName}`;
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

