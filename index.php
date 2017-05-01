<!DOCTYPE html>
  <html <?php language_attributes(); ?>>
  <head>

    <!--

      Welcome to the source of this site -
      I built this: Salmiak media (http://salmiakmedia.se)

    -->

    <meta charset="<?php bloginfo( 'charset' ); ?>" />

    <title><?php wp_title(); ?></title>

    <?php wp_head(); ?>

  </head>

  <body <?php body_class(); ?>>

    <div id="content">
      {{message}}

      <div v-if="weeks && weeks.length" v-for="week in weeks">
        <h2>Vecka {{week.title.rendered}}</h2>
        <p>
          <em>{{week.acf.date}}</em>
        </p>

        <ul>
          <recipe v-for="id in week.acf.recipes" :key="id"  v-bind:rid="id"></recipe>
        </ul>
      </div>

    </div>

    <?php wp_footer(); ?>

  </body>
</html>

<!--

recipe
  url:
  img:
  img_url:
  summary:
  tags:
  weeks: []

week
  [{
    recepie: recipe
    day:
    comment:
  }]

-->
