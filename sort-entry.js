/* sortEntry(opts) returns fn(name, [type]) -> sortname
 * function returns munged name, for sorting file/path names with u.sortBy()
 * currently used by src-redis and src-fs
 * handles both simple filenames (src-fs) and full paths (src-redis)
 * assumes that names/paths are already normalized (no decomposed unicode)
 *
 * opts.sortCase - default false (case-insensitive)
 * opts.sortAccents - default false (accent-insensitive)
 * opts.dirsFirst - default false (files first)
 * opts.indexFile - default '.../index.xxx' sorts before other files
 *
 * copyright 2015-2019, Jurgen Leschner - github.com/jldec - MIT license
 */

/*eslint indent: ["off"]*/

var u = require('pub-util');
var decompose = require('unorm').nfd;

module.exports = function(opts) {

  var noCase = !opts.sortCase;
  var noAccents = !opts.sortAccents;

  var indexFile = 'indexFile' in opts ? opts.indexFile : 'index';

  // replace /index.extension with /
  var indexFileRe = new RegExp(
      '(^|\\/)' +
      u.escapeRegExp(indexFile) +
      '(\\.[^\\.\\/]*$|$)');

  // names without paths: type is passed in, add prefix to sort dirsFirst/Last
  var sortTypes = opts.sortTypes ||
    (opts.dirsFirst ? { 'dir':'1', 'file':'2' } : { 'dir':'2', 'file':'1' });

  // names with paths, replace rightmost / to sort dirsFirst/Last
  var baseDirRe = /\/([^/]*)$/;
  var baseDirMark = opts.dirsFirst ? '\uFFFF' : '\t';

  function sortEntry(name, type) {

    if (noCase) { name = name.toLowerCase(); }
    if (noAccents) { name = decompose(name); }

    var out = (type ? (sortTypes[type] || '') : '') +
      name.replace(indexFileRe, '$1\n$2')   // sort index files by extension
          .replace(baseDirRe, baseDirMark + '$1'); // directories First/Last

    return out;
  }

  return sortEntry;
};
