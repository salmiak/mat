$ = jQuery;

var app = new Vue({
  el: '#content',
  data: {
    message: null,
    weeks: null,
    recipes: null,
    recipeBoilerPlate: {
      acf: {
        url: null
      },
      title: { rendered: null },
      content: { rendered: null }
    }
  },
  methods: {

    addRecipe: function(){

    },

    addMeal: function(e) {
      // Avoid reloading on submit
      e.preventDefault();
      // Get data from form
      var data = $(e.target).find(":input").serializeArray();
      // Created containers for postData (meal data) and ACF (second request) and parse the form data into these containers.
      var postData = {
        status: 'publish'
      };
      var acfData = {
        fields: {}
      }
      data.forEach(function(d){
        if(d.name.indexOf('acf')==-1){
          postData[d.name] = d.value;
        } else if(d.name == 'acf_recipes') {
          acfData.fields.recipes = d.value.split(',');
        } else {
          acfData.fields[d.name.slice(4)] = d.value;
        }
      });

      // First call - create meal
      $.ajax({
        url: window.wp_root_url + "/wp-json/wp/v2/meal",
        method: 'POST',
        beforeSend: function ( xhr ) {
          xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
        },
        data: postData,
        success: function(data) {
          // Fetch id of the new meal.
          var postId = data.id;
          // Second call - add ACF-data
          $.ajax({
            url: window.wp_root_url + "/wp-json/acf/v3/meal/" + postId,
            method: 'POST',
            beforeSend: function ( xhr ) {
              xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
            },
            data: acfData,
            success: function(data) {
              // Successfully created meal, now lets get the whole thing and add it to our list of meals in the Vue app.
              $.ajax({
                url: window.wp_root_url + "/wp-json/wp/v2/meal/"+postId,
                success: function(meal){
                  Meals[meal.id] = meal;
                  week = _.findWhere(Weeks, {weekNbr: parseInt(meal.acf.week)});
                  if(week)
                    week.data.push(meal);
                  // reset form
                  $(e.target).find(":input[type=text]").val('')
                }
              });
            }
          })
        }
      })
    }
  }
})

Vue.component('recipe', {
  props: ['rec'],
  template: $('#recipeTemplate').html(),
  data: function() {
    return {
      inEdit: this.rec.id == undefined,
      stateClass: ''
    }
  },
  methods: {
    toggleEditRecipe: function(e) {
      this.inEdit = !this.inEdit;
    },
    saveRecipe: function(e) {
      var _this = this;
      e.preventDefault();

      this.stateClass = "saving";
      this.inEdit = false;

      $.ajax({
        url: window.wp_root_url + "/wp-json/wp/v2/recipe/" + (this.rec.id||''),
        method: 'POST',
        beforeSend: function ( xhr ) {
          xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
        },
        data: {
          title: _this.rec.title.rendered,
          content: _this.rec.content.rendered,
          status: 'publish'
        },
        success: function(result) {

          var id = result.id;

          $.ajax({
            url: window.wp_root_url + "/wp-json/acf/v3/recipe/" + id,
            method: 'POST',
            beforeSend: function ( xhr ) {
              xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
            },
            data: { fields:_this.rec.acf },
            success: function(data) {

              $.ajax({
                url: window.wp_root_url + "/wp-json/wp/v2/recipe/"+id,
                success: function(result){
                  app.recipes[id] = result;
                  _this.stateClass = "";
                }
              });

            }
          });

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
      inEdit: false
    }
  },
  template: $('#mealTemplate').html(),
  methods: {
    toggleEditMeal: function() {
      this.inEdit = !this.inEdit;
    },
    saveMeal: function(e) {
      var _this = this;
      // Avoid reloading on submit
      e.preventDefault();
      // Get data from form
      var data = $(e.target).find(":input").serializeArray();
      // Created containers for postData (meal data) and ACF (second request) and parse the form data into these containers.
      var postData = {};
      var acfData = {
        fields: {}
      }
      data.forEach(function(d){
        if(d.name.indexOf('acf')==-1){
          postData[d.name] = d.value;
        } else if(d.name == 'acf_recipes') {
          acfData.fields.recipes = d.value.split(',');
        } else {
          acfData.fields[d.name.slice(4)] = d.value;
        }
      });

      // First call - create meal
      $.ajax({
        url: window.wp_root_url + "/wp-json/wp/v2/meal/" + this.meal.id,
        method: 'POST',
        beforeSend: function ( xhr ) {
          xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
        },
        data: postData,
        success: function(data) {
          // Fetch id of the new meal.
          var postId = data.id;
          // Second call - add ACF-data
          $.ajax({
            url: window.wp_root_url + "/wp-json/acf/v3/meal/" + postId,
            method: 'POST',
            beforeSend: function ( xhr ) {
              xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
            },
            data: acfData,
            success: function(data) {
              // Successfully saved the meal, now lets get the whole thing and add it to our list of meals in the Vue app.
              $.ajax({
                url: window.wp_root_url + "/wp-json/wp/v2/meal/"+postId,
                success: function(meal){
                  Meals[meal.id] = meal;
                  week = _.findWhere(app.weeks, {weekNbr: parseInt(meal.acf.week)});
                  if(week)
                    data = _.reject(week.data, function(weekMeal){ return weekMeal.id == meal.id})
                    data.push(meal);
                    week.data = data;
                  _this.inEdit = false;
                }
              });
            }
          })
        }
      })
    },
    deleteMeal: function(e){

      // Limits click on remove to one
      if(this.stateClass == 'faded')
        return false;

      // Fade out item to remove
      this.stateClass = 'faded';

      var _this = this;
      var week = _.findWhere(Weeks, {weekNbr: parseInt(this.meal.acf.week)});

      $.ajax({
        url: window.wp_root_url + "/wp-json/wp/v2/meal/" + this.meal.id,
        method: 'DELETE',
        beforeSend: function ( xhr ) {
          xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
        },
        success: function(data) {
          week.data = _.reject(week.data, function(i){
            return i.id == data.id
          });
          _this.stateClass = '';
        }
      });
    }
  }
})

var Recipes = {},
  Meals = {}


var Weeks = [];

for (var i = 2; i >= -5; i--) {
  Weeks.push({
    weekNbr: moment().startOf('week').isoWeekday(1).add(i, 'w').week(),
    data: []
  });
}

$.ajax({
  url: window.wp_root_url + "/wp-json/wp/v2/recipe",
  success: function(result){
    Recipes = _.indexBy(result, 'id');
    app.recipes = Recipes
  }
});
$.ajax({
  url: window.wp_root_url + "/wp-json/wp/v2/meal",
  success: function(result){
    result.forEach(function(meal) {
      //Meals[meal.id] = meal;
      week = _.findWhere(Weeks, {weekNbr: parseInt(meal.acf.week)});
      if(week)
        week.data.push(meal);
    });
    app.weeks = Weeks;
  }
});
