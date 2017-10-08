<template>
  <div class="add-meal">
    <form v-if="showForm">
      <div class="closeIcon" @click="toggleForm()">
        <icon name="times"></icon>
      </div>

      <h2>Lägg till måltid</h2>
      <input v-model="mealData.title" placeholder="Namn"/>
      <textarea v-model="mealData.fields.comment" placeholder="Kommentar"></textarea>
      Recept?
      <p>
        <span class="pull-right btn" @click="toggleForm()">Stäng</span>
        <span class="btn btn-primary" @click="saveMeal()">Spara</span>
      </p>
    </form>

    <div @click="toggleForm()" v-else>
      Lägg till måltid
    </div>
  </div>
</template>

<script>
  import Recipe from './Recipe'
  import moment from 'moment'

  var emptyMeal = {
    fields: {},
    status: 'publish'
  }

  export default {
    name: "AddMeal",
    components: { Recipe },
    props: ['year','week'],
    data() {
      return {
        showForm: false,
        mealData: JSON.parse(JSON.stringify(emptyMeal))
      }
    },
    methods: {
      toggleForm() {
        this.showForm = !this.showForm
      },
      saveMeal() {
        this.mealData.fields.date = moment().isoWeekYear( this.year ).isoWeek( this.week )
        this.$store.dispatch('updateMeal',{payload: this.mealData})
        this.mealData = JSON.parse(JSON.stringify(emptyMeal))
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.add-meal {
  position: relative;
  margin: 1em 0 0;
  > div {
    cursor: pointer;
    padding: 1em .3em;
    border-bottom: 1px solid fade(@colorPrimary, 12%);
    border-top: 1px solid fade(@colorPrimary, 12%);
    &:hover {
      background: fade(@colorPrimary, 3%);
    }
  }
  > form {
    padding: .2em .3em .5em;
    border-bottom: 1px solid fade(@colorPrimary, 12%);
    border-top: 1px solid fade(@colorPrimary, 12%);
    background: fade(@colorPrimary, 3%);
  }
}
h2 {
  font-size: 1.2em;
  margin: .5em 0 .75em;
}
.closeIcon {
  position: absolute;
  top: .35em;
  left: -2em;
  cursor: pointer;
  padding: .5em .5em .25em;
}
</style>
