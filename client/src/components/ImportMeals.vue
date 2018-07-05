<template>
  <div>
    <span v-if="!recipesWpIdMap || !mealsWpIdMap">Map not loaded</span>
    <input type="file" name="fileToUpload" id="fileToUpload" @change="fileUploaded">
    <button :disabled="!fileLoaded" @click="importXML">Go</button>
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
  name: 'importMeals',
  data () {
    return {
      theText: '',
      fileLoaded: false,
      parsed: 0,
      stored: 0,
      updated: 0,
      recipesWpIdMap: undefined,
      mealsWpIdMap: undefined
    }
  },
  created () {
    MapService.fetchRecipesWpIdMap().then(response => {
      this.recipesWpIdMap = response.map
    }, err => {
      console.log(err)
    })
    MapService.fetchMealsWpIdMap().then(response => {
      this.mealsWpIdMap = response.map
    }, err => {
      console.log(err)
    })
  },
  methods: {
    fileUploaded (event) {
      var file = event.target.files[0]
      var reader = new FileReader()
      reader.readAsText(file)
      reader.onloadend = () => {
        this.theText = reader.result
        this.fileLoaded = true
      }
    },
    importXML () {
      if (!this.recipesWpIdMap) {
        return alert('Something is wrong with the map. Aborted import.')
      }

      var imported = JSON.parse(convert.xml2json(this.theText, {compact: true, spaces: 4}))
      var items = _.filter(imported.rss.channel.item, {'wp:post_type': {'_cdata': 'meal'}})

      var getMeta = (item, key) => {
        return _.filter(item['wp:postmeta'], {'wp:meta_key': {'_cdata': key}})[0] ? _.filter(item['wp:postmeta'], {'wp:meta_key': {'_cdata': key}})[0]['wp:meta_value']._cdata : undefined
      }

      items.forEach(item => {
        var recipes = getMeta(item, 'recipes')
        if (recipes) {
          if (recipes === 'a:0:{}') {
            recipes = undefined
          } else {
            recipes = recipes.replace(/a:[0-9]:\{i:[0-9];s:[0-9]:/, '[')
            recipes = recipes.replace(/;\}/, ']')
            recipes = recipes.replace(/;i:[0-9];s:[0-9]:/g, ',')
            recipes = JSON.parse(recipes)

            recipes = recipes.map(r => {
              var map = this.recipesWpIdMap[parseInt(r)]
              if (map) {
                return map._id
              }
              return undefined
            })
          }
        }

        var mealItem = {
          title: item.title._text,
          made: (getMeta(item, 'made') !== undefined),
          comment: getMeta(item, 'comment'),
          date: new Date(getMeta(item, 'date')),
          recipes: recipes,
          wpId: item['wp:post_id']._text
        }
        this.parsed++

        if (this.mealsWpIdMap[parseInt(mealItem.wpId)]) {
          // Meal in map, update it
          mealItem._id = this.mealsWpIdMap[parseInt(mealItem.wpId)]._id
          this.$store.dispatch('meals/updateMeal', mealItem).then(() => {
            this.updated++
          })
        } else {
          // Meal not in map, store it.
          this.$store.dispatch('meals/addMeal', mealItem).then(() => {
            this.stored++
          })
        }
        console.log(mealItem)
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
