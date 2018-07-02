<template>
  <div>
    <textarea v-model="theText"></textarea>
    <button @click="importJSON">Go</button>
    <p>
      Parsed: {{parsed}}
    </p>
    <p>
      Stored: {{stored}}
    </p>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'importRecipes',
  data () {
    return {
      theText: '',
      parsed: 0,
      stored: 0
    }
  },
  methods: {
    importJSON () {
      var imported = JSON.parse(this.theText.replace(/\r?\n|\r/g, ' '))
      var items = imported.rss.channel.item
      console.log(items)

      items.forEach(item => {
        var urlObject = _.filter(item['wp:postmeta'], {'wp:meta_key': 'url'})[0]
        var recipeItem = {
          title: item.title,
          comment: item['content:encoded'],
          url: urlObject ? urlObject['wp:meta_value'] : undefined,
          wpId: item['wp:post_id']
        }
        this.parsed++
        console.log(recipeItem)

        this.$store.dispatch('recipes/addRecipe', recipeItem).then(() => {
          this.stored++
        })
      })
    }
  }
}
</script>

<style scoped>
textarea {
  display: block;
  height: 500px;
  width: 600px;
  margin: 16px auto;
  font-family: monospace;
}
</style>
