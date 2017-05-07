$ = jQuery;

var app = new Vue({
  el: '#content',
  data: {
    message: null,
    weeks: null,
    recipes: null
  }
})

Vue.component('recipe', {
  props: ['robj'],
  template: '<li><h3>{{robj.title.rendered}}</h3><p v-html="robj.content.rendered"></p></li>'
})

var Recipes = {},
  Instances = {}


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
    result.forEach(function(recipe) {
      Recipes[recipe.id] = recipe
      app.recipes = Recipes
    });
  }
});
$.ajax({
  url: window.wp_root_url + "/wp-json/wp/v2/instances",
  success: function(result){
    result.forEach(function(instance) {
      Instances[instance.id] = instance;
      week = _.findWhere(Weeks, {weekNbr: parseInt(instance.acf.week)});
      if(week)
        week.data.push(instance);
    });
    app.weeks = Weeks;
  }
});
