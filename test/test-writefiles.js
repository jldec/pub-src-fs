/**
 * pub-src-fs test-writefiles
 * Copyright (c) 2015-2024 Jürgen Leschner - github.com/jldec - MIT license
 *
**/

/*eslint indent: ["off"]*/

var test = require('tape');

var rmdir = require('rimraf');
var fsbase = require('../fs-base');


test('FS read, write and read back ./files', function(t) {

  var reader = fsbase( { path:__dirname + '/files', glob:'**/*.txt' } );
  var writer = fsbase( { path:__dirname + '/testwrite', writable:true, tmp:__dirname + '/tmp' } );

  reader.readfiles(function(err, files) {
    t.error(err);

    writer.writefiles(files, 'test', function(err) {
      t.error(err);

      writer.readfiles(function(err, actual){
        t.same(actual, files);
        t.end(err);
      });
    });
  });
});

test('FS read, write and read back ./tree with binaries', function(t) {

  var reader = fsbase( { path:__dirname + '/tree',       glob:'**/*.*', includeBinaries:true, depth:4 } );

  var writer = fsbase( { path:__dirname + '/testwrite2', glob:'**/*.*', includeBinaries:true, depth:4,
                          tmp:__dirname + '/tmp',        writable:true } );

  reader.readfiles(function(err, files) {
    t.error(err);

    writer.writefiles(files, 'test', function(err) {
      t.error(err);

      writer.readfiles(function(err, actual){
        t.same(actual, files);
        t.end(err);
      });
    });
  });
});

test('cleanup', function(t) {
  t.plan(3);
  rmdir(__dirname + '/testwrite', t.error);
  rmdir(__dirname + '/testwrite2', t.error);
  rmdir(__dirname + '/tmp', t.error);
});
