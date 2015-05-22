/**
 * pub-src-fs test-listfiles
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
 *
**/

suite('pub-src-fs test-listfiles');

var assert = require('assert');
var u = require('pub-util');
var mkdirp = require('mkdirp');
var should = require('should');
var FsBase = require('../fs-base');

test("list-files with no opts", function(){
  (function() { FsBase(); }).should.throw();
  (function() { FsBase({}); }).should.throw();
});

test("read directory tree including empty directory and maxdepth", function(done){

  var opts = { path:__dirname + '/tree', glob:'**/*.txt', depth:5 };
  var fsbase = FsBase(opts);

  var expected = [
    '/1.txt',
    '/2.txt',
    '/3.txt',
    '/4.txt',
    '/5.txt',
    '/1/9.txt',
    '/2/10.txt/11.txt',
    '/2/10.txt/12.txt',
    '/2/10.txt/13/14.txt',
    '/2/10.txt/13/level-4/not-ignored.txt',
    '/f1/6.txt',
    '/f1/7.txt',
    '/f2/8.txt'
  ];

  mkdirp(opts.path + '/empty', function(err) {
    if (err) return done(err);
    fsbase.listfiles(function(err, actual){
      if (err) return done(err);
      // console.log(actual);
      assert.deepEqual(actual, expected);
      done();
    });
  })
});


test("sorted list, default options", function(done){

  var opts = { path:__dirname + '/sortme', depth:5 };
  var fsbase = FsBase(opts);

  var expected = [
    '/index.md',
    '/A.md',
    '/Aa.md',
    '/b5.md',
    '/Ba.md',
    '/U.md',
    '/ú.md',
    '/Ú1.md',
    '/ü12.md',
    '/Ü3.md',
    '/Vz.md',
    '/Z.md',
    '/ø.md',
    '/A(A/index.',
    '/A(A/index.x',
    '/A(A/(index)',
    '/A(A/Aindex.',
    '/A(A/index/x.md',
    '/sortmetoo/ 2.md',
    '/sortmetoo/22 .md',
    '/sortmetoo/22.md',
    '/ü12/file.md',
    '/zappa/alpha/booger.md'
  ];

  fsbase.listfiles(function(err, actual){
    if (err) return done(err);
    // console.log(actual);
    assert.deepEqual(actual, expected);
    done();
  });
});


test("sorted list, dirsFirst option", function(done){

  var opts = { path:__dirname + '/sortme', depth:5, dirsFirst:1 };
  var fsbase = FsBase(opts);

  var expected = [
    '/A(A/index/x.md',
    '/A(A/index.',
    '/A(A/index.x',
    '/A(A/(index)',
    '/A(A/Aindex.',
    '/sortmetoo/ 2.md',
    '/sortmetoo/22 .md',
    '/sortmetoo/22.md',
    '/ü12/file.md',
    '/zappa/alpha/booger.md',
    '/index.md',
    '/A.md',
    '/Aa.md',
    '/b5.md',
    '/Ba.md',
    '/U.md',
    '/ú.md',
    '/Ú1.md',
    '/ü12.md',
    '/Ü3.md',
    '/Vz.md',
    '/Z.md',
    '/ø.md'
  ];

  fsbase.listfiles(function(err, actual){
    if (err) return done(err);
    // console.log(actual);
    assert.deepEqual(actual, expected);
    done();
  });
});


test("sorted list, sortCase option", function(done){

  var opts = { path:__dirname + '/sortme', depth:5, sortCase:1 };
  var fsbase = FsBase(opts);

  var expected = [
    '/index.md',
    '/A.md',
    '/Aa.md',
    '/Ba.md',
    '/U.md',
    '/Ú1.md',
    '/Ü3.md',
    '/Vz.md',
    '/Z.md',
    '/b5.md',
    '/ú.md',
    '/ü12.md',
    '/ø.md',
    '/A(A/index.',
    '/A(A/index.x',
    '/A(A/(index)',
    '/A(A/Aindex.',
    '/A(A/index/x.md',
    '/sortmetoo/ 2.md',
    '/sortmetoo/22 .md',
    '/sortmetoo/22.md',
    '/ü12/file.md',
    '/zappa/alpha/booger.md'
  ];

  fsbase.listfiles(function(err, actual){
    if (err) return done(err);
    // console.log(actual);
    assert.deepEqual(actual, expected);
    done();
  });
});


test("sorted list, sortAccents option", function(done){

  var opts = { path:__dirname + '/sortme', depth:5, sortAccents:1 };
  var fsbase = FsBase(opts);

  var expected = [
    '/index.md',
    '/A.md',
    '/Aa.md',
    '/b5.md',
    '/Ba.md',
    '/U.md',
    '/Vz.md',
    '/Z.md',
    '/ø.md',
    '/ú.md',
    '/Ú1.md',
    '/ü12.md',
    '/Ü3.md',
    '/A(A/index.',
    '/A(A/index.x',
    '/A(A/(index)',
    '/A(A/Aindex.',
    '/A(A/index/x.md',
    '/sortmetoo/ 2.md',
    '/sortmetoo/22 .md',
    '/sortmetoo/22.md',
    '/zappa/alpha/booger.md',
    '/ü12/file.md'
  ];

  fsbase.listfiles(function(err, actual){
    if (err) return done(err);
    // console.log(actual);
    assert.deepEqual(actual, expected);
    done();
  });
});


test("sorted list, blank indexFile option", function(done){

  var opts = { path:__dirname + '/sortme', depth:5, indexFile:'' };
  var fsbase = FsBase(opts);

  var expected = [
    '/A.md',
    '/Aa.md',
    '/b5.md',
    '/Ba.md',
    '/index.md',
    '/U.md',
    '/ú.md',
    '/Ú1.md',
    '/ü12.md',
    '/Ü3.md',
    '/Vz.md',
    '/Z.md',
    '/ø.md',
    '/A(A/(index)',
    '/A(A/Aindex.',
    '/A(A/index.',
    '/A(A/index.x',
    '/A(A/index/x.md',
    '/sortmetoo/ 2.md',
    '/sortmetoo/22 .md',
    '/sortmetoo/22.md',
    '/ü12/file.md',
    '/zappa/alpha/booger.md'
  ];

  fsbase.listfiles(function(err, actual){
    if (err) return done(err);
    // console.log(actual);
    assert.deepEqual(actual, expected);
    done();
  });
});


test("list single file", function(done){

  var opts = { path:__dirname + '/tree/2.txt' };
  var fsbase = FsBase(opts);

  var expected = [ "/2.txt" ];

  fsbase.listfiles(function(err, actual){
    if (err) return done(err);
    assert.deepEqual(actual, expected);
    done();
  });
});

test("list single dot-file", function(done){

  var opts = { path:__dirname + '/tree/.ignored' };
  var fsbase = FsBase(opts);

  var expected = [ "/.ignored" ];

  fsbase.listfiles(function(err, actual){
    if (err) return done(err);
    assert.deepEqual(actual, expected);
    done();
  });
});

