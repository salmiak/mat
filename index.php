<!DOCTYPE html>
  <html <?php language_attributes(); ?>>
  <head>

    <!--

      Welcome to the source of this site -
      I built this: Salmiak media (http://salmiakmedia.se)

    -->

    <meta charset="<?php bloginfo( 'charset' ); ?>" />

    <title>Matplanering</title>
    <script src="https://use.fontawesome.com/20d70f523f.js"></script>

    <?php wp_head(); ?>

  </head>

  <body <?php body_class(); ?>>

    <div id="content">

      <div id="savingIndicator" v-bind:class="isSaving.length?'':'hidden'"></div>

      <div id="weeksContainer">
        <week
          v-if="weeks!=null && recipes!=null"
          v-for="week in weeks"
          v-bind:week="week"
          :key="week.nbr"
          v-bind:recipes="recipes"
          v-bind:draging-recipe="dragingRecipe"></week>
      </div>

      <div id="recipeContainer">
        <recipe v-bind:rec="recipeBoilerPlate"></recipe>

        <draggable
          :options="{group:{ name: 'mealRecipes', pull: 'clone', put: false}, sort: false}"
          @start = "dragingRecipe=true"
          @end = "dragingRecipe=false"
          :list="_.pluck(recipes,'id')">

          <recipe v-for="recipe in recipes" :key="recipe.id" v-bind:rec="recipe"></recipe>

        </draggable>
      </div>

    </div>


    <script>
      window.wp_root_url = "<?php bloginfo('url'); ?>";
    </script>

    <script type="text/x-template" id="weekTemplate">
      <div class="week">

        <draggable
          class="trash"
          v-if="drag"
          :options="{group:'weeks'}"
          :list="trash"
          @sort="deleteMeal">Ta bort måltid</draggable>

        <draggable
          class="addMealDropper"
          v-if="dragingRecipe"
          :options="{group:'mealRecipes'}"
          :list="addMealList"
          @sort="addMealFromRecipe">Skapa ny måltid</draggable>

        <h2>Vecka {{week.nbr}}</h2>

        <draggable
          element="ul"
          class="meal-container"
          :list="week.meals"
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

        <form class="addArea" v-on:submit="createNewMeal">
          <input
            type="text"
            name="title"
            placeholder="Titel"
            v-model= "newMeal.title" />
          <textarea
            type="text"
            name="acf_comment"
            placeholder="Kommentar"
            v-model= "newMeal.fields.comment"></textarea>
          <input
            type="submit"
            value="Lägg till" />
        </form>

      </div>
    </script>

    <script type="text/x-template" id="mealTemplate">

      <li v-bind:class="stateClass" v-bind:data-id="meal.id">

        <div class="editBtn" @click="toggleEditMeal">
          <i class="fa fa-pencil" aria-hidden="true"></i>
        </div>

        <form class="editArea" v-on:submit="saveMeal">

          <input
            type="text"
            placeholder="Titel"
            v-model="meal.title.rendered"
            v-if="inEdit" />
          <h2 v-else>{{meal.title.rendered}}</h2>

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
              v-bind:rec="_.findWhere(recipes,{id:recipeId})"></recipe>

          </draggable>

          <h4 v-if="meal.acf.comment || inEdit">Kommentar</h4>
          <textarea
            type="text"
            v-model="meal.acf.comment"
            placeholder="Kommentar"
            v-if="inEdit"></textarea>
          <p v-else v-html="meal.acf.comment"></p>

          <input type="submit" value="Spara" v-if="inEdit" />
        </form>
      </li>
    </script>

    <script type="text/x-template" id="recipeTemplate">
      <div class="recipe" v-bind:class="stateClass" v-if="rec&&rec.id!=0">
        <div class="editBtn" @click="toggleEditRecipe">
          <i class="fa fa-pencil" aria-hidden="true"></i>
        </div>

        <form v-on:submit="saveRecipe" v-if="inEdit&&rec">
          <h3>{{rec.id?'Redigera':'Lägg till recept'}}: {{rec.title.rendered}}</h3>
          <input type="text" name="title" placeholder="Titel" v-model="rec.title.rendered" />
          <input type="text" name="acf_url" v-model="rec.acf.url" placeholder="URL" />
          <textarea name="content" v-model="rec.content.rendered" placeholder="Kommentar"></textarea>
          <input type="submit" value="Spara" />
        </form>

        <div v-else-if="rec">

          <h3 v-if="!rec.acf.url">{{rec.title.rendered}}</h3>
          <h3 v-if="rec.acf.url"><a :href="rec.acf.url" target="_blank">{{rec.title.rendered}}</a></h3>
          <div v-if="avgRating !== undefined">
            <i class="fa fa-star"
              v-for="n in avgRating"
              aria-hidden="true"
              style="margin-right: 2px;">
            </i><i class="fa fa-star-o"
              v-for="n in (5-avgRating)"
              aria-hidden="true"
              style="margin-right: 2px;"></i>
          </div>
          <div v-else style="opacity: 0.5">
            <i class="fa fa-star-o"
              v-for="n in 5"
              aria-hidden="true"
              style="margin-right: 2px;"></i>
          </div>
          <p v-html="rec.content.rendered"></p>

        </div>
        <div v-else>
          Laddar...
        </div>
      </div>
    </script>

    <?php wp_footer(); ?>

  </body>
</html>
