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

    'ftp-deploy': {
      build: {
        auth: {
          host: 'ftp.salmiakmedia.se',
          port: 21,
          authKey: 'production'
        },
        src: './',
        dest: '/mat.familjenbeckman.se/public_html/wp-content/themes/mat',
        exclusions: ['./**/.DS_Store', './**/Thumbs.db', './.git']
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-ftp-deploy');

  grunt.registerTask('default', ['less','watch']);
  grunt.registerTask('deploy', ['less','ftp-deploy']);


};
