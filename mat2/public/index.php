<?php
if( !is_user_logged_in() ) {
  header( sprintf( "Location: %s/wp-admin", get_bloginfo('url') ) );
  die();
};
?>

<!DOCTYPE html>
  <html <?php language_attributes(); ?>>
  <head>

    <!--

      Welcome to the source of this site -
      I built this: Salmiak media (http://salmiakmedia.se)

    -->

    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width">

    <?php wp_head(); ?>

  </head>

  <body <?php body_class(); ?>>

    <div id="app"></div>
    <!-- built files will be auto injected -->
    
    <script>
      window.wp_root_url = "<?php bloginfo('url'); ?>";
    </script>

    <?php wp_footer(); ?>


  <script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/static/js/manifest.95633d06d7c58f9ca7ae.js"></script><script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/static/js/vendor.79430da14f2564cd6178.js"></script><script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/static/js/app.9b2fa1bfdd79db333005.js"></script></body>
</html>
