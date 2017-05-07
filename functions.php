<?php

function reg_styles()
{
    wp_register_style('google-fonts', 'https://fonts.googleapis.com/css?family=Average|Fjalla+One');
    wp_enqueue_style('google-fonts'); // Enqueue it!

    wp_register_style('mat', get_template_directory_uri() . '/style.css');
    wp_enqueue_style('mat'); // Enqueue it!
}
add_action('wp_enqueue_scripts', 'reg_styles');

function mat_scripts() {
    // wp_enqueue_style( 'style-name', get_stylesheet_uri() );
    wp_enqueue_script( 'vue', 'https://unpkg.com/vue',null, null, true);
    wp_enqueue_script( 'momentjs', get_template_directory_uri() . '/js/moment.js',null, null, true);
    wp_enqueue_script( 'matjs', get_template_directory_uri() . '/js/script.js', array( 'wp-api','underscore','jquery','vue','momentjs' ), '1.0.0', true );
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
  register_post_type( 'week',
    array(
      'labels' => array(
        'name' => __( 'Weeks' ),
        'singular_name' => __( 'Week' )
      ),
  		'public'             => true,
  		'publicly_queryable' => true,
  		'show_ui'            => true,
  		'show_in_menu'       => true,
  		'query_var'          => true,
  		'rewrite'            => array( 'slug' => 'week' ),
  		'capability_type'    => 'post',
  		'has_archive'        => true,
  		'hierarchical'       => false,
  		'menu_position'      => null,
  		'show_in_rest'       => true,
  		'supports'           => array( 'title' )
    )
  );
  register_post_type( 'instances',
    array(
      'labels' => array(
        'name' => __( 'Instances' ),
        'singular_name' => __( 'Instance' )
      ),
  		'public'             => true,
  		'publicly_queryable' => true,
  		'show_ui'            => true,
  		'show_in_menu'       => true,
  		'query_var'          => true,
  		'rewrite'            => array( 'slug' => 'instance' ),
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
