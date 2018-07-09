// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import VueFuse from 'vue-fuse'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)
Vue.use(VueFuse)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  i18n: new VueI18n({
    locale: 'se', // set locale
    messages: {
      'en': {
        'Recipes': 'Recipes',
        'Add Recipe': 'Add Recipe',
        'Add Meal': 'Add Meal',
        'Meals': 'Meals',
        'Cancel': 'Cancel',
        'Save': 'Save',
        'Title': 'Title',
        'Comment': 'Comment',
        'Url': 'Url',
        'Type to search': 'Type to search'
      },
      'se': {
        'Recipes': 'Recept',
        'Add Recipe': 'Lägg till recept',
        'Add Meal': 'Lägg till måltid',
        'Meals': 'Måltider',
        'Cancel': 'Avbryt',
        'Save': 'Spara',
        'Title': 'Titel',
        'Comment': 'Kommentar',
        'Url': 'Url',
        'Type to search': 'Skriv för att söka'
      }
    }
  }),
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
