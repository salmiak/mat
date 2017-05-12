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

      <div id="weeksContainer">
        <div class="week" v-if="weeks!=null && recipes!=null" v-for="week in weeks">
          <h2>Vecka {{week.weekNbr}}</h2>
          <ul>
            <meal class="meal" v-for="(meal,index) in week.data" :key="index" v-bind:meal="meal" v-bind:recipes="recipes"></meal>
          </ul>
          <form class="addArea" v-on:submit="addMeal">
            <input type="text" name="title" placeholder="Titel" />
            <input type="text" name="acf_comment" placeholder="Kommentar" />
            <input type="hidden" name="acf_week" v-bind:value="week.weekNbr" />
            <input type="submit" value="Lägg till" />
          </form>
        </div>
      </div>

      <div id="recipeContainer">
        <recipe v-for="recipe in recipes" :key="recipe.id" v-bind:rec="recipe"></recipe>
      </div>

    </div>

    <script>
      window.wp_root_url = "<?php bloginfo('url'); ?>";
    </script>

    <script type="text/template" id="recipeTemplate">
      <div class="recipe">
        <h3 v-if="!rec.acf.url">{{rec.title.rendered}}</h3>
        <h3 v-if="rec.acf.url"><a :href="rec.acf.url">{{rec.title.rendered}}</a></h3>
        <p v-html="rec.content.rendered"></p>
      </div>
    </script>

    <script type="text/template" id="mealTemplate">
      <li v-bind:class="stateClass">
        <div @click="deleteMeal" class="removeBtn">
          &times;
        </div>
        <h2>{{meal.title.rendered}}</h2>
        <h4 v-if="meal.acf.recipes">Recept</h4>
        <recipe v-for="recipeId in meal.acf.recipes" :key="recipeId" v-if="meal.acf.recipes" v-bind:rec="recipes[recipeId]"></recipe>
        <h4 v-if="meal.acf.comment">Kommentar</h4>
        <p>
          {{meal.acf.comment}}
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
