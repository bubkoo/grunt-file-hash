# grunt-file-hash

> Create version mapping for your static files.

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
      mapping: '#{= dest}/hash.json', // the mapping file path
      etag: null,
      algorithm: 'md5', // the algorithm to create the hash
      rename: '#{= dirname}/#{= basename}_#{= hash}#{= extname}', // save the original file as what
      keep: true, // should we keep the original file or not
      merge: false, // merge hash results into existing `hash.json` file or override it.
      hashlen: 10, // length for hashsum digest
    },
    your_target: {
      // Target-specific file lists and/or options go here.
      options: {
        output: 'static/versions.json',
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

#### options.separator
Type: `String`
Default value: `',  '`

A string value that is used to do something with whatever.

#### options.punctuation
Type: `String`
Default value: `'.'`

A string value that is used to do something else with whatever else.

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  file_hash: {
    options: {},
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

#### Custom Options
In this example, custom options are used to do something else with whatever else. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result in this case would be `Testing: 1 2 3 !!!`

```js
grunt.initConfig({
  file_hash: {
    options: {
      separator: ': ',
      punctuation: ' !!!',
    },
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
