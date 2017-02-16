module.exports = function(grunt) {

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> <%= pkg.version %> | (C) 2007, <%= grunt.template.today("yyyy") %> National Institute For Space Research (INPE) - Brazil | https://github.com/TerraMA2/terrama2/blob/master/LICENSE */',
    requirejs: {
      BDQueimadas: {
        options: {
          baseUrl: "public/javascripts",
          out: "public/dist/BDQueimadas.min.js",
          preserveLicenseComments: false,
          paths: {
            TerraMA2WebComponents: "../externals/TerraMA2WebComponents/TerraMA2WebComponents.min"
          },
          include: [
            '../externals/almond/almond',
            'Startup',
            'BDQueimadas',
            'components/AttributesTable',
            'components/Filter',
            'components/Graphics',
            'components/Map',
            'components/Utils'
          ]
        }
      }
    },
    cssmin: {
      BDQueimadas: {
        files: [{
          expand: true,
          cwd: 'public/stylesheets',
          src: ['*.css'],
          dest: 'public/dist',
          ext: '.min.css'
        }]
      }
    },
    usebanner: {
      BDQueimadas: {
        options: {
          position: 'top',
          banner: '<%= banner %>',
          linebreak: true
        },
        files: {
          src: [ 'public/dist/*' ]
        }
      }
    },
    jsdoc : {
      BDQueimadas: {
        src: ['README.md'],
        options: {
          configure: 'configurations/jsdoc/config.json',
          destination: 'public/docs'
        }
      }
    },
    watch: {
      css: {
        files: ["public/stylesheets/*.css"],
        tasks: ["cssmin", "usebanner"],
        options: {
          // It allows to compile only when needed
          spawn: false
        }
      },
      gruntfile: {
        files: ["gruntfile.js"],
        tasks: ["default"],
        options: {
          spawn: false
        }
      },
      js: {
        files: ["public/javascripts/*.js", "public/javascripts/components/*.js"],
        tasks: ["requirejs", "usebanner"],
        options: {
          // It allows to compile only when needed
          spawn: false
        }
      }
    }
  });

  // Print helper to detect which file has beed changed
  grunt.event.on('watch', function(action, filepath, target) {
    grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  });

  // Load the plugins.
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-jsdoc');

  // Default tasks.
  grunt.registerTask('default', ['requirejs', 'cssmin', 'usebanner:BDQueimadas', 'jsdoc']);

};
