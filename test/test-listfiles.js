/**
 * pub-src-fs test-listfiles
 * Copyright (c) 2015-2024 Jürgen Leschner - github.com/jldec - MIT license
 *
**/

var test = require('tape');

var FsBase = require('../fs-base');
var SortEntry = require('../sort-entry');

var u = require('pub-util');

test('list-files with no opts', function(t){
  t.throws(function() { FsBase(); });
  t.throws(function() { FsBase({}); });
  t.end();
});

test('read directory tree including empty directory and maxdepth', function(t){

  var opts = { path:__dirname + '/tree', glob:'**/*.txt', depth:5 };
  var fsbase = FsBase(opts);

  var expected = [
    '/-foo.txt',
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
  t.same(u.sortBy(expected, SortEntry(opts)), expected, 'validate expected order');

  fsbase.listfiles(function(err, actual){
    t.same(filepathlist(actual), expected);
    t.end(err);
  });

});


test('sorted list, default options', function(t){

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
    '/A(A/index.x',
    '/A(A/(index)',
    '/A(A/Aindex',
    '/A(A/index/x.md',
    '/sortmetoo/ 2.md',
    '/sortmetoo/22 .md',
    '/sortmetoo/22.md',
    '/ü12/file.md',
    '/zappa/alpha/booger.md',
    '/zappa-2/alpha/booger-1.txt',
    '/zappa-2/alpha/booger-2.txt'
  ];
  t.same(u.sortBy(expected, SortEntry(opts)), expected, 'validate expected order');

  fsbase.listfiles(function(err, actual){
    t.same(filepathlist(actual), expected);
    t.end(err);
  });
});


test('sorted list, dirsFirst option', function(t){

  var opts = { path:__dirname + '/sortme', depth:5, dirsFirst:1 };
  var fsbase = FsBase(opts);

  var expected = [
    '/A(A/index/x.md',
    '/A(A/index.x',
    '/A(A/(index)',
    '/A(A/Aindex',
    '/sortmetoo/ 2.md',
    '/sortmetoo/22 .md',
    '/sortmetoo/22.md',
    '/ü12/file.md',
    '/zappa/alpha/booger.md',
    '/zappa-2/alpha/booger-1.txt',
    '/zappa-2/alpha/booger-2.txt',
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
    t.same(filepathlist(actual), expected);
    t.end(err);
  });
});

test('sorted list, dirsSame option', function(t){

  var opts = { path:__dirname + '/sortme', depth:5, dirsFirst:1, dirsSame:1 };
  var fsbase = FsBase(opts);

  var expected = [
    '/index.md',
    '/A(A/index.x',
    '/A(A/(index)',
    '/A(A/Aindex',
    '/A(A/index/x.md',
    '/A.md',
    '/Aa.md',
    '/b5.md',
    '/Ba.md',
    '/sortmetoo/ 2.md',
    '/sortmetoo/22 .md',
    '/sortmetoo/22.md',
    '/U.md',
    '/ú.md',
    '/Ú1.md',
    '/ü12/file.md',
    '/ü12.md',
    '/Ü3.md',
    '/Vz.md',
    '/Z.md',
    '/zappa/alpha/booger.md',
    '/zappa-2/alpha/booger-1.txt',
    '/zappa-2/alpha/booger-2.txt',
    '/ø.md'
  ];


  fsbase.listfiles(function(err, actual){
    t.same(filepathlist(actual), expected);
    t.end(err);
  });
});

test('sorted list, sortCase option', function(t){

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
    '/A(A/index.x',
    '/A(A/(index)',
    '/A(A/Aindex',
    '/A(A/index/x.md',
    '/sortmetoo/ 2.md',
    '/sortmetoo/22 .md',
    '/sortmetoo/22.md',
    '/ü12/file.md',
    '/zappa/alpha/booger.md',
    '/zappa-2/alpha/booger-1.txt',
    '/zappa-2/alpha/booger-2.txt'
  ];

  fsbase.listfiles(function(err, actual){
    t.same(filepathlist(actual), expected);
    t.end(err);
  });
});


test('sorted list, sortAccents option', function(t){

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
    '/A(A/index.x',
    '/A(A/(index)',
    '/A(A/Aindex',
    '/A(A/index/x.md',
    '/sortmetoo/ 2.md',
    '/sortmetoo/22 .md',
    '/sortmetoo/22.md',
    '/zappa/alpha/booger.md',
    '/zappa-2/alpha/booger-1.txt',
    '/zappa-2/alpha/booger-2.txt',
    '/ü12/file.md'
  ];

  fsbase.listfiles(function(err, actual){
    t.same(filepathlist(actual), expected);
    t.end(err);
  });
});


test('sorted list, blank indexFile option', function(t){

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
    '/A(A/Aindex',
    '/A(A/index.x',
    '/A(A/index/x.md',
    '/sortmetoo/ 2.md',
    '/sortmetoo/22 .md',
    '/sortmetoo/22.md',
    '/ü12/file.md',
    '/zappa/alpha/booger.md',
    '/zappa-2/alpha/booger-1.txt',
    '/zappa-2/alpha/booger-2.txt'
  ];

  fsbase.listfiles(function(err, actual){
    t.same(filepathlist(actual), expected);
    t.end(err);
  });
});


test('list single file', function(t){

  var opts = { path:__dirname + '/tree/2.txt' };
  var fsbase = FsBase(opts);

  var expected = [ '/2.txt' ];

  fsbase.listfiles(function(err, actual){
    t.same(filepathlist(actual), expected);
    t.end(err);
  });
});

test('list single dot-file', function(t){

  var opts = { path:__dirname + '/tree/.ignored' };
  var fsbase = FsBase(opts);

  var expected = [ '/.ignored' ];

  fsbase.listfiles(function(err, actual){
    t.same(filepathlist(actual), expected);
    t.end(err);
  });
});

function filepathlist(filelist) {
  return u.pluck(filelist, 'filepath');
}
