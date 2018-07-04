<template>
  <div>
    <span v-if="!wpIdMap">Map not loaded</span>
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
import MapService from '@/services/MapService'

export default {
  name: 'importMeals',
  data () {
    return {
      theText: '',
      parsed: 0,
      stored: 0,
      wpIdMap: undefined
    }
  },
  created () {
    MapService.fetchWpIdMap().then(response => {
      this.wpIdMap = response.map
    }, err => {
      console.log(err)
    })
  },
  methods: {
    importJSON () {
      if (!this.wpIdMap) {
        return alert('Something is wrong with the map. Aborted import.')
      }

      var imported = JSON.parse(this.theText.replace(/\r?\n|\r/g, ' '))
      var items = imported.rss.channel.item

      var getMeta = (item, key) => {
        return _.filter(item['wp:postmeta'], {'wp:meta_key': key})[0] ? _.filter(item['wp:postmeta'], {'wp:meta_key': key})[0]['wp:meta_value'] : undefined
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
              var map = this.wpIdMap[parseInt(r)]
              if (map) {
                return map._id
              }
              return undefined
            })
          }
        }

        var mealItem = {
          title: item.title,
          made: (getMeta(item, 'made') !== undefined),
          comment: getMeta(item, 'comment'),
          date: new Date(getMeta(item, 'date')),
          recipes: recipes
        }
        console.log(mealItem)
        this.parsed++

        this.$store.dispatch('meals/addMeal', mealItem).then(() => {
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
