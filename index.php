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
          <instance class="instance" v-for="(instance,index) in week.data" :key="index" v-bind:inst="instance" v-bind:recipes="recipes"></instance>
        </ul>
        <form class="addArea" v-on:submit="addInstance">
          <input type="text" name="title" placeholder="Titel" />
          <input type="text" name="acf_comment" placeholder="Kommentar" />
          <input type="hidden" name="acf_week" v-bind:value="week.weekNbr" />
          <input type="submit" value="Lägg till" />
        </form>
      </div>

    </div>

    <script>
      window.wp_root_url = "<?php bloginfo('url'); ?>";
    </script>

    <script type="text/template" id="recipeTemplate">
      <div>
        <h3 v-if="!rec.acf.url">{{rec.title.rendered}}</h3>
        <h3 v-if="rec.acf.url"><a :href="rec.acf.url">{{rec.title.rendered}}</a></h3>
        <p v-html="rec.content.rendered"></p>
      </div>
    </script>

    <script type="text/template" id="instanceTemplate">
      <li v-bind:class="stateClass">
        <div @click="deleteInstance" class="removeBtn">
          &times;
        </div>
        <recipe v-if="inst.acf.recipe"v-bind:rec="recipes[inst.acf.recipe[0]]"></recipe>
        <h3 v-if="!inst.acf.recipe">{{inst.title.rendered}}</h3>
        <p>
          {{inst.acf.comment}}
        </p>
      </li>
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
