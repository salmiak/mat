$ = jQuery;

window.Fuse = Fuse
Vue.component('vueFuse', {
  data () {
    return {
      fuse: null,
      search: '',
      result: []
    }
  },
  template: '#fuseTemplate',
  props: {
    eventName: {
      type: String,
      default: 'fuseResultsUpdated'
    },
    defaultAll: {
      type: Boolean,
      default: true
    },
    list: {
      type: Array
    },
    caseSensitive: {
      type: Boolean,
      default: false
    },
    includeScore: {
      type: Boolean,
      default: false
    },
    includeMatches: {
      type: Boolean,
      default: false
    },
    tokenize: {
      type: Boolean,
      default: false
    },
    matchAllTokens: {
      type: Boolean,
      default: false
    },
    findAllMatches: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    },
    shouldSort: {
      type: Boolean,
      default: true
    },
    threshold: {
      type: Number,
      default: 0.6
    },
    location: {
      type: Number,
      default: 0
    },
    distance: {
      type: Number,
      default: 100
    },
    maxPatternLength: {
      type: Number,
      default: 32
    },
    minMatchCharLength: {
      type: Number,
      default: 1
    },
    keys:  {
      type: Array
    }
  },
  computed: {
    options () {
      var options = {
        caseSensitive: this.caseSensitive,
        includeScore: this.includeScore,
        includeMatches: this.includeMatches,
        tokenize: this.tokenize,
        matchAllTokens: this.matchAllTokens,
        findAllMatches: this.findAllMatches,
        shouldSort: this.shouldSort,
        threshold: this.threshold,
        location: this.location,
        distance: this.distance,
        maxPatternLength: this.maxPatternLength,
        minMatchCharLength: this.minMatchCharLength,
        keys: this.keys
      }
      if (this.id !== '') {
        options.id = this.id
      }
      return options
    }
  },
  watch: {
    search() {
      if (this.search.trim() === '')
        if (this.defaultAll) {
          this.result = this.list
        } else {
          this.result = []
        }
      else
        this.result = this.fuse.search(this.search.trim())
    },
    result () {
      this.$parent.$emit(this.eventName, this.result)
    },
    list () {
      this.search = "";
      this.fuse.list = this.result = this.list;
    }
  },
  methods: {
    initFuse () {
      this.fuse = new window.Fuse(this.list, this.options);
      if (this.defaultAll) {
        this.result = this.list
      }
    }
  },
  /**
  * Vue 1.x
  */
  ready () {
    this.initFuse()
  },
  /**
  * Vue 2.x
  */
  mounted () {
    this.initFuse()
  }
});

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
      confirmingDelete: false,
      iPhone: app.iPhone
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
            app.showAddRecipe = false;
            app.recipeBoilerPlate = JSON.parse(recipeBoilerPlate);
            app.recipes.unshift(result);
          }
        }
      });
    },
    confirmDelete: function(){
      this.confirmingDelete = true;
      var _this = this;
      setTimeout(function(){
        _this.confirmingDelete = false;
      },3000);
    },
    deleteRecipe: function(){
      app.isSaving.push(1);
      var recipe = this.rec;
      $.ajax({
        url: window.wp_root_url + "/wp-json/wp/v2/recipe/"+this.rec.id,
        method: 'DELETE',
        beforeSend: function ( xhr ) {
          xhr.setRequestHeader( 'X-WP-Nonce', wpApiSettings.nonce );
        },
        success: function(data){
          var index = app.recipes.indexOf(recipe)
          app.recipes.splice(index, 1);
          app.isSaving.pop();
        }
      })
    }
  }
})

Vue.component('meal', {
  props: ['meal','recipes'],
  data: function(){
    return {
      collapsed: true,
      inEdit: false,
      drag: false,
      trash: [],
      iPhone: app.iPhone
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
    },
    toggleMade: function(){
      this.meal.fields.made = this.meal.fields.made?0:1;
      this.saveMeal();
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
      showAddMeal: false,
      newMeal: this._resetNewMeal(),
      iPhone: app.iPhone
    }
  },
  methods: {

    _resetNewMeal: function(){
      this.newMeal = {
        status: 'publish',
        fields: {
          week: this.week.nbr,
          recipes: [0],
          made: false
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
          _this.week.meals.planned.unshift(data);
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
          _this.week.meals.planned.unshift(data);
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

    _storeMeals: function(element, index, list, made){
      var _this = this;
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
            week: _this.week.nbr,
            made: made?1:0
          }
        },
        success: function(data){
          processWPContent(data);
          _this.week.meals[made?'made':'planned'].splice(index, 1, data);
          app.isSaving.pop();
        }
      })
    },
    saveWeeksPlannedMeals: function(){
      var _this = this;
      _.each(this.week.meals.planned, function(element, index, list){
        _this._storeMeals(element, index,list, false);
      });
    },
    saveWeeksMadeMeals: function(){
      var _this = this;
      _.each(this.week.meals.made, function(element, index, list){
        _this._storeMeals(element, index,list, true);
      });
    },
    saveWeeksMeals: function(){
      this.saveWeeksPlannedMeals();
      this.saveWeeksMadeMeals();
    }

  }
});

// Source: https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser

function detectmob() {
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}
function isSmallMode() {
  if( detectmob() && window.innerWidth < window.innerHeight )
    return true;
  return false;
}

var app = new Vue({
  el: '#content',
  data: {
    dragingRecipe: false,
    drag: false,
    isSaving: [],
    weeks: [],
    recipes: [],
    recipeSearchResults: [],
    showAddRecipe: false,
    recipeBoilerPlate: JSON.parse(recipeBoilerPlate),
    iPhone: isSmallMode()
  },
  created: function() {
    _this = this
    this.$on('recipeSearched', function(results) {
      _this.recipeSearchResults = results;
    });
  }
});

window.onresize = function(){
  app.iPhone = isSmallMode();
};

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
    for (var week in weekData) {
      weekData[week] = _.sortBy(weekData[week],function(a){
          a.fields.order = a.fields ? a.fields.order || 0 : 0;
          return parseInt(a.fields.order);
      })
      weekData[week] = _.groupBy(weekData[week], function(m){
        return m.fields.made?'made':'planned';
      });
    }

    for (var i = 1; i >= -10; i--) {
      var weekNbr = moment().startOf('week').add(i, 'w').week();
      app.weeks.push({
        nbr: weekNbr,
        isThisWeek: i==0,
        meals: _.defaults(weekData[weekNbr], {planned:[], made: []}) || {planned:[], made: []} // If weekData[weekNbr] is undefined, return empty object
      });
    }
  }
});
