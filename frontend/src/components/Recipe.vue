<template>
  <div>
    {{title}}
  </div>
</template>

<script>
  import _ from 'lodash'
  export default {
    name: "Recipe",
    props: ['id'],
    data() {
      let recipeData = _.find(this.$store.state.recipes, {id: this.id})
      delete recipeData.id
      return recipeData
    }
  }
</script>
