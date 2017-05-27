<!DOCTYPE html>
  <html <?php language_attributes(); ?>>
  <head>

    <!--

      Welcome to the source of this site -
      I built this: Salmiak media (http://salmiakmedia.se)

    -->

    <meta charset="<?php bloginfo( 'charset' ); ?>" />

    <title>Matplanering</title>

    <?php wp_head(); ?>

  </head>

  <body <?php body_class(); ?>>

    <div id="content">

      <div id="savingIndicator" v-bind:class="isSaving.length?'':'hidden'"></div>

      <div id="weeksContainer">
        <week v-if="weeks!=null && recipes!=null" v-for="week in weeks" v-bind:week="week"  :key="week.nbr" v-bind:recipes="recipes"></week>
      </div>

      <div id="recipeContainer">
        <recipe v-bind:rec="recipeBoilerPlate"></recipe>
        <recipe v-for="recipe in recipes" :key="recipe.id" v-bind:rec="recipe"></recipe>
      </div>

    </div>


    <script>
      window.wp_root_url = "<?php bloginfo('url'); ?>";
    </script>

    <script type="text/x-template" id="weekTemplate">
      <div class="week">
        <h2>Vecka {{week.nbr}}</h2>

        <draggable
          element="ul"
          class="meal-container"
          v-model="week.meals"
          :options="{group:'weeks'}"
          @start="drag=true"
          @end="drag=false"
          @sort="saveWeeksMeals">

          <meal
            class="meal"
            v-for="(meal,index) in week.meals"
            :key="index"
            v-bind:meal="meal"
            v-bind:recipes="recipes"></meal>

        </draggable>

        <form class="addArea" v-on:submit="addMeal">
          <input
            type="text"
            name="title"
            placeholder="Titel" />
          <input
            type="text"
            name="acf_comment"
            placeholder="Kommentar" />
          <input
            type="text"
            name="acf_recipes"
            placeholder="Recept IDn" />
          <input
            type="hidden"
            name="acf_week"
            v-bind:value="week.nbr" />
          <input
            type="submit"
            value="Lägg till" />
        </form>

      </div>
    </script>

    <script type="text/x-template" id="mealTemplate">
      <li v-if="inEdit">
        <form class="editArea" v-on:submit="saveMeal">
          <input type="text" name="title" placeholder="Titel" v-bind:value="meal.title.rendered" />
          <input type="text" name="acf_comment" v-bind:value="meal.acf.comment" placeholder="Kommentar" />
          <input type="text" name="acf_recipes" v-bind:value="meal.acf.recipes" placeholder="Recept IDn" />
          <input type="submit" value="Spara" />
        </form>
      </li>

      <li v-bind:class="stateClass" v-bind:data-id="meal.id" v-else>
        <div @click="deleteMeal" class="removeBtn">
          &times;
        </div>
        <h2>{{meal.title.rendered}}</h2>

        <draggable
          class="trash"
          v-if="drag"
          :options="{group:'mealRecipes'}"
          :list="trash">Ta bort recept</draggable>

        <h4>Recept</h4>

        <draggable
          element="div"
          class="recipe-container"
          :list="meal.acf.recipes"
          :options="{group:'mealRecipes'}"
          @start="drag=true"
          @end="drag=false"
          @sort="saveRecipes">

          <recipe
            v-for="recipeId in meal.acf.recipes"
            :key="recipeId"
            v-bind:rec="recipes[recipeId]"></recipe>

        </draggable>


        <h4 v-if="meal.acf.comment">Kommentar</h4>
        <p>
          {{meal.acf.comment}}
        </p>
        <div class="editBtn" @click="toggleEditMeal">Redigera</div>
      </li>
    </script>

    <script type="text/x-template" id="recipeTemplate">
      <div class="recipe" v-bind:class="stateClass" v-if="rec&&rec.id!=0">
        <form v-on:submit="saveRecipe" v-if="inEdit&&rec">
          <h3>{{rec.id?'Redigera':'Lägg till recept'}}: {{rec.title.rendered}}</h3>
          <input type="text" name="title" placeholder="Titel" v-model="rec.title.rendered" />
          <input type="text" name="acf_url" v-model="rec.acf.url" placeholder="URL" />
          <textarea name="content" v-model="rec.content.rendered" placeholder="Kommentar"></textarea>
          <input type="submit" value="Spara" />
        </form>
        <div v-bind:title="rec.id" v-else-if="rec">
          <h3 v-if="!rec.acf.url">{{rec.title.rendered}}</h3>
          <h3 v-if="rec.acf.url"><a :href="rec.acf.url">{{rec.title.rendered}}</a></h3>
          <p v-html="rec.content.rendered"></p>
          <div class="editBtn" @click="toggleEditRecipe">Redigera</div>
        </div>
        <div v-else>
          Laddar...
        </div>
      </div>
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
