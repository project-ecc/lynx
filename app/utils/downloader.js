import { getPlatformName, getPlatformFileName } from '../services/platform.service';

const fs = require('fs');
const request = require('request-promise-native');
const progress = require('request-progress');
const crypto = require('crypto');
const extract = require('extract-zip');
const event = require('../utils/eventhandler');
const zlib = require('zlib');
const tar = require('tar');

/**
 * This function downloads files and can either unzip them or validate them against a checksum value (cs)
 * @param srcUrl
 * @param destFolder
 * @param destFileName
 * @param cs
 * @param unzip
 */
export function downloadFile(srcUrl, destFolder, destFileName, cs = null, unzip = false) {
  return new Promise((resolve, reject) => {
    const downloadRequestOpts = {
      url: srcUrl,
      encoding: null,
    };

    const fileName = destFolder + destFileName;

    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder);
    }

    progress(request.get(downloadRequestOpts), {
      // throttle: 2000,                    // Throttle the progress event to 2000ms, defaults to 1000ms
      // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
      // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
    })
    .on('progress', (state) => {
      // The state is an object that looks like this:
      // {
      //     percent: 0.5,               // Overall percent (between 0 to 1)
      //     speed: 554732,              // The download speed in bytes/sec
      //     size: {
      //         total: 90044871,        // The total payload size in bytes
      //         transferred: 27610959   // The transferred payload size in bytes
      //     },
      //     time: {
      //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
      //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
      //     }
      // }
      // console.log('progress', state);
      event.emit('downloading-file', state);
    })
    .on('error', (err) => {
      console.log(`Error extracting  zip ${err}`);
      if (fs.existsSync(destFileName)) {
        fs.unlink(destFileName);
      }
      resolve(err);
      // Do something with err
    })
    .on('end', async () => {
      event.emit('downloaded-file');

      event.emit('verifying-file');
      if (cs !== null) {
        const validated = await validateChecksum(fileName, cs);
        if (!validated) reject(validated);
      }
      event.emit('verifying-file');

      event.emit('unzipping-file', { message: 'Unzipping..' });
      if(unzip) {
        if (getPlatformName() == "win32" || getPlatformName() == "win64") {
          const unzipped = await unzipFile(fileName, destFolder, true);
          if(!unzipped) reject(unzipped);
        }
        else {
          console.log("about to unpack tar file");
          const unzipped = await unpackFile(fileName, destFolder, true);
          if(!unzipped) reject(unzipped);
        }
      }
      event.emit('unzipping-file', { message: 'Unzip Complete' });

      event.emit('file-download-complete');
      resolve(true);
    })
    .pipe(fs.createWriteStream(fileName));
  });
}

/**
 * This function unzips a file in the download function.
 * @param fileToUnzip
 * @param targetDirectory
 * @param deleteOldZip
 * @returns {Promise}
 */
export function unzipFile(fileToUnzip, targetDirectory, deleteOldZip = false) {
  return new Promise((resolve, reject) => {
    extract(fileToUnzip, { dir: targetDirectory }, (err) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        event.emit('unzipping-file', { message: 'Unzipped!' });
        console.log('unzip successfully.');
        if (deleteOldZip) {
          if (fs.existsSync(fileToUnzip)) {
            fs.unlink(fileToUnzip, (deleteFileError) => {
              if (deleteFileError) {
                console.log(deleteFileError);
                reject(deleteFileError);
              } else {
                event.emit('unzipping-file', { message: 'Cleaning up..' });
                console.log('File successfully deleted');
                resolve(true);
              }
            });
          }
        }
        resolve(true);
      }
    });
  });
}

/**
 * This function unpacks a tar file in the download function.
 * @param fileToUnzip
 * @param targetDirectory
 * @param deleteOldZip
 * @returns {Promise}
 */
export function unpackFile(fileToUnpack, targetDirectory, deleteOldZip = false) {
  return new Promise((resolve, reject) =>{
    // extracting a directory
    tar.x(  // or tar.extract(
      {
        file: fileToUnpack,
        cwd: targetDirectory
      }
    ).then(_=> {
        event.emit('unzipping-file', { message: 'Unpacked!' });
        console.log('unpacked successfully.');
        if(deleteOldZip){
          if (fs.existsSync(fileToUnpack)) {
            fs.unlink(fileToUnpack, (deleteFileError) => {
              if (deleteFileError) {
                console.log(deleteFileError);
                reject(deleteFileError)
              } else {
                event.emit('unzipping-file', { message: 'Cleaning up..' });
                console.log('File successfully deleted');

                resolve(true);
              }
            });
          }
        }
        resolve(true);
      });
  });
}

/**
 * This function validates the checksum of a file against an inputted checksum
 * @param fileName
 * @param toValidateAgainst
 * @returns {Promise}
 */
export function validateChecksum (fileName, toValidateAgainst) {
  return new Promise((resolve, reject) =>{
    event.emit('verifying-file');

    var shasum = crypto.createHash('sha256');
    console.log(fileName)
    var s = fs.ReadStream(fileName);
    s.on('data', function(d) { shasum.update(d); });
    s.on('end', function() {
      var sha256 = shasum.digest('hex');
      console.log(`checksum from file ${sha256}`);
      console.log(`validating against ${toValidateAgainst}`);
      console.log('Done downloading. verifying...');
      event.emit('verifying-file');
      if (toValidateAgainst === sha256) {
        resolve(true);
      } else {
        reject('Checksums do not match!');
      }
    });
  });
}
