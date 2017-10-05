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
      let recipeData = this.$store.getters.recipeById(this.id)
      delete recipeData.id
      return recipeData
    }
  }
</script>
