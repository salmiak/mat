import Vue from 'vue'
import axios from 'axios'

const client = axios.create({
  baseURL: process.env.API_HOST,
  json: true
})

export default {
  async execute (method, resource, data, params) {
    let accessToken = await Vue.prototype.$auth.getAccessToken()
    return client({
      method,
      url: resource,
      data,
      params,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(req => {
      return req.data
    }, (err) => {
      console.log('API error')
      console.log(err)
    })
  }
}
