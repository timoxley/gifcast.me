'use strict'
var isWorker = (typeof document === 'undefined');

if (isWorker) {
  importScripts('build/build.js')
  require('gifcast/worker')(this);
} else {
  var gifcast = require('gifcast')();
}


