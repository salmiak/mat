<template>
  <div>
    <input v-if="!status" type="file" ref="uploadInput" @change="readFile">
    <span v-if="status === 1">Laddar upp filen...</span>
    <img :src="uploadedFileUrl" v-if="uploadedFileUrl" width="100px" />
  </div>
</template>

<script>

var apiBaseURL = process.env.API_HOST
const cdnHost = '//mat-cdn.s3-eu-west-1.amazonaws.com/'

export default {
  name: 'upload',
  data () {
    return {
      status: 0,
      uploadedFileUrl: undefined
    }
  },
  methods: {
    readFile () {
      this.status = 1
      this.$emit('uploadStart')

      var _this = this
      _this.file = this.$refs.uploadInput.files[0]

      // Adds timestamp to filename to make sure the filename is unique
      _this.fileName = _this.file.name.split('.')
      _this.fileName.splice(-1, 0, (new Date()).getTime())
      _this.fileName = _this.fileName.join('.')

      var reader = new FileReader()
      reader.addEventListener('loadend', function (e) {
        fetch(apiBaseURL + 'requestUploadURL', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: _this.fileName,
            type: _this.file.type
          })
        })
          .then(function (response) {
            return response.json()
          })
          .then(function (json) {
            return fetch(json.uploadURL, {
              method: 'PUT',
              body: new Blob([reader.result], {type: _this.file.type})
            })
          })
          .then(function () {
            _this.status = 2
            _this.$emit('uploadDone', {fileUrl: cdnHost + _this.fileName})
            _this.uploadedFileUrl = cdnHost + _this.fileName
          })
      })
      reader.readAsArrayBuffer(_this.file)
    }
  }
}
</script>

<style>
</style>
