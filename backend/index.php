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

    <meta charset="<?php bloginfo( 'charset' ); ?>" />
    <meta name="viewport" content="width=device-width">

    <title>Matplanering</title>

    <?php wp_head(); ?>

  </head>

  <body <?php body_class(); ?>>
    Silence.
    <?php wp_footer(); ?>

  </body>
</html>
