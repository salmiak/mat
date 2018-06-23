<template>
  <div class="meals">
    <h1>Add Meal</h1>
      <div class="form">
        <div>
          <input type="text" name="title" placeholder="TITLE" v-model="title">
        </div>
        <div>
          <textarea rows="15" cols="15" placeholder="COMMENT" v-model="comment"></textarea>
        </div>
        <div>
          <input type="date" name="date" v-model="date">
        </div>
        <div>
          <button class="app_meal_btn" @click="addMeal">Add</button>
        </div>
      </div>
  </div>
</template>

<script>
import MealsService from '@/services/MealsService'
export default {
  name: 'NewMeal',
  data () {
    return {
      title: '',
      comment: '',
      date: undefined
    }
  },
  methods: {
    async addMeal () {
      await MealsService.addMeal({
        title: this.title,
        comment: this.comment,
        date: this.date
      })
      this.$router.push({ name: 'Meals' })
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
