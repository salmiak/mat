$ = jQuery;

var app = new Vue({
  el: '#content',
  data: {
    message: null,
    weeks: null,
    recipes: null
  },
  methods: {
    addInstance: function(e) {
      // Avoid reloading on submit
      e.preventDefault();
      // Get data from form
      var data = $(e.target).find(":input").serializeArray();
      // Created containers for postData (instance data) and ACF (second request) and parse the form data into these containers.
      var postData = {
        status: 'publish'
      };
      var acfData = {
        fields: {}
      }
      data.forEach(function(d){
        if(d.name.indexOf('acf')==-1){
          postData[d.name] = d.value;
        } else {
          acfData.fields[d.name.slice(4)] = d.value;
        }
      });

      // First call - create instance
      $.ajax({
        url: window.wp_root_url + "/wp-json/wp/v2/instances",
        method: 'POST',
        beforeSend: function ( xhr ) {
          xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
        },
        data: postData,
        success: function(data) {
          // Fetch id of the new instance.
          var postId = data.id;
          // Second call - add ACF-data
          $.ajax({
            url: window.wp_root_url + "/wp-json/acf/v3/instances/" + postId,
            method: 'POST',
            beforeSend: function ( xhr ) {
              xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
            },
            data: acfData,
            success: function(data) {
              // Successfully created instance, now lets get the whole thing and add it to our list of instances in the Vue app.
              $.ajax({
                url: window.wp_root_url + "/wp-json/wp/v2/instances/"+postId,
                success: function(instance){
                  Instances[instance.id] = instance;
                  week = _.findWhere(Weeks, {weekNbr: parseInt(instance.acf.week)});
                  if(week)
                    week.data.push(instance);
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
  template: $('#recipeTemplate').html()
})

Vue.component('instance', {
  props: ['inst','recipes'],
  data: function(){
    return {stateClass: ''}
  },
  template: $('#instanceTemplate').html(),
  methods: {
    deleteInstance: function(e){

      // Limits click on remove to one
      if(this.stateClass == 'faded')
        return false;

      // Fade out item to remove
      this.stateClass = 'faded';

      var _this = this;
      var week = _.findWhere(Weeks, {weekNbr: parseInt(this.inst.acf.week)});

      $.ajax({
        url: window.wp_root_url + "/wp-json/wp/v2/instances/" + this.inst.id,
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
