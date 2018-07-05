<template>
  <div class="meal">
    <div v-if="expanded">
      <h2>Add Meal</h2>
      <edit-meal :week="week" :year="year" :mealData="mealData" @save-meal="addMeal"></edit-meal>
      <span @click="expanded = false" class="closeBtn">Close</span>
    </div>
    <div v-else>
      <button @click="expanded = true">Add meal</button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import EditMeal from './EditMeal'

var emptyData = {
  title: '',
  comment: '',
  recipes: []
}

export default {
  name: 'NewMeal',
  props: ['week', 'year'],
  components: { EditMeal },
  data () {
    return {
      mealData: _.clone(emptyData),
      expanded: false
    }
  },
  methods: {
    addMeal (mealData) {
      this.$store.dispatch('meals/addMeal', mealData).then(() => {
        this.mealData = _.clone(emptyData)
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
  h1 {
    margin-top: 8px;
  }
  .closeBtn {
    .btn;
  }
}
</style>
