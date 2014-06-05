/*
 * grunt-file-hash
 * https://github.com/bubkoo/grunt-file-hash
 *
 * Copyright (c) 2014 bubkoo
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var crypto = require('crypto');
    var path = require('path');
    var fs = require('fs');
    var defaultOutput = '{{= dest}}/hash.json';
    var defaultEtag = '{{= size}}-{{= +mtime}}';
    var defaultRename = '{{= dirname}}/{{= basename}}.{{= hash}}{{= extname}}';
    var defaultMappingKey = '{{= cwd}}/{{= basename}}{{= extname}}';
    var defaultMappingValue = '{{= dest}}/{{= basename}}.{{= hash}}{{= extname}}';

    grunt.registerMultiTask('filehash', 'Create version mapping for your static files.', function () {

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            mapping: defaultOutput,
            mappingKey: defaultMappingKey,
            mappingValue: defaultMappingValue,
            merge: false,
            encoding: null, // encoding of file contents
            etag: null,
            algorithm: 'md5',       // the algorithm to create the hash
            rename: defaultRename,  // save the original file as what
            keep: true,             // should we keep the original file or not
            hashlen: 10,            // length for hashsum digest
            salt: null              // salt to add to the file contents before hashing
        });

        // add a custom template
        grunt.template.addDelimiters('{{ }}', '{{', '}}');
        var templateOptions = {
            delimiters: '{{ }}'
        };

        var encoding = options.encoding;
        var renameFormat = ('string' === typeof options.rename ) ? options.rename : defaultRename;
        var done = this.async();

        // Iterate over all specified file groups.
        this.files.forEach(function (f) {

            var cwd = f.cwd;
            var dest = f.dest;

            // Concat specified files.
            var src = f.src.filter(function (filePath) {
                filePath = getRealPath(filePath);
                if (!grunt.file.exists(filePath)) {
                    grunt.log.warn('Source file "' + filePath + '" not found.');
                    return false;
                } else if (grunt.file.isFile(filePath)) {
                    return true;
                }
            });

            if (!src.length) {
                grunt.log.writeln('No source file..');
                done();
                return;
            }

            if (dest && grunt.file.isFile(dest)) {
                grunt.fail.fatal('Destination for target %s is not a directory', dest);
            }

            var mapping = {};

            src.forEach(function (filePath) {

                var realPath = getRealPath(filePath),
                    hashed;

                // firstly, go with etag.
                if (options.etag) {

                    fs.stat(realPath, function (err, stats) {
                        if (err) {
                            grunt.log.error('Stats for "' + filePath + '" failed.');
                        }
                        var etag = (typeof options.etag === 'string') ? options.etag : defaultEtag;
                        templateOptions['data'] = stats;
                        hashed = grunt.template.process(etag, templateOptions);
                        flush(filePath, hashed);
                    });

                } else {

                    var stream = fs.ReadStream(realPath);
                    var shasum = crypto.createHash(options.algorithm);

                    stream.on('data', function (data) {
                        if (encoding) {
                            data = data.toString(encoding);
                        }
                        shasum.update(data);
                    });

                    stream.on('end', function () {
                        if (options.salt) {
                            shasum.update(options.salt);
                        }
                        hashed = shasum.digest('hex').slice(0, options.hashlen);
                        flush(filePath, hashed);
                    });

                }
            });


            // get the file's real path
            function getRealPath(filePath) {
                return cwd ? path.join(cwd, filePath) : filePath;
            }

            function flush(filePath, hashed) {

                grunt.verbose.writeln(
                        (options.etag ? 'Etag' : 'Hash') + ' for ' + filePath + ': ' + hashed);

                if (dest) {
                    saveFile(filePath, hashed);
                }

                if (Object.keys(mapping).length === src.length) {
                    createMapping();
                }
            }

            function saveFile(filePath, hashed) {
                var srcFile = getRealPath(filePath);
                var distFile = path.join(dest, getFileName(renameFormat, filePath, hashed));
                if (srcFile !== distFile) {
                    if (distFile.indexOf(dest) === -1) {
                        grunt.log.warn('Renamed target "' + distFile + '" is not in dest directory.');
                    }
                    grunt.file.copy(srcFile, distFile);
                    grunt.log.writeln('✔ '.green + srcFile + ' => '.magenta + distFile);

                    if (!options.keep) {
                        grunt.verbose.writeln('Deleting source "' + srcFile + '"..');
                        grunt.file.delete(srcFile);
                    }
                }

                if (options.mapping) {

                    var key = getFileName('string' === typeof options.mappingKey
                        ? options.mappingKey : defaultMappingKey, filePath, hashed);

                    mapping[ key ] = getFileName('string' === typeof options.mappingValue
                        ? options.mappingValue : defaultMappingValue, filePath, hashed);
                }
            }

            function getFileName(tpl, filePath, hash) {
                if (tpl) {
                    var extname = path.extname(filePath);
                    templateOptions['data'] = {
                        dest: dest,
                        cwd: cwd,
                        hash: hash,
                        extname: extname,
                        dirname: path.dirname(filePath),
                        basename: path.basename(filePath, extname)
                    };
                    filePath = grunt.template.process(tpl, templateOptions);
                }
                return filePath;
            }

            function createMapping() {

                if (options.mapping) {

                    grunt.log.writeln('  All hashed. Generating mapping file.'.grey);

                    templateOptions['data'] = {
                        cwd: cwd || '',
                        dest: dest
                    };

                    var jsonFile = 'string' === typeof options.mapping ? options.mapping : defaultOutput;
                    jsonFile = grunt.template.process(jsonFile, templateOptions);

                    if (options.merge && grunt.file.exists(jsonFile)) {

                        var old = grunt.file.readJSON(jsonFile);
                        if (typeof old === 'object') {
                            for (var key in old) {
                                if (!(key in mapping)) {
                                    mapping[ key ] = old[ key ];
                                }
                            }
                        }

                    }

                    mapping = sortObject(mapping);
                    grunt.file.write(jsonFile, JSON.stringify(mapping, null, 2));
                    grunt.log.writeln('✔ '.green + 'Mapping file: ' + jsonFile + ' saved.');

                } else {
                    grunt.log.writeln('  All hashed.'.grey);
                }


                done();
            }

            function sortObject(obj) {
                var arr = [],
                    sortedObject = {};

                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        arr.push(key);
                    }
                }

                arr.sort();

                for (var i = 0, l = arr.length; i < l; i++) {
                    sortedObject[arr[i]] = obj[arr[i]];
                }

                return sortedObject;
            }

        });

    });

};
