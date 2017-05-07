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

      <div class="week" v-if="weeks!=null && recipes!=null" v-for="week in weeks">
        <h2>Vecka {{week.weekNbr}}</h2>
          <ul>
            <recipe v-for="(recipe,index) in week.data" :key="index" v-bind:robj="recipes[recipe.acf.recipe[0].ID]"></recipe>
          </ul>
      </div>

    </div>

    <script>
      window.wp_root_url = "<?php bloginfo('url'); ?>";
    </script>

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
