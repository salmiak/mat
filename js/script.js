$ = jQuery;

var processWPContent = function(r) {
  r.fields = JSON.parse(JSON.stringify(r.acf));
  r.title = r.title.rendered;
  if(r.content) r.content = r.content.rendered;

  if(r.type == 'meal') {
    if (typeof r.fields.recipes != 'object' || r.fields.recipes == "" || !r.fields.recipes) {
      r.fields.recipes = [];
    }
  }
}

var recipeBoilerPlate = JSON.stringify({
  fields: {
    url: null
  },
  title:  null,
  content:  null,
  status: 'publish'
});

Vue.component('recipe', {
  props: ['rec'],
  template: '#recipeTemplate',
  data: function() {
    return {
      inEdit: this.rec && !this.rec.id,
    }
  },
  methods: {
    saveRecipe: function(e) {
      var _this = this;
      e.preventDefault();

      this.inEdit = this.rec.id?false:true;

      $.ajax({
        url: window.wp_root_url + "/wp-json/wp/v2/recipe/" + (this.rec.id||''),
        method: 'POST',
        beforeSend: function ( xhr ) {
          xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
        },
        data: this.rec,
        success: function(result) {
          processWPContent(result);
          if(_this.rec.id == undefined) {
            app.recipeBoilerPlate = JSON.parse(recipeBoilerPlate);
            app.recipes.unshift(result);
          }
        }
      });
    }
  }
})

Vue.component('meal', {
  props: ['meal','recipes'],
  data: function(){
    return {
      stateClass: '',
      inEdit: false,
      drag: false,
      trash: []
    }
  },
  template: '#mealTemplate',
  methods: {
    saveMeal: function(e) {

      // Avoid reloading on submit
      if(e && e.type == 'submit')
        e.preventDefault();

      var _this = this;
      this.inEdit = false;
      app.isSaving.push(1);

      if( !this.meal.fields.recipes.length ) this.meal.fields.recipes = null;

      $.ajax({
        url: window.wp_root_url + "/wp-json/wp/v2/meal/" + this.meal.id,
        method: 'POST',
        beforeSend: function ( xhr ) {
          xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
        },
        data: this.meal,
        success: function(meal) {
          app.isSaving.pop(1);
        }
      })
    }
  }
});

Vue.component('week', {
  props: ['week','recipes','dragingRecipe'],
  template: '#weekTemplate',
  data: function(){
    return {
      drag: false,
      trash: [],
      addMealList: [],
      newMeal: this._resetNewMeal()
    }
  },
  methods: {

    _resetNewMeal: function(){
      this.newMeal = {
        status: 'publish',
        fields: {
          week: this.week.nbr,
          recipes: [0]
        }
      }
      return this.newMeal;
    },

    createNewMeal: function(e){
      // Avoid reloading on submit
      e.preventDefault();

      var _this = this;
      app.isSaving.push(1);

      var data = this.newMeal;

      $.ajax({
        url: window.wp_root_url + "/wp-json/wp/v2/meal/",
        method: 'POST',
        beforeSend: function ( xhr ) {
          xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
        },
        data: data,
        success: function(data){
          processWPContent(data);
          app.isSaving.pop();
          _this.week.meals.unshift(data);
          _this.saveWeeksMeals();
          _this._resetNewMeal();
        }
      })
    },

    createMealFromRecipe: function(){
      var _this = this;
      app.isSaving.push(1);
      var recipeId = this.addMealList.pop();
      var recipe = _.findWhere(this.recipes, {id:recipeId});
      var data = {
        title: recipe.title,
        status: "publish",
        fields: {
          recipes: [recipeId]
        }
      }
      $.ajax({
        url: window.wp_root_url + "/wp-json/wp/v2/meal/",
        method: 'POST',
        beforeSend: function ( xhr ) {
          xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
        },
        data: data,
        success: function(data){
          processWPContent(data);
          app.isSaving.pop();
          _this.week.meals.unshift(data);
          _this.saveWeeksMeals();
        }
      })
    },

    deleteMeal: function(){
      app.isSaving.push(1);
      var meal = this.trash.pop();
      $.ajax({
        url: window.wp_root_url + "/wp-json/wp/v2/meal/"+meal.id,
        method: 'DELETE',
        beforeSend: function ( xhr ) {
          xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
        },
        success: function(data){
          app.isSaving.pop();
        }
      })
    },

    saveWeeksMeals: function(){
      var _this = this;
      _.each(this.week.meals, function(element, index, list){
        app.isSaving.push(1);
        $.ajax({
          url: window.wp_root_url + "/wp-json/wp/v2/meal/"+element.id,
          method: 'POST',
          beforeSend: function ( xhr ) {
            xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
          },
          data: {
            fields: {
              order: index,
              week: _this.week.nbr
            }
          },
          success: function(data){
            processWPContent(data);
            _this.week.meals.splice(index, 1, data);
            app.isSaving.pop();
          }
        })
      })
    }

  }
});


var app = new Vue({
  el: '#content',
  data: {
    dragingRecipe: false,
    drag: false,
    isSaving: [],
    weeks: [],
    recipes: [],
    recipeBoilerPlate: JSON.parse(recipeBoilerPlate)
  }
});

$.ajax({
  url: window.wp_root_url + "/wp-json/wp/v2/recipe?per_page=100",
  success: function(result){
    _.each(result, processWPContent);
    app.recipes = result;
  }
});
$.ajax({
  url: window.wp_root_url + "/wp-json/wp/v2/meal?per_page=100",
  success: function(result){
    _.each(result, processWPContent);
    weekData = _.groupBy(result, function(m){ return parseInt(m.fields.week) });

    for (var i = 2; i >= -5; i--) {
      var weekNbr = moment().startOf('week').isoWeekday(1).add(i, 'w').week();
      app.weeks.push({
        nbr: weekNbr,
        meals: _.sortBy(weekData[weekNbr],function(a){
            a.acf.order = a.acf ? a.acf.order || 0 : 0;
            return parseInt(a.acf.order);
        })
      });
    }
  }
});
