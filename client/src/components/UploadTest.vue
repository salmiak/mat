<template>
  <div>
    <h1>Upload test</h1>
    <p>{{status}}</p>
    <img :src="fileUrl" v-if="fileUrl" />
    <upload
      v-on:uploadStart="status = 'started upload'"
      v-on:uploadDone="handleDone"></upload>
  </div>
</template>

<script>
import Upload from './Upload'

export default {
  name: 'uploadTest',
  data () {
    return {
      status: 'waiting on file',
      fileUrl: undefined
    }
  },
  components: { Upload },
  methods: {
    handleDone (e) {
      this.fileUrl = e.fileUrl
      this.status = 'done!'
    }
  }
}
</script>

<style>
</style>
