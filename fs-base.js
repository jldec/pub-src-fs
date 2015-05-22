/**
 * pub-src-fs fs-base.js
 * base module for hierachical file system sources
 * provides functions for descending (globbing) directory trees and reading/writing files
 * specializeable e.g. by replacing readdir and readfile through sourceOpts
 * assumes that all files are utf-8 text
 * used by pub-src-fs, pub-src-github, and pub-server/serve-static
 *
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
**/

var debug = require('debug')('pub:src-fs');
var fs = require('graceful-fs');
var u = require('pub-util');
var path = require('path');
var asyncbuilder = require('asyncbuilder');
var Queue = require('queue3');
var mkdirp = require('mkdirp');
var normalize = require('unorm').nfc;

module.exports = function fsbase(sourceOpts) {

  if (typeof sourceOpts === 'string') { sourceOpts = { path:sourceOpts }; }
  if (!sourceOpts || !sourceOpts.path) throw new Error('pub-src-fs/fs-base requires a path');

  var self = u.clone(sourceOpts); // avoid side effects

  self.exclude     = self.exclude     || /^\./;   // exclude names (including directories) beginning with '.'

  // minimatch defaults
  var mmPat = '**/*';
  var mmOpts = {};

  if (self.glob) {
    if (typeof self.glob === 'object') {
      mmPat = self.glob.pattern || mmPat;
      mmOpts = u.merge(mmOpts, u.omit(self.glob, 'pattern'));
    }
    else {
      mmPat = self.glob;
    }
    self.mm = new require('minimatch').Minimatch(mmPat, mmOpts);
    if (!self.mm.set.length) delete self.mm;
  }

  // max recursion depth
  self.depth = self.depth ||
    (self.mm && /(^|\/)\*\*\//.test(mmPat) ? 5 : mmPat.split('/').length);

  self.timeout     = self.timeout     || 5000;
  self.concurrency = self.concurrency || 10;

  self.sortEntry   = self.sortEntry   || require('./sort-entry')(self);

  self.readdir     = self.readdir     || fsReaddir;   // recursive directory walk with minimatch - only files

  self.readfile    = self.readfile    || fs.readFile; // single file read
  self.writefile   = self.writefile   || writeFileAtomic; // single file write with built-in mkdirp and tmp/rename

  self.readfiles   = self.readfiles   || readfiles;   // recursive read (buffered) returns array of {path: text:}
  self.writefiles  = self.writefiles  || writefiles;  // multi-file write

  self.isfile      = self.isfile      || isfile;      // true if this source is just one file

  // serialize readfiles() and writefiles() if writable
  // TODO: review timeout - use longer than self.timeout which is for read and write queues
  // NOTE: a different kind of semaphore will be needed to support mutli-server
  self.queue = new Queue( { concurrency: (self.writable ? 1 : self.concurrency), timeout: self.timeout } );

  // support single file source.path
  if (self.isfile(self.path)) {
    self.file = '/' + path.basename(self.path);
    self.path = path.dirname(self.path);
    self.listfiles = listfile;
  }
  else {
    self.listfiles = self.listfiles   || listfiles;               // recursive directory list
  }

  return self;

  //--//--//--//--//--//--//--//--//--//--//

  function readfiles(options, cb) {
    if (typeof options === 'function') { cb = options; options = {}; }

    // instance-level queue serializes readfiles and writefiles (if writable)
    self.queue.push(function(next) {
      function allDone(err, result) { next(); cb(err, result); }

      // another queue limits concurrency during readfiles to avoid opening too many files
      var readQ = new Queue( { concurrency: self.concurrency, timeout: self.timeout } );

      self.listfiles(function(err, list) {
        if (err) return allDone(err);
        var ab = asyncbuilder(allDone);

        list.forEach(function(filepath) {
          var append = ab.asyncAppend();
          var fullpath = u.join(self.path, filepath);

          readQ.push(function(readDone) {

            // assumes all text files
            self.readfile(fullpath, {encoding:'utf8'}, function(err, text) {
              append(err, { path:filepath, text:text });
              readDone();
            });

          });
        });
        ab.complete();
      });

    });
  }

  function writefiles(files, options, cb) {
    if (typeof options === 'function') { cb = options; options = {}; }
    if (!self.writable) return cb(new Error('cannot write to non-writable source'));

    // serialize readfiles and writefiles
    self.queue.push(function(next) {

      var ab = asyncbuilder(function(err, result) { next(); cb(err, result); });
      var writeQ = new Queue( { concurrency: self.concurrency, timeout: self.timeout } );

      files.forEach(function(file, idx) {
        var append = ab.asyncAppend();
        writeQ.push(function(writeDone) {

          // self.writefile defaults to writeFileAtomic()
          self.writefile(file.path, file.text, function(err) {
            append(err, file.path);
            writeDone();
          });

        });
      });
      ab.complete();

    });
  }

  // for atomicity, first write to tmp, then rename
  // unlike readfile, this function takes a relative filepath
  // hmm... could be adapted to do versioning
  // TODO hoover tmp
  function writeFileAtomic(filepath, text, cb) {

    var fullpath = u.join(self.path, filepath);
    var dir = path.dirname(fullpath)

    var tmppath = u.join(self.tmp, filepath);
    var tmpdir = path.dirname(tmppath)

    mkdirp(tmpdir, function(err) {
      if (err) return cb(err);

      mkdirp(dir, function(err) {
        if (err) return cb(err);

        fs.writeFile(tmppath, text, function(err) {
          if (err) return cb(err);

          fs.rename(tmppath, fullpath, function(err) {
            if (err) return cb(err);
            cb();
          });
        });
      });
    });
  }


  // listfiles
  // returns depth-first sorted array of filepaths (no directories) matching glob starting at path
  // returned filepaths do not include path
  // calls self.readdir(path, cb) which can be overridden
  // readdir must return array of {name:, type:} only type:"file" or "dir" are recognized
  function listfiles(cb) {

    treewalk(self.path, '/', 1, function(err, tree) {
      if (err) return cb(err);
      cb(null, u.flatten(tree));
    });

    // async recursive treewalk
    // walks directory tree starting in path - uses asyncbuilder to preserve name-based ordering
    // returns cb(err,tree) where tree[] = array of names (for files) or arrays (for directories)
    function treewalk(path, prefix, depth, cb) {

      function sort(entry) { return self.sortEntry(entry.name, entry.type); }

      self.readdir(path, function(err, list) { if (err) return cb(err);
        var ab = asyncbuilder(cb);

        // first normalize names to fix decomposed unicode e.g. from OSX-HFS
        u.each(list, function(entry) { entry.name = normalize(entry.name); });

        u.each(u.sortBy(list, sort), function(entry) {
          var pathname = u.join(path, entry.name);
          var pname = u.join(prefix, entry.name);
          if (entry.name.match(self.exclude)) return; // exclude files or directories starting with .
          if (entry.type === 'dir') {
            if (depth >= self.depth) return;
            return treewalk(pathname, pname, depth + 1, ab.asyncAppend()); // recurse
          }
          if (self.mm && !self.mm.match(pname.slice(1))) return; // failed minimatch glob test
          if (entry.type === 'file') return ab.append(pname);
        });

        ab.complete();
      });
    }

  }

  // fs fsReaddir
  // returns array of {name:, type:} entries for the directory at path
  function fsReaddir(path, cb) {
    if (path === '/') return cb(new Error('Reading filesystem at / is disallowed to prevent mistakes.'));
    fs.readdir(path, function(err, dir) { if (err) return cb(err);
      var ab = asyncbuilder(cb);
      u.each(dir, function(name) {
        var push = ab.asyncAppend();
        fs.stat(u.join(path, name), function(err, stats) {
          var entry = !err && { name:name, type:(stats.isDirectory() ? 'dir' : stats.isFile() ? 'file' : 'other') };
          push(err, entry);
        });
      });
      ab.complete();
    });
  }


  function isfile(path) {
    try { return fs.statSync(path).isFile(); }
    catch(err) { return false; }
  }

  function listfile(cb) {
    process.nextTick(function() {
      cb(null, [ self.file ]);
    });
  }
}


