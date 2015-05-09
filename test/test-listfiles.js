/**
 * pub-src-fs test-listfiles
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
 *
**/

suite('pub-src-fs test-listfiles');

var assert = require('assert');
var deepdiff = require('deep-diff');
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
      assertNoDiff(actual, expected);
      done();
    });
  })
});


test("list single file", function(done){

  var opts = { path:__dirname + '/tree/2.txt', glob:'**/*.txt' };
  var fsbase = FsBase(opts);

  var expected = [ "/2.txt" ];

  fsbase.listfiles(function(err, actual){
    if (err) return done(err);
    assertNoDiff(actual, expected);
    done();
  });
});

function assertNoDiff(actual, expected, msg) {
  var diff = deepdiff(actual, expected);
  var maxdiff = 5;
  if (diff) {
    assert(false, 'deepDiff ' + (msg || '') + '\n'
      + u.inspect(diff.slice(0,maxdiff), {depth:3})
      + (diff.length > maxdiff ? '\n...(truncated)' : ''));
  }
}
