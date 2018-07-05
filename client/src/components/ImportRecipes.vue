<template>
  <div>
    <span v-if="!wpIdMap">Map not loaded</span>
    <textarea v-model="theText"></textarea>
    <button @click="importXML">Go</button>
    <p>
      Parsed: {{parsed}}
    </p>
    <p>
      Stored: {{stored}} | Updated: {{updated}}
    </p>
  </div>
</template>

<script>
import _ from 'lodash'
import convert from 'xml-js'
import MapService from '@/services/MapService'

export default {
  name: 'importRecipes',
  data () {
    return {
      theText: '',
      parsed: 0,
      stored: 0,
      updated: 0,
      wpIdMap: undefined
    }
  },
  created () {
    MapService.fetchRecipesWpIdMap().then(response => {
      this.wpIdMap = response.map
    }, err => {
      console.log(err)
    })
  },
  methods: {
    importXML () {
      if (!this.wpIdMap) {
        return alert('Something is wrong with the map. Aborted import.')
      }
      var imported = JSON.parse(convert.xml2json(this.theText, {compact: true, spaces: 4}))
      var items = _.filter(imported.rss.channel.item, {'wp:post_type': {'_cdata': 'recipe'}})
      console.log(items)

      items.forEach(item => {
        var urlObject = _.filter(item['wp:postmeta'], {'wp:meta_key': {_cdata: 'url'}})[0]
        var recipeItem = {
          title: item.title._text,
          comment: item['content:encoded']._cdata,
          url: urlObject ? urlObject['wp:meta_value']._cdata : undefined,
          wpId: item['wp:post_id']._text
        }
        this.parsed++

        if (this.wpIdMap[parseInt(recipeItem.wpId)]) {
          // Recipe in map, update it
          recipeItem._id = this.wpIdMap[parseInt(recipeItem.wpId)]._id
          this.$store.dispatch('recipes/updateRecipe', recipeItem).then(() => {
            this.updated++
          })
        } else {
          // Recipe not in map, store it.
          this.$store.dispatch('recipes/addRecipe', recipeItem).then(() => {
            this.stored++
          })
        }
        console.log(recipeItem)
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
