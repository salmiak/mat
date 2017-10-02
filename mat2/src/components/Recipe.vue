<template>
  <div class="recipe">
    <a v-if="acf.url" v-bind:href="acf.url"><h2>{{title}}</h2></a>
    <h2 v-else>{{title}}</h2>
    <div v-html="content"></div>
  </div>
</template>

<script>
import {HTTP} from '../http.js'
export default {
  name: 'recipe',
  props: {
    id: {
      type: Number,
      default: undefined
    }
  },
  data: () => ({
    id: '',
    title: '',
    content: '',
    acf: Object
  }),
  created() {
    if (this.id)
      HTTP.get('recipe/'+this.id)
      .then(response => {
        this.id = response.data.id
        this.title = response.data.title.rendered
        this.content = response.data.content.rendered
        this.acf.url = response.data.acf.url
      })
      .catch(e => {
        console.error(e)
      })
  }
}
</script>
