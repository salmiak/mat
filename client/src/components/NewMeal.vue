<template>
  <div class="meals">
    <h1>Add Meal</h1>
      <div>
        <div>
          <input type="text" name="title" placeholder="TITLE" v-model="title">
        </div>
        <div>
          <textarea rows="15" cols="15" placeholder="COMMENT" v-model="comment"></textarea>
        </div>
        <div>
          <button class="app_meal_btn" @click="addMeal">Add</button>
        </div>
      </div>
  </div>
</template>

<script>
import MealsService from '@/services/MealsService'
import moment from 'moment'

export default {
  name: 'NewMeal',
  props: ['week', 'year'],
  data () {
    return {
      title: '',
      comment: ''
    }
  },
  computed: {
    date () {
      return moment().isoWeek(this.week).isoWeekYear(this.year).startOf('isoWeek').toDate()
    }
  },
  methods: {
    async addMeal () {
      await MealsService.addMeal({
        title: this.title,
        comment: this.comment,
        date: this.date
      })
      this.title = ''
      this.comment = ''
      // TODO: Missing reload of list on save - time for VUEX?
    }
  }
}
</script>
<style type="text/css">
.form input, .form textarea {
  width: 500px;
  padding: 10px;
  border: 1px solid #e0dede;
  outline: none;
  font-size: 12px;
}
.form div {
  margin: 20px;
}
.app_meal_btn {
  background: #4d7ef7;
  color: #fff;
  padding: 10px 80px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
  width: 520px;
  border: none;
  cursor: pointer;
}
</style>
