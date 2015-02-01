var path = require('path')
var logger = console
var storage_path = process.env.STORAGE_PATH
if (!storage_path) {
  if (process.env.NODE_ENV === 'production')
    throw new Error('no STORAGE_PATH set')
  else
    storage_path = path.join(__dirname, '..', 'tmp')
}
var LocalStorage = require('node-localstorage').LocalStorage;

var mkdirp = require('mkdirp')

mkdirp.sync(storage_path);

module.exports = {
  localStorage: new LocalStorage(path.join(storage_path, 'localStorage')),
  root: storage_path
}
