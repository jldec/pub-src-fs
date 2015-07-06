/**
 * pub-src-fs test-writefiles
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
 *
**/

var test = require('tape')

var fs = require('fs');
var rmdir = require('rmdir');
var fsbase = require('../fs-base');
var u = require('pub-util');


test("FS read, write and read back ./files", function(t) {

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

test("FS read, write and read back ./tree", function(t) {

  var reader = fsbase( { path:__dirname + '/tree',       glob:'**/*.txt', depth:4 } );

  var writer = fsbase( { path:__dirname + '/testwrite2', glob:'**/*.txt', depth:4,
                          tmp:__dirname + '/tmp',        writable:true            } );

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
