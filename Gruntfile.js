/**
 * Base Grunt configuration
 */
module.exports = function( grunt ){
	'use strict';
	require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );

    grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),
		
        // Add Compass compilation for css/scss with import reference to the base of bower_components
		compass: {
			build: {
				options: {
					noLineComments: true,
					debugInfo: false,
					sourcemap: true,
					sassDir: 'src/scss',
					cssDir: 'css/'
				}
			}
		},
		// Concatenate all src JS files under js/src
        concat: {
        	options: {
        		separator: ';',
        	},
        	dist: {
        		files: {
        			'js/main.js':	[ 'src/js/{,*/}*.js' ]
        		}
        	}
        },
        // Minification of CSS files
        cssmin: {
            options: {
            	compatibility: 'ie8',
                keepSpecialComments: '*',
                advanced: false
            },
            build: {
            	files: {
            		'css/main.min.css': [ 'css/main.css' ]
            	}
            }
        },
        // Standard watch method, use via terminal if IDE integration is not used
        watch: {
            js: {
                files: [ 'src/js/{,*/}*.js' ],
                tasks: [ 'buildjs' ]
            },
            css: {
                files: [ 'src/scss/{,*/}*.scss' ],
                tasks: [ 'buildcss' ]
            }
        },
        // Minify JS files
        uglify: {
            build: {
                files: {
                    'js/main.min.js': [ 'js/main.js' ]
                }
            }
        }
    });
    grunt.registerTask( 'buildjs', [ 'concat', 'uglify' ] );
    grunt.registerTask( 'buildcss', [ 'compass', 'cssmin' ] );
    grunt.registerTask( 'buildall', [ 'buildcss', 'buildjs' ] );
};