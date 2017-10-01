module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    less: {
      development: {
        options: {
          paths: ['/']
        },
        files: {
          'style.css': 'style.less'
        }
      }
    },

    watch: {
      src: {
        files: ['**/*.less'],
        tasks: ['less'],
      }
    },
  });


  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['less','watch']);

};
