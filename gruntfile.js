/*globals module:false, require */
module.exports = function (grunt) {
    'use strict';

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    const sass = require('node-sass');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        config: {
            manifest: grunt.file.readJSON('manifest.json'),
            dist: 'dist',
            app: {
                src: [
                    'Scripts/fuskr.js',
                    'Scripts/app/app.js',
                    'Scripts/app/**/*.js'
                ]
            },
            background: {
                src: [
                    'Scripts/fuskr.js',
                    'Scripts/background.js'
                ]
            },
            optionsjs: {
                src: [
                    'Scripts/options.js'
                ]
            },
            vendor: {
                src: [
                    'node_modules/angular/angular.js',
                    'node_modules/angular-sanitize/angular-sanitize.js',
                    'node_modules/file-saver/dist/FileSaver.js',
                    'node_modules/jszip/dist/jszip.js'
                ]
            },
            styles: {
                src: ['Styles/styles.scss']
            },
            html: {
                src: ['Html/**/*']
            },
            images: {
                src: ['Images/**/*']
            },
            chromeFiles: {
                src: [
                    'manifest.json',
                    'README.markdown',
                    'LICENCE',
                    '_locales/**/*'
                ]
            }
        },
        sasslint: {
            options: {
                configFile: '.sass-lint.yml'
            },
            main: ['<%= config.styles.src %>']
        },
        sass: {
            app: {
                    files: [{
                    expand: true,
                    src: ['<%= config.styles.src %>'],
                    dest: '<%= config.dist %>/Styles',
                    ext: '.css',
                    flatten: true
                }]
            },
            options: {
                implementation: sass
            }
        },
        jshint: {
            app: ['<%= config.app.src %>'],
            background: ['<%= config.background.src %>'],
            optionsjs: ['<%= config.optionsjs.src %>'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        eslint: {
            app: ['<%= config.app.src %>'],
            background: ['<%= config.background.src %>'],
            optionsjs: ['<%= config.optionsjs.src %>'],
            options: {
                config: '.eslintrc.json',
                requireCurlyBraces: ['if']
            }
        },
        htmllint: {
            main: {
                src: ['Html/**/*.html', 'Html/**/*.htm', '!Html/partials/**/*']
            }
        },
        concat: {
            options: {
                sourceMap: true
            },
            app: {
                src: ['<%= config.app.src %>'],
                dest: '<%= config.dist %>/Scripts/app.js'
            },
            background: {
                src: ['<%= config.background.src %>'],
                dest: '<%= config.dist %>/Scripts/background.js'
            },
            optionsjs: {
                src: ['<%= config.optionsjs.src %>'],
                dest: '<%= config.dist %>/Scripts/options.js'
            },
            vendor: {
                src: ['<%= config.vendor.src %>'],
                dest: '<%= config.dist %>/Scripts/vendor.js'
            }
        },
        uglify: {
            app: {
                src: '<%= concat.app.dest %>',
                dest: '<%= config.dist %>/Scripts/app.js'
            },
            background: {
                src: '<%= concat.background.dest %>',
                dest: '<%= config.dist %>/Scripts/background.js'
            },
            optionsjs: {
                src: '<%= concat.optionsjs.dest %>',
                dest: '<%= config.dist %>/Scripts/optionsjs.js'
            },
            vendor: {
                src: '<%= concat.vendor.dest %>',
                dest: '<%= config.dist %>/Scripts/vendor.js'
            }
        },
        copy: {
            html: {
                expand: true,
                src: ['<%= config.html.src %>'],
                dest: '<%= config.dist %>'
            },
            images: {
                expand: true,
                src: ['<%= config.images.src %>'],
                dest: '<%= config.dist %>'
            },
            chromeFiles: {
                expand: true,
                src: ['<%= config.chromeFiles.src %>'],
                dest: '<%= config.dist %>'
            }
        },
        watch: {
            styles: {
                files: ['<%= config.styles.src %>'],
                tasks: ['lint:styles', 'compile:styles']
            },
            vendorStyles: {
                files: ['<%= config.vendorStyles.src %>'],
                tasks: ['compile:vendorStyles']
            },
            app: {
                files: ['<%= concat.app.src %>'],
                tasks: ['lint:app', 'compile:app', 'karma:release']
            },
            background: {
                files: ['<%= concat.background.src %>'],
                tasks: ['lint:background', 'compile:background']
            },
            optionsjs: {
                files: ['<%= concat.optionsjs.src %>'],
                tasks: ['lint:optionsjs', 'compile:optionsjs']
            },
            vendor: {
                files: ['<%= concat.vendor.src %>'],
                tasks: ['compile:vendor']
            },
            html: {
                files: ['<%= config.html.src %>'],
                tasks: ['lint:html', 'copy:html']
            },
            images: {
                files: ['<%= config.images.src %>'],
                tasks: ['copy:images']
            },
            tests: {
                files: ['Tests/**/*.spec.js'],
                tasks: ['karma:release']
            },
            chromeFiles: {
                files: ['<%= config.chromeFiles.src %>'],
                tasks: ['copy:chromeFiles']
            },
            gruntFile: {
                files: ['gruntfile.js'],
                tasks: ['build']
            }
        },
        concurrent: {
            dev: {
                tasks: ['build', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        karma: {
            release: {
                options: {
                    singleRun: true,
                    browsers: ['PhantomJS'],
                    frameworks: ['jasmine'],
                    files: [
                        '<%= config.dist %>/Scripts/vendor.js',
                        '<%= config.dist %>/Scripts/app.js',
                        'Tests/lib/**/*.js',
                        'Tests/**/*.spec.js'
                    ]
                }
            },
            dev: {
                options: {
                    singleRun: true,
                    browsers: ['PhantomJS'],
                    frameworks: ['jasmine'],
                    files: [
                        'node_modules/angular/angular.js',
                        'node_modules/angular-sanitize/angular-sanitize.js',
                        'node_modules/file-saver/dist/FileSaver.js',
                        'node_modules/jszip/dist/jszip.js',
                        'Scripts/Fuskr.js',
                        'Scripts/app/*.js',
                        'Tests/lib/**/*.js',
                        'Tests/**/*.spec.js'
                    ]
                }
            }
        },
        clean: {
            vendorStyles: ['dist/Styles/vendor'],
            dist: ['<%= config.dist %>/**/*'],
            removeSourceMaps: ['<%= config.dist %>/**/*.css.map', '<%= config.dist %>/**/*.js.map']
        },
        compress: {
            release: {
                options: {
                    archive: 'fuskr-<%= config.manifest.version %>.zip'
                },
                expand: true,
                cwd: 'dist/',
                src: ['**/*'],
                dest: '/'
            }
        }
    });

    grunt.registerTask('lint', ['lint:app', 'lint:background', 'lint:optionsjs', 'lint:styles' /*, 'lint:html'*/]);
    grunt.registerTask('lint:app', ['jshint:app', 'eslint:app']);
    grunt.registerTask('lint:background', ['jshint:background', 'eslint:background']);
    grunt.registerTask('lint:optionsjs', ['jshint:optionsjs', 'eslint:optionsjs']);
    grunt.registerTask('lint:styles', ['sasslint']);
    grunt.registerTask('lint:html', ['htmllint']);

    grunt.registerTask('compile', ['compile:app', 'compile:background', 'compile:optionsjs', 'compile:vendor', 'compile:styles']);
    grunt.registerTask('compile:app', ['concat:app' /*, 'uglify:app'*/]);
    grunt.registerTask('compile:background', ['concat:background' /*, 'uglify:background' */]);
    grunt.registerTask('compile:optionsjs', ['concat:optionsjs' /*, 'uglify:background' */]);
    grunt.registerTask('compile:vendor', ['concat:vendor']);
    grunt.registerTask('compile:styles', ['sass:app']);
   
    grunt.registerTask('default', ['concurrent:dev']);
    grunt.registerTask('build', ['lint', 'clean:dist', 'compile', 'copy', 'karma:release']);
    grunt.registerTask('release', ['build', 'clean:removeSourceMaps', 'compress:release']);
    grunt.registerTask('test', ['karma:dev']);

    grunt.registerTask('travis:build', ['lint', 'clean:dist', 'compile', 'copy']);
    grunt.registerTask('travis:test', ['karma:release']);
};
