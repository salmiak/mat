<template>
  <div class="meal">
    <div v-if="expanded">
      <div class="toolbar">
        <i class="fal fa-times" @click="expanded = false"></i>
      </div>
      <h2>Add Meal</h2>
      <edit-meal :week="week" :year="year" :resetOnSave="true" @save-meal="addMeal" @cancel-edit="expanded = false"></edit-meal>
    </div>
    <div v-else>
      <button @click="expanded = true">Add meal</button>
    </div>
  </div>
</template>

<script>
// import _ from 'lodash'
import EditMeal from './EditMeal'

export default {
  name: 'NewMeal',
  props: ['week', 'year'],
  components: { EditMeal },
  data () {
    return {
      // mealData: _.clone(emptyData),
      expanded: false
    }
  },
  methods: {
    addMeal (mealData) {
      this.$store.dispatch('meals/addMeal', mealData).then(() => {
        // this.mealData = _.clone(emptyData)
        // this.expanded = false
      })
    }
  }
}
</script>
<style lang="less" scoped>
@import "../assets/global.less";
.meal {
  background: @cMealBg;
  padding: @bu;
  width: 95%;
  max-width: @bu * 25;
  border-radius: @radius;
  margin: @bu/2 auto;
  position: relative;
  h1 {
    margin-top: 8px;
  }
}
</style>
