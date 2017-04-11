<?php

function mat_scripts() {
    // wp_enqueue_style( 'style-name', get_stylesheet_uri() );
    wp_enqueue_script( 'matjs', get_template_directory_uri() . '/script.js', array( 'wp-api','backbone','underscore','jquery' ), '1.0.0', true );
}
add_action( 'wp_enqueue_scripts', 'mat_scripts' );


add_action( 'init', 'add_type_recipe' );
function add_type_recipe() {
  register_post_type( 'recipe',
    array(
      'labels' => array(
        'name' => __( 'Recipes' ),
        'singular_name' => __( 'Recipe' )
      ),
      'description'        => __( 'Description.', 'mat' ),
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
  		'supports'           => array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'comments' )
    )
  );
}

add_action( 'init', 'add_tax_week', 30 );
function add_tax_week() {

  $args = array(
    'hierarchical'      => false,
    'labels'            => array(
      'name' => __('Weeks'),
      'singular_name' => __('Week')
    ),
    'show_ui'           => true,
    'show_admin_column' => true,
    'query_var'         => true,
    'rewrite'           => array( 'slug' => 'week' ),
    'show_in_rest'       => true
  );

  register_taxonomy( 'week', array( 'recipe' ), $args );

}
