<?php

if(function_exists("register_field_group"))
{
	register_field_group(array (
		'id' => 'acf_meal',
		'title' => 'Meal',
		'fields' => array (
			array (
				'key' => 'field_590798e97f457',
				'label' => 'Recipes',
				'name' => 'recipes',
				'type' => 'relationship',
				'return_format' => 'id',
				'post_type' => array (
					0 => 'recipe',
				),
				'taxonomy' => array (
					0 => 'all',
				),
				'filters' => array (
					0 => 'search',
				),
				'result_elements' => array (
					0 => 'post_type',
					1 => 'post_title',
				),
				'max' => '',
			),
			array (
				'key' => 'field_590799797f458',
				'label' => 'Week',
				'name' => 'week',
				'type' => 'number',
				'required' => 1,
				'default_value' => '',
				'placeholder' => '',
				'prepend' => 'Week of',
				'append' => '',
				'min' => 1,
				'max' => 53,
				'step' => 1,
			),
			array (
				'key' => 'field_590799967f459',
				'label' => 'Date',
				'name' => 'date',
				'type' => 'date_picker',
				'date_format' => 'yymmdd',
				'display_format' => 'dd/mm/yy',
				'first_day' => 1,
			),
			array (
				'key' => 'field_590799cc7f45a',
				'label' => 'Comment',
				'name' => 'comment',
				'type' => 'textarea',
				'default_value' => '',
				'placeholder' => '',
				'maxlength' => '',
				'rows' => 4,
				'formatting' => 'br',
			),
		),
		'location' => array (
			array (
				array (
					'param' => 'post_type',
					'operator' => '==',
					'value' => 'meal',
					'order_no' => 0,
					'group_no' => 0,
				),
			),
		),
		'options' => array (
			'position' => 'normal',
			'layout' => 'no_box',
			'hide_on_screen' => array (
			),
		),
		'menu_order' => 0,
	));
	register_field_group(array (
		'id' => 'acf_recipe',
		'title' => 'Recipe',
		'fields' => array (
			array (
				'key' => 'field_58fd0675cda09',
				'label' => 'Url',
				'name' => 'url',
				'type' => 'text',
				'default_value' => '',
				'placeholder' => 'http://',
				'prepend' => '',
				'append' => '',
				'formatting' => 'none',
				'maxlength' => '',
			),
		),
		'location' => array (
			array (
				array (
					'param' => 'post_type',
					'operator' => '==',
					'value' => 'recipe',
					'order_no' => 0,
					'group_no' => 0,
				),
			),
		),
		'options' => array (
			'position' => 'normal',
			'layout' => 'no_box',
			'hide_on_screen' => array (
			),
		),
		'menu_order' => 0,
	));
	register_field_group(array (
		'id' => 'acf_week',
		'title' => 'Week',
		'fields' => array (
			array (
				'key' => 'field_58fcff8093f2e',
				'label' => 'First day in week',
				'name' => 'date',
				'type' => 'date_picker',
				'instructions' => 'Select the monday of the week',
				'required' => 1,
				'date_format' => 'yymmdd',
				'display_format' => 'yymmdd',
				'first_day' => 1,
			),
			array (
				'key' => 'field_58fcffac93f2f',
				'label' => 'Recipes',
				'name' => 'recipes',
				'type' => 'relationship',
				'return_format' => 'id',
				'post_type' => array (
					0 => 'recipe',
				),
				'taxonomy' => array (
					0 => 'all',
				),
				'filters' => array (
					0 => 'search',
				),
				'result_elements' => array (
					0 => 'post_type',
					1 => 'post_title',
				),
				'max' => 10,
			),
		),
		'location' => array (
			array (
				array (
					'param' => 'post_type',
					'operator' => '==',
					'value' => 'week',
					'order_no' => 0,
					'group_no' => 0,
				),
			),
		),
		'options' => array (
			'position' => 'normal',
			'layout' => 'no_box',
			'hide_on_screen' => array (
			),
		),
		'menu_order' => 0,
	));
}
