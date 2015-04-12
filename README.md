# pub-src-fs

Default file system source for pub-server and pub-generator 

* provides `get()` and `put()` for bulk reads and writes
* globs and descends directories
* assumes that all files are utf-8 text

## src(options)

```javascript
var src = require('pub-src-fs');

// instantiate source on path
// options become properties of source
var source = src( { path:'.', glob:'**/*.js', depth:2, writable:true } );

source.get(function(err, files) {
  if (err) return console.log(err);
  console.log(_.pluck(files, 'path'));
});

```

### source.path
- recurses directories starting with `path`
- omits any directories starting with '.'
- results will not include the path, just a /

### source.glob
- `glob` is a [node-glob](https://github.com/isaacs/node-glob) pattern
- in order to support recursive descent on other systems (like github) this implementation does not use the glob library to walk directories
- instead it walks directories and then calls [minimatch](https://github.com/isaacs/minimatch) to test the files in those directories.
- because `path` is used as the root for globbing, globstars in the middle of the pattern are unlikely

### source.depth
- `depth` limits the depth of tree traversal when there is globstar 
- this is useful for avoiding symlink cycles and improving performance


### source.get(cb)
- `get()` fetches all matching files in one async operation
- the result is an array of file objects each with a `path:` and a `text:` property 
- the array is sorted alphabetically by path
- results do not include directories, but do include files in subdirectories
- if the source is writable, `get()` is atomic with respect to `put()` or other `source.get()` operations

```javascript
[ { path: '/fs-base.js',
    text: '...' },
  { path: '/pub-src-fs.js',
    text: '...' } ]
```

### source.put(files, cb)
- `put()` does nothing unless `writable` is set on the source
- it writes an array of file objects back to the file system overwriting existing files
- there is no partial file write but the array may contain a subset of the files read via `get()` 
- `put()` is atomic with respect to `source.get()` or other `source.put()` operations
- `put()` tries to avoid file corruption by writing to a temp location and then renaming files
- `put()` returns an array of the paths written

```javascript
source.put(files, function(err, result) {
  if (err) return console.log(err);
  console.log(result);
});
```

