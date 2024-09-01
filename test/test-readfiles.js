/**
 * pub-src-fs test-readfiles
 * Copyright (c) 2015-2024 Jürgen Leschner - github.com/jldec - MIT license
 *
**/

var test = require('tape');
var fs = require('fs');

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


test('read md directory tree', function(t){

  var fsbase = require('../fs-base')( { path:__dirname + '/md', glob:'**/*.md' } );

  fsbase.readfiles(function(err, actual){
    t.same(actual, expected);
    t.end(err);
  });

});

test('read single file', function(t){

  var fsbase = require('../fs-base')( { path:__dirname + '/md/page1.md' } );

  fsbase.readfiles(function(err, actual){
    t.same(actual, [expected[1]]);
    t.end(err);
  });

});

test('readfiles with no result', function(t){

  var fsbase = require('../fs-base')( { path:__dirname + '/tree', glob:'**/*.booger' } );

  fsbase.readfiles(function(err, actual){
    t.same(actual, []);
    t.end(err);
  });

});

var expected2 =
[ { path: '/-foo.txt', text: 'file some -->  ⌘ <---' },
  { path: '/1.txt', text: '' },
  { path: '/2.txt', text: '' },
  { path: '/3.txt', text: '' },
  { path: '/4.txt', text: '' },
  { path: '/5.txt', text: '' },
  { path: '/ignored.md', text: 'this file should not be included in listfies' },
  { path: '/1/9.txt', text: '' },
  { path: '/2/4m.png', buffer: fs.readFileSync(__dirname + '/tree/2/4m.png') },
  { path: '/2/6k.png', buffer: fs.readFileSync(__dirname + '/tree/2/6k.png') },
  { path: '/2/10.txt/11.txt', text: 'boogerü\n' },
  { path: '/2/10.txt/12.txt', text: '' },
  { path: '/2/10.txt/13/14.txt', text: '' },
  { path: '/2/10.txt/13/level-4/not-ignored.txt', text: '' },
  { path: '/f1/6.txt', text: '' },
  { path: '/f1/7.txt', text: '' },
  { path: '/f2/8.txt', text: '' } ];


test('read tree with binaries', function(t){

  var fsbase = require('../fs-base')( { path:__dirname + '/tree', glob:'**/*.*', includeBinaries:true } );

  fsbase.readfiles(function(err, actual){
    t.same(actual, expected2);
    t.end(err);
  });

});
