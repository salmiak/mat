$ = jQuery;

var mealDrag = dragula(undefined);
mealDrag.on('drop', function(el, target, source, sibling){

  $(target).children().each(function(order, val){

    var mealId = $(this).data('id');
    var meal = Meals[mealId];
    var targetWeek = $(target).data('week');

    var oldWeek = _.findWhere(app.weeks, {weekNbr: parseInt(meal.acf.week)});
    var newWeek = _.findWhere(app.weeks, {weekNbr: parseInt(targetWeek)});

    if (Meals[mealId].acf.week == targetWeek
        && Meals[mealId].acf.order == order)
      return // No change

    Meals[mealId].acf.order = order;
    newWeek.data = newWeek.data.sort(function(a,b){
      return (a.acf.order || 0) - (b.acf.order || 0);
    })

    $.ajax({
      url: window.wp_root_url + "/wp-json/acf/v3/meal/" + mealId,
      method: 'POST',
      beforeSend: function ( xhr ) {
        xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
      },
      data: {
        fields: {
          week: targetWeek,
          order: order
        }
      },
      success: function(data) {
        if (Meals[mealId].acf.week != targetWeek) {
          oldWeek.data = _.reject(oldWeek.data, function(m) {
            return m.id == mealId
          });
          newWeek.data.push(meal);
        }
        Meals[mealId].acf.week = targetWeek;
      }
    })

  });
})

var recipeBoilerPlate = JSON.stringify({
  acf: {
    url: null
  },
  title: { rendered: null },
  content: { rendered: null }
});

var app = new Vue({
  el: '#content',
  data: {
    message: null,
    weeks: null,
    recipes: {},
    recipeBoilerPlate: JSON.parse(recipeBoilerPlate)
  },
  methods: {

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
        fields: {
          order: 0
        }
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
      inEdit: this.rec!=undefined && this.rec.id == undefined,
      stateClass: ''
    }
  },
  methods: {
    toggleEditRecipe: function(e) {
      this.inEdit = !this.inEdit;
    },
    loadRecipe: function(){
      var _this = this;
      $.ajax({
        url: window.wp_root_url + "/wp-json/wp/v2/recipe/"+this.rec.id,
        success: function(result){
          Vue.set(app.recipes, result.id, result);
          _this.stateClass = "";
        }
      });
    },
    saveRecipe: function(e) {
      var _this = this;
      e.preventDefault();

      this.stateClass = "saving";
      this.inEdit = this.rec.id?false:true;

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
              app.recipeBoilerPlate = JSON.parse(recipeBoilerPlate);
              _this.loadRecipe();
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
        fields: {
          order: this.acf.order || 0
        }
      }
      data.forEach(function(d){
        if(d.name.indexOf('acf')==-1){
          postData[d.name] = d.value;
        } else if(d.name == 'acf_recipes') {
          if(d.value != '') {
            acfData.fields.recipes = d.value.split(',');
          } else {
            acfData.fields.recipes = [0];
          }
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
  url: window.wp_root_url + "/wp-json/wp/v2/recipe?per_page=100",
  success: function(result){
    Recipes = _.indexBy(result, 'id');
    app.recipes = Recipes
  }
});
$.ajax({
  url: window.wp_root_url + "/wp-json/wp/v2/meal?per_page=100",
  success: function(result){
    result.forEach(function(meal) {
      Meals[meal.id] = meal;
      week = _.findWhere(Weeks, {weekNbr: parseInt(meal.acf.week)});
      if(week)
        week.data.push(meal);
    });
    app.weeks = Weeks;
    setTimeout(function(){
      $('.week > ul').each(function(i,el){
        mealDrag.containers.push(el);
      });
    },300);
  }
});
