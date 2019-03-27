const util = require('util');
const ApkReader = require('adbkit-apkreader');

ApkReader.open('./uploads/app/whimsy.apk')
  .then(reader => reader.readManifest())
  .then(manifest => console.log(manifest.versionName));
