<template>
  <div class="meal">
    <div v-if="expanded">
      <h1>Add Meal</h1>
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
<style type="text/css" scoped>
.meal {
  background: #FFF;
  padding: 16px;
  border: 1px solid #EEE;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  margin: 12px auto;
  text-align: left;
}
.meal h1 {
  margin-top: 8px;
}
.meal .closeBtn {
  display: block;
  text-align: center;
  text-decoration: underline;
  color: blue;
  margin: 16px 0;
  cursor: pointer;
}
</style>
