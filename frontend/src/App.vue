<template>

  <div id="app">
    <div id="toolbar">
      <div id="nav">
        <router-link to="/week">Planering</router-link>
        <router-link to="/recipes">Recept</router-link>
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
  height: @hToolbar;
  background: fade(@colorSecondary, 75%);
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
    color: fade(@colorBackground, 70%);
    width: 50%;
    &:first-child {
      border-left: none;
    }
    &.router-link-active {
      background-color: @colorSecondary;
      color: @colorBackground;
    }
  }
}
</style>
