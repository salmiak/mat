import axios from 'axios';

export const HTTP = axios.create({
  baseURL: window.wp_root_url + '/wp-json/wp/v2/',
  headers: {
    'X-WP-Nonce': wpApiSettings.nonce
  }
})
