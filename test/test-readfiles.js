/**
 * pub-src-fs test-readfiles
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
 *
**/

var test = require('tape')

var expected =
[ { path: '/index.md',  text: '# root page\n- hello world\n\n## heading2\n\npara\n\n----\n----\n## fragment 1' },
  { path: '/page1.md',  text: '# page1\ncontent\ncontent\n' },
  { path: '/page2~.md', text: '----\na:1\n\n----\n\n# page2\ncontent\ncontent\n\n----\n----\n\n# page2#1\ncontent\ncontent\n\n' },
  { path: '/page3.md',
    text:
      '----\npage: /page3\n\n----\n# page3\nhas 2 additional fragments and some detached fragments\n\n' +
      '----\nfragment:/page3#fragment-1\n\n----\n# fragment 1\n\n' +
      '----\nfragment:/pagex#orphan-fragment-1\n\n----\norphan\n\n' +
      '----\nfragment:/page1#in-page3\n\n----\n\n' +
      '----\nfragment:/page3#fragment-2\n\n----' }
];


test("read md directory tree", function(t){

  var fsbase = require('../fs-base')( { path:__dirname + '/md', glob:'**/*.md' } );

  fsbase.readfiles(function(err, actual){
    t.same(actual, expected);
    t.end(err);
  });

});

test("read single file", function(t){

  var fsbase = require('../fs-base')( { path:__dirname + '/md/page1.md' } );

  fsbase.readfiles(function(err, actual){
    t.same(actual, [expected[1]]);
    t.end(err);
  });

});

test("readfiles with no result", function(t){

  var fsbase = require('../fs-base')( { path:__dirname + '/tree', glob:'**/*.booger' } );

  fsbase.readfiles(function(err, actual){
    t.same(actual, []);
    t.end(err);
  });

});
