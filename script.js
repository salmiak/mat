$ = jQuery;

var viewModel = new Vue({
  el: '#content',
  data: {
    message: 'Script loading...'
  }
})

Vue.component('recipe', {
  props: ['rid'],
  template: '<li v-if="modelJSON">{{modelJSON.title}}</li><li v-else>Recipe {{rid}}</li>',
  created: function(){
    var _this = this;
    console.log('Created recipe ' + _this.rid);
    var model = new wp.api.models.Recipe( { id : _this.rid } );
    model.fetch().done(function(){
      console.log(_this.model.get('title'));
      _this.modelJSON = model.toJSON();
    });
    _this.modelJSON = model.toJSON();
    _this.model = model;
  }
})

wp.api.loadPromise.done( function() {

  var weeks = new wp.api.collections.Week( );
  weeks.fetch().done(function(){

    // weeks.each(function(week){
    //
    //   console.log(week.get('acf'));
    //
    //   week.get('acf').recipes.forEach(function(r,week){
    //     id = r.ID;
    //     console.log(r);
    //     console.log(week);
    //     r = new wp.api.models.Recipe( { id : r } );
    //     r.fetch().done(function(){
    //       console.log('recipe fetched');
    //       console.log(weeks);
    //     });
    //   });
    // })


    console.log(weeks);
    viewModel.weeks = weeks.toJSON();
    viewModel.message = '';

  });

});
