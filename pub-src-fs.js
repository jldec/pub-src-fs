/**
 * pub-src-fs.js
 * instrumented facade around fs-base
 *
 * Copyright (c) 2015-2022 Jürgen Leschner - github.com/jldec - MIT license
**/

var debug = require('debug')('pub:src-fs');


module.exports = function sourceFs(sourceOpts) {

  var fsbase = require('./fs-base')(sourceOpts);

  return {
    watchable: true,
    get: get,
    put: put
  };

  function get(options, cb) {
    if (typeof options === 'function') { cb = options; options = {}; }

    fsbase.readfiles(options, function(err, result) {
      debug('get %s %s file(s)', sourceOpts.name, err || result.length);
      cb(err, result);
    });
  }

  function put(files, options, cb) {
    if (typeof options === 'function') { cb = options; options = {}; }

    fsbase.writefiles(files, options, function(err, result) {
      debug('put %s %s file(s) %s', sourceOpts.name, files.length, err || '');
      cb(err, result);
    });
  }

};
