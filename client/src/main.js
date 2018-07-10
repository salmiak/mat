// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import VueFuse from 'vue-fuse'
import VueI18n from 'vue-i18n'
import VueCookie from 'vue-cookie'

Vue.use(VueI18n)
Vue.use(VueFuse)
Vue.use(VueCookie)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  i18n: new VueI18n({
    // locale: 'se', // set locale
    silentTranslationWarn: true,
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
  data () {
    return {
      locale: this.$cookie.get('locale') || 'se'
    }
  },
  mounted () {
    this.$i18n.locale = this.locale
  },
  watch: {
    locale (newValue) {
      this.$i18n.locale = newValue
      this.$cookie.set('locale', newValue, 365)
    }
  },
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
