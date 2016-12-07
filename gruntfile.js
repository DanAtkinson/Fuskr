/*global module*/
(function () {
	"use strict";

	module.exports = function (grunt) {
		grunt.initConfig({
			pkg: grunt.file.readJSON('package.json'),

			jshint: {
				files: ['Scripts/**/*.js']
			},
			sass: {
				all: {
					options: {
						includePaths: 'scss',
						outputStyle: 'compact'
					},
					files: {
						'dist/css/app.css': 'scss/app_all.scss'
					}
				}
			},
			watch: {
				grunt: { files: ['Gruntfile.js'] },
				sass: {
					files: ['scss/*.scss'],
					tasks: ['sass:all', 'concat', 'csssplit', 'copy:all']
				},
				js: {
					files: ['Scripts/**/*.js'],
					tasks: ['uglify']
				}
			},
			concat: {
				options: {
					separator: '',
					stripBanners: true
				},
				dist: {
					src: [
						// Combine custom jQueryUI CSS with SASS output
						'src/css/jquery-ui/jquery-ui-1.10.3.custom.css',
						'bower_components/angular-material/angular-material.min.css',
						'dist/css/app.css'
					],
					dest: 'dist/css/app_all.css'
				}
			},
			csssplit: {
				main: {
					src: ['dist/css/app_all.css'],
					dest: 'dist/css/app_all.css',
					options: {
						maxRules: 2095,
						suffix: '_'
					}
				}
			},
			csslint: {
				lax: {
					options: {
						// get list from node_modules/grunt-contrib-csslint
						// node -e "require('csslint').CSSLint.getRules().forEach(function(x) { console.log(',\\'' + x.id + '\\' : false') })"
						'important': false,
						'adjoining-classes': false,
						'known-properties': false,
						'box-sizing': false,
						'box-model': false,
						'overqualified-elements': false,
						'display-property-grouping': false,
						'bulletproof-font-face': false,
						'compatible-vendor-prefixes': false,
						'regex-selectors': false,
						'errors': true,
						'duplicate-background-images': false,
						'duplicate-properties': false,
						'empty-rules': false,
						'selector-max-approaching': false,
						'gradients': false,
						'fallback-colors': false,
						'font-sizes': false,
						'font-faces': false,
						'floats': false,
						'star-property-hack': false,
						'outline-none': false,
						'import': false,
						'ids': false,
						'underscore-property-hack': false,
						'rules-count': false,
						'qualified-headings': false,
						'selector-max': false,
						'shorthand': false,
						'text-indent': false,
						'unique-headings': false,
						'universal-selector': false,
						'unqualified-attributes': false,
						'vendor-prefix': false,
						'zero-units' : false
					},
					src: ['dist/css/app_all*.css']
				}
			},
			uglify: {
				js: {
					files: {
						'dist/js/app_libs.js': [
							'node_modules/jquery/dist/jquery.min.js',
							//'node_modules/jquery-ui/'
							'node_modules/angular/angular.min.js',
							'node_modules/angular-ui-router/release/angular-ui-router.min.js',
							'node_modules/angular-popeye/release/popeye.min.js',
							'node_modules/jszip/dist/jszip.min.js',
							'node_modules/FileSaver/FileSaver.js'
						],
						'dist/js/app_all.js': [
							'Scripts/app.js',
							'Scripts/directives/*.js',
							'Scripts/services/*.js',
							'Scripts/helpers/*.js',
							'Scripts/controllers/*.js'
						]
					},
					options: {
						preserveComments: false,
						beautify: false,
						mangle: false,
						compress: false
					}
				}
			},
			copy: {
				all: {
					files: [
						{
							expand: true,
							nonull: true,
							flatten: true,
							src: ['dist/css/app_all_*'],
							filter: 'isFile'
						}
					]
				}
			},
			clean: {
				jscss: ["dist/js/*.js", "dist/css/app_all_*.css"],
				afterbuild: ["dist/css_*", "dist/css/app_all_*.css", "dist/css/app_all.css", "dist/css/app.css"]
			}
		});

		// Now load in required tasks
		grunt.loadNpmTasks('grunt-sass');
		grunt.loadNpmTasks('grunt-contrib-watch');
		grunt.loadNpmTasks('grunt-contrib-uglify');
		grunt.loadNpmTasks('grunt-contrib-concat');
		grunt.loadNpmTasks('grunt-contrib-csslint');
		grunt.loadNpmTasks('grunt-csssplit');
		grunt.loadNpmTasks('grunt-contrib-jshint');
		grunt.loadNpmTasks('grunt-contrib-copy');
		grunt.loadNpmTasks('grunt-contrib-clean');

		// build all required files
		grunt.registerTask('build', ['clean:jscss', 'sass:all', 'concat', 'csssplit', 'uglify', 'copy:all', 'clean:afterbuild']);
		grunt.registerTask('build-all', ['clean:jscss', 'sass:all', 'concat', 'csssplit', 'uglify', 'copy:all', 'clean:jscss', 'clean:afterbuild']);
		grunt.registerTask('checkjs', ['jshint']);

		// validate css files
		grunt.registerTask('lint', ['csslint']);

		// development process (default)
		grunt.registerTask('default', ['build', 'watch']);
	};
}());
