<template>
  <div>
    {{count}}
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: "Counter",
    computed: mapState([
      // map this.count to store.state.count
      'count'
    ])
  }
</script>
