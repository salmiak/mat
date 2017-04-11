$ = jQuery;

wp.api.loadPromise.done( function() {

  weekTemplate = _.template($('#week').html())

  var recipes = new wp.api.collections.Recipe( );
  recipes.fetch().done(function(){

    var allWeeks = new wp.api.collections.Week( );
    allWeeks.fetch().done(function(){

      allWeeks.forEach(function(week){

        var thisWeeksRecipes = recipes.filter(function(r){
          return r.get('week').indexOf(week.id)!=-1
        })

        week.set('recipes',thisWeeksRecipes);

        $('body').append(weekTemplate(week.toJSON()));

      })

    });

  });

} )
