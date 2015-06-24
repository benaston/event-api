module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        preserveComments: false
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js']
        }
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    watch: {
      files: ['public/**/*', 'view-templates/index.ejs'],
      tasks: ['default'],
      options: {
        debounceDelay: 250
      }
    },
    jasmine: {
      customTemplate: {
        src: 'src/**/*.js',
        options: {
          specs: 'spec/**/*.js'
        }
      }
    },
    bump: {
      scripts: {
        updateConfigs: ["pkg"],
        commitFiles: ["-a"],
        push: false
      }
    },
    replace: {
      injectConstructorFunctionsIntoMainJs: {
        options: {
          patterns: [{
            match: 'registry',
            replacement: '<%= grunt.file.read("src/registry.js") %>'
          }, {
            match: 'api',
            replacement: '<%= grunt.file.read("src/api.js") %>'
          }, {
            match: 'connector',
            replacement: '<%= grunt.file.read("src/connector.js") %>'
          }]
        },
        files: [{
          src: ['src/main.js'],
          dest: 'dist/<%= pkg.name %>.js'
        }]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-replace');

  grunt.registerTask('test', ['replace', 'jasmine']);
  grunt.registerTask('default', ['replace', 'uglify']);

};