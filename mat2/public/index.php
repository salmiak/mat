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

    <?php wp_footer(); ?>

  <script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/static/js/manifest.9f49aaab7723c5cba73c.js"></script><script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/static/js/vendor.448f2d15e3f6731dd22b.js"></script><script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/static/js/app.826c417112b191bd7a56.js"></script></body>
</html>
