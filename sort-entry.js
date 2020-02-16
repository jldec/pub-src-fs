/* sortEntry(opts) returns fn(name) -> sortname
 * returns munged name, for sorting file/path names with u.sortBy()
 * currently used by src-redis and src-fs
 * handles both simple file/directory names (src-fs) and full paths (src-redis)
 * enables dirsFirst true/false by prefixing all names or pathname segments
 * assumes that names/paths are already normalized (no decomposed unicode)
 *
 * opts.sortCase - default false (case-insensitive)
 * opts.sortAccents - default false (accent-insensitive)
 * opts.dirsFirst - default false (files first)
 * opts.indexFile - default '.../index.xxx' sorts before other files
 *
 * copyright 2015-2020, Jürgen Leschner - github.com/jldec - MIT license
 */

/*eslint indent: ["off"]*/

var u = require('pub-util');
var decompose = require('unorm').nfd;

module.exports = function(opts) {
  opts = opts || {};

  var noCase = !opts.sortCase;
  var noAccents = !opts.sortAccents;

  var indexFile = 'indexFile' in opts ? opts.indexFile : 'index';

  // replace /index.extension with /
  var indexFileRe = new RegExp(
      '(^|\\/)' +
      u.escapeRegExp(indexFile) +
      '(\\.[^\\.\\/]*$|$)');

  // names without paths: type is passed in, add prefix to sort dirsFirst/Last
  var filePrefix = opts.dirsFirst ? '2' : '1';
  var dirPrefix  = opts.dirsFirst ? '1' : '2';

  function sortEntry(name) {

    if (noCase) { name = name.toLowerCase(); }
    if (noAccents) { name = decompose(name); }

    name = name.replace(indexFileRe, '$1\u0000$2'); // force first and sort by extension

    var parts = name.split('/');
    var last = parts.length - 1;

    name = u.map(parts, function(s, idx) {
      return (idx === last ? filePrefix : dirPrefix) + s;
    }).join('\u0000'); // force delimiters to sort before anything

    return name;
  }

  return sortEntry;
};
