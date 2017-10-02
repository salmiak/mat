<?php

show_admin_bar( false );

// Use acf.php if in production
$whitelist = array(
  '127.0.0.1',
  '::1'
);
if(!in_array($_SERVER['REMOTE_ADDR'], $whitelist)){
  require_once('acf.php');
}

// Redirect to home after login
function admin_default_page() {
  return get_bloginfo('url');
}
add_filter('login_redirect', 'admin_default_page');


// Register styles and scripts
function reg_styles()
{
    //wp_register_style('google-fonts', 'https://fonts.googleapis.com/css?family=Oswald|Open+Sans');
    //wp_enqueue_style('google-fonts'); // Enqueue it!
}
add_action('wp_enqueue_scripts', 'reg_styles');

function mat_scripts() {
    wp_enqueue_script( 'wp-api');
}
add_action( 'wp_enqueue_scripts', 'mat_scripts' );

function add_post_types() {
  register_post_type( 'recipe',
    array(
      'labels' => array(
        'name' => __( 'Recipes' ),
        'singular_name' => __( 'Recipe' )
      ),
  		'public'             => true,
  		'publicly_queryable' => true,
  		'show_ui'            => true,
  		'show_in_menu'       => true,
  		'query_var'          => true,
  		'rewrite'            => array( 'slug' => 'recipe' ),
  		'capability_type'    => 'post',
  		'has_archive'        => true,
  		'hierarchical'       => false,
  		'menu_position'      => null,
  		'show_in_rest'       => true,
  		'supports'           => array( 'title', 'editor', 'author', 'thumbnail' )
    )
  );

  register_post_type( 'meal',
    array(
      'labels' => array(
        'name' => __( 'Meals' ),
        'singular_name' => __( 'Meal' )
      ),
  		'public'             => true,
  		'publicly_queryable' => true,
  		'show_ui'            => true,
  		'show_in_menu'       => true,
  		'query_var'          => true,
  		'rewrite'            => array( 'slug' => 'meals' ),
  		'capability_type'    => 'post',
  		'has_archive'        => true,
  		'hierarchical'       => false,
  		'menu_position'      => null,
  		'show_in_rest'       => true,
  		'supports'           => array( 'title' )
    )
  );
}
add_action( 'init', 'add_post_types' );
