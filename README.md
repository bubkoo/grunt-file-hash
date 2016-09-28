# grunt-file-hash

> Create version mapping for your static files.

[![MIT License](https://img.shields.io/badge/license-MIT_License-green.svg?style=flat-square)](https://github.com/bubkoo/grunt-file-hash/blob/master/LICENSE)
[![Package Quality](http://npm.packagequality.com/shield/grunt-file-hash.svg)](http://packagequality.com/#?package=grunt-file-hash)


## Getting Started

This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-file-hash --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-file-hash');
```

## The "filehash" task

### Overview
In your project's Gruntfile, add a section named `filehash` to the data object passed into `grunt.initConfig()`.

```javascript
grunt.initConfig({
  filehash: {
    options: {
      mapping: '#{= dest}/hash.json',                      // the mapping file path
      mappingKey: '{{= cwd}}/{{= basename}}{{= extname}}', // mapping key options
      mappingValue: '{{= dest}}/{{= basename}}.{{= hash}}{{= extname}}', // mapping value options
      etag: null,
      algorithm: 'md5', // the algorithm to create the hash
      rename: '#{= dirname}/#{= basename}_#{= hash}#{= extname}', // save the original file as what
      keep: true,      // should we keep the original file or not
      merge: false,    // merge hash results into existing `hash.json` file or override it.
      hashlen: 10     // length for hashsum digest
    },
    your_target: {
      // Target-specific file lists and/or options go here.
      options: {
        output: 'static/mapping.json'
      },
      files: {
        cwd: 'static/dist',
        src: ['js/**/*.js', 'css/**/*.css'],
        dest: 'static/dist'
      }
    }
  }
});
```

### Options

#### options.mapping
Type: `String`
Default value: `'{{= dest}}/mapping.json'`

Where to save the hash mapping json file.
Available variables are `dest`, `cwd`.
You can always use `#{= grunt.config.get(...) }'` to access config data in your `Gruntfile`.

Set to `null` will disable the output.

#### options.mappingKey
Type: `String`
Default value: `'{{= cwd}}/{{= basename}}{{= extname}}'`

A string value that is used to define the json file's key.

#### options.mappingValue
Type: `String`
Default value: `'{{= dest}}/{{= basename}}.{{= hash}}{{= extname}}'`

A string value that is used to define the json file's value.

With the default options, the output would be like this:

```js
{
  "src/js/a.js": "dest/js/a.aaa93n3f2.js",
  "src/css/foo.css": "dest/css/foo.maaof33mao.css"
}
```

#### options.etag <a id="option-etag"></a>
Type: `String`
Default value: `null`

In spite of standard digest algorithms provided by the
[crypto]('http://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm') module,
you can set a "etag" format to use as file version.

Set `etag` to `true` will use the default format: `#{= size}-#{= +mtime}`.

All values in a [fs.Stats](http://nodejs.org/api/fs.html#fs_class_fs_stats) result are available.

#### options.algorithm
Type: `String`
Default value: `'md5'`

The algorithm to generate hash digests. Depend on the version of OpenSSL on the platform.
Examples are `'sha1'`, `'md5'`, `'sha256'`, etc.

#### options.hashlen
Type: `Number`
Default value: `10`

The length of a hash digest hex value.

#### options.rename
Type: `String`
Default value: `'#{= dirname}/#{= basename}\_#{= hash}#{= extname}'`

Rename files, to include a hash in it. This is often for safely bursting cache.
Available variables are:

  - **hash**      - The hash/etag value.
  - **dest**      - The destination directory.
  - **cwd**       - The `cwd` you setted for `files` prop section.
  - **filepath**  - The path of the file.
  - **basename**  - The basename of the file, with extension name excluded.
  - **dirname**   - The directory name of the file.
  - **extname**   - The extension name of the file.

Examples:

    "abc/defg/hijk.js" =>
    {
      filepath: "abc/defg/hijk.js",
      basename: "hijk",
      dirname: "abc/defg",
      extname: "js"
    }

With the default rename format, the result will be something like `"abc/defg/hijk\_e8e7f9e4.js"`.

Will raise a warning if the renamed target is not in dest directory.
  
#### options.keep
Type: `String`
Default value: `true`

Whether to keep the original files after rename it.

#### options.merge
Type: `String`
Default value: `false`

This option is mainly for cases like this:

```js
grunt.initConfig({
  hashmap: {
    options: {
      output: 'static/hash.json',
      merge: true,
    },
    js: {
      cwd: 'static/dist',
      src: 'js/**/*.js',
      dest: 'static/dist'
    },
    css: {
      cwd: 'static/dist',
      src: 'css/**/*.css',
      dest: 'static/dist'
    },
  },
  watch: {
    js: {
      files: ['static/js/**/*.js'],
      tasks: ['hashmap:js']
    }, 
    css: {
      files: ['static/css/**/*.css'],
      tasks: ['hashmap:css']
    }
  },
})
```

filehash tasks for css and js are created seperately.
So with the `grunt-contrib-watch` running, when you modify one single file,
grunt won't need to run the whole hash mapping process for all files.

Since all the hash results will be written to the same file, and the mapping file
are automatically merged. It is safe to refer to `mapping.json` for all static files
in your application's static url generator.

The downside of this practice is that hashes for deleted files will never be removed,
unless `mapping.json` is removed. But of course, you can always set up a `grunt clean` task. 


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

