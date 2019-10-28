<template>
  <div id="app">
    <div class="top">
      <router-link to="/week">{{ $t('Planning') }}</router-link>
      <router-link to="/recipes">{{ $t('Recipes') }}</router-link>
    </div>
    <router-view/>
    <footer>
      <span v-if="$root.locale!=='en'" v-on:click="$root.locale='en'">🇬🇧</span>
      <span v-if="$root.locale!=='se'" v-on:click="$root.locale='se'">🇸🇪</span> |
      <span v-on:click="reloadApp">{{ $t('Reload') }}</span>
    </footer>
  </div>
</template>

<i18n>
  {
    "en": {
      "Recipes": "Recipes",
      "Planning": "Planning",
      "Reload": "Reload"
    },
    "se": {
      "Recipes": "Recept",
      "Planning": "Planering",
      "Reload": "Ladda om"
    }
  }
</i18n>

<script>
export default {
  name: 'App',
  metaInfo: {
    title: 'Hem',
    titleTemplate: '%s | Beckmans matsajt'
  },
  methods: {
    reloadApp () {
      location.reload(true)
    }
  }
}
</script>

<style lang="less">
// @import (css) url('https://fonts.googleapis.com/css?family=IBM+Plex+Mono:400,700|IBM+Plex+Sans+Condensed:500,700|IBM+Plex+Sans:400,400i,500,700|IBM+Plex+Serif:400,400i,600,600i');
@import (css) url('https://rsms.me/inter/inter-ui.css');
@import '../node_modules/reset-css/less/reset';
* { box-sizing: border-box; }
@import "./assets/global.less";

html {
  font-size: 16px;
  letter-spacing: -0,004em;
  font-feature-settings: "calt", "ss01", "case";
  background: multiply(@cHeading, @cBackground);
  @media only screen and (min-device-width : 300px) and (max-device-width : 370px) {
    font-size: 14px;
    letter-spacing: 0,001em;
  }
  @media only screen and (max-device-width : 319px) {
    font-size: 12px;
    letter-spacing: 0,008em;
  }
}

body {
  background: @cBackground;
  // font-family: 'IBM Plex Serif', serif;
  font-family: 'Inter UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 1rem;
  line-height: 1.5em;
  font-weight: 300;
  color: @cText;
}

a, .a {
  color: @cPrimary;
  text-decoration: none;
  cursor: pointer;
}

.top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 900;
  height: 2rem;
  display: flex;
  justify-content: space-between;
  align-content: stretch;
  background: @cBackground;
  font-family: 'Inter UI', sans-serif;
  // font-family: 'IBM Plex Mono', sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 2rem;
  > a {
    .capitals;
    width: 50%;
    display: block;
    flex-grow: 1;
    padding: 0 @bu/1.5;
    margin-left: 2px;
    background: fade(lighten(@cSecondary, 10%), 34%);
    &:first-child {
      margin-left: 0;
    }
    &.router-link-active {
      color: darken(@cSecondary, 20%);
      background: @cSecondary;
    }
  }
}

footer {
  .h3;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: @cHeading;
  text-align: center;
  color: @cBackground;
  .capitals;
  font-size: 0.75rem;
  font-weight: 700;
  margin-top: @bu;
  line-height: @bu*4;
}
#app {
  position: relative;
  padding: 5rem 0 5*@bu;
  min-height: 100vh;
}

header {
  position: fixed;
  top: 2rem;
  left: 0;
  right: 0;
  z-index: 900;
  background: @cMealBg;
  padding: 0;
  text-align: center;
  display: flex;
  justify-content: space-evenly;
  align-content: stretch;
  box-shadow: 0 0 1px rgba(0,0,0,0.2);
}

input, textarea {
  width: calc(100% + @bu);
  margin: 0 -@bu/2 @bu/2;
  padding: @bu/2 @bu/2;
  border: 1px solid fade(@cBackground, 40%);
  outline: none;
  font-size: 1rem;
  border-radius: @radius;
  font-family: 'Inter UI', sans-serif;
  // font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 500;
  line-height: 1.5em;
  color: @cText;
  display: block;
  resize: none;
  &::placeholder {
    color: fade(@cPrimary, 30%);
  }
}
textarea {
  font-family: 'Inter UI', sans-serif;
  // font-family: 'IBM Plex Mono', monospace;
  font-size: 0.88rem;
  &::placeholder {
    font-family: 'Inter UI', sans-serif;
    // font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 500;
    line-height: 1.5em;
    font-size: 1rem;
  }
}

.text {
  &-center { text-align: center; }
  &-disabled { opacity: 0.66; }
}

.clear {
  &::after {
    clear: both;
    content: '';
    display: block;
    width: 100%;
    height: 0;
  }
}

.toolbar {
  .noselect;
  position: absolute;
  top: @bu/2;
  right: @bu/2;
  .fal {
    border-radius: 100%;
    font-size: @bu;
    padding: @bu/2;
    cursor: pointer;
    width: @bu*2;
    text-align: center;
    transition: all 0.3s;
    &:hover {
      background-color: darken(@cMealBg, 5%);
    }
  }
}

.cardfooter {
  .clear;
  margin-top: @bu;
}

.comment {
  line-height: 1.5em;
  font-size: .88rem;
  p { margin-bottom: @bu/2; }
  ul, ol {
    margin-bottom: @bu/2;
    li {
      list-style: square;
      padding: 0 0 0 0em;
      margin: 0 0 0 1.2em;
    }
  }
  ol li {
    list-style: decimal;
    margin-bottom: @bu/4;
  }
}
strong { font-weight: bold; }
em { font-style: italic; }
hr {
  border: none;
  border-bottom: 1px solid @cBackground;
  margin: @bu 0;
}
</style>
