<template>

  <div id="app">
    <div id="toolbar">
      <div id="nav">
        <router-link to="/week"><icon name="calendar-o"></icon></router-link>
        <router-link to="/recipes"><icon name="file-text-o"></icon></router-link>
      </div>
    </div>
    <router-view/>
  </div>

</template>

<script>
export default {
  name: 'app',
  created() {
    this.$store.dispatch('requestAllRecipes')
    this.$store.dispatch('requestAllMeals')
  }
}
</script>

<style lang="less">
@import "./assets/global.less";

#toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: @bu*6;
  background: fade(@colorBackground, 95%);
  z-index: 900;
}

#nav {
  position: fixed;
  top: @bu;
  right: @bu;
  display: block;
  border: 1px solid @colorPrimary;
  border-radius: @bu/2;
  width: auto;
  font-size: 0;
  overflow: hidden;
  a {
    font-size: @fu;
    display: inline-block;
    padding: 0 @bu*2;
    line-height: @bu*4;
    border-left: 1px solid @colorPrimary;
    color: fade(@colorPrimary, 54%);
    &:first-child {
      border-left: none;
    }
    &.router-link-active {
      background-color: @colorPrimary;
      color: @colorBackground;
    }
  }
}
</style>
