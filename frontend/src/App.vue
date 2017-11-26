<template>

  <div id="app">
    <div id="toolbar" v-if="$store.state.mobile">
      <div id="nav">
        <router-link to="/week">Planering</router-link>
        <router-link to="/recipes">Recept</router-link>
      </div>
    </div>
    <router-view/>
  </div>

</template>

<script>
import Vue from 'vue'
import * as global from './store/utils'

export default {
  name: 'app',
}
</script>

<style lang="less">
@import "./assets/global.less";

#toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: @hToolbar;
  background: @colorBackground;
  z-index: 900;
}

#nav {
  display: block;
  font-size: 0;
  overflow: hidden;
  a {
    font-size: @fusm;
    font-weight: 800;
    .capitals;
    display: inline-block;
    padding: 0 @bu*2;
    line-height: @hToolbar;
    border-left: 1px solid @colorBackground;
    color: @colorBackground;
    background: fade(@colorPrimary, 30%);
    width: 50%;
    &:first-child {
      border-left: none;
    }
    &.router-link-active {
      background-color: @colorSecondary;
    }
  }
}
</style>
