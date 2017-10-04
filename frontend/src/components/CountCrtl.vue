<template>
  <p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
    <span @click="toggle">{{test}}</span>
  </p>
</template>

<script>
  import { mapState } from 'vuex'
  export default {
    name: "CountControll",
    data () {
      return {
        isTest: true
      }
    },
    computed: {
      test() {
        return this.isTest?'yes':'no'
      },
      ...mapState([
        // map this.count to store.state.count
        'count'
      ])
    },
    methods: {
      increment () {
        this.$store.commit('increment')
      },
      decrement () {
      	this.$store.commit('decrement')
      },
      toggle () {
        this.isTest = !this.isTest
      }
    }
  }
</script>
