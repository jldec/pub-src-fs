/**
 * pub-src-fs test-writefiles
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
 *
**/

suite('pub-src-fs test-writefiles');

var assert = require('assert');
var fs = require('fs');
var rmdir = require('rmdir');
var fsbase = require('../fs-base');
var deepdiff = require('deep-diff');
var u = require('pub-util');

after(function(done){
  var ok = u.after(3, done);
  rmdir(__dirname + '/testwrite', ok);
  rmdir(__dirname + '/testwrite2', ok);
  rmdir(__dirname + '/tmp', ok);
})

test("FS read, write and read back ./files", function(done) {

  var reader = fsbase( { path:__dirname + '/files', glob:'**/*.txt' } );
  var writer = fsbase( { path:__dirname + '/testwrite', writable:true, tmp:__dirname + '/tmp' } );

  reader.readfiles(function(err, files) { if (err) return done(err)

    writer.writefiles(files, 'test', function(err) { if (err) return done(err)

      writer.readfiles(function(err, actual){ if (err) return done(err)

        assertNoDiff(actual, files);
        done();

      });
    });
  });
});

test("FS read, write and read back ./tree", function(done) {

  var reader = fsbase( { path:__dirname + '/tree',       glob:'**/*.txt', depth:4 } );

  var writer = fsbase( { path:__dirname + '/testwrite2', glob:'**/*.txt', depth:4,
                          tmp:__dirname + '/tmp',        writable:true            } );

  reader.readfiles(function(err, files) { if (err) return done(err)

    writer.writefiles(files, 'test', function(err) { if (err) return done(err)

      writer.readfiles(function(err, actual){ if (err) return done(err)

        assertNoDiff(actual, files);
        done();

      });
    });
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
