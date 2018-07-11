<template>
  <div class="expander" :class="{'collapsed':collapsed}">
    <slot></slot>
    <div v-if="collapsed" @click="collapsed = !collapsed" class="toggleCollapsed">
      + {{ $t('Show more') }}
    </div>
    <div v-if="!collapsed" @click="collapsed = !collapsed" class="toggleExpanded">
      - {{ $t('Show less') }}
    </div>
  </div>
</template>

<i18n>
  {
    "en": {
      "Show more": "Show more",
      "Show less": "Show less"
    },
    "se": {
      "Show more": "Visa mer",
      "Show less": "Visa mindre"
    }
  }
</i18n>

<script>
export default {
  name: 'expander',
  data () {
    return {
      collapsed: true
    }
  }
}
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.expander {
  position: relative;
  padding-bottom: @bu*2;
  overflow: hidden;
  transition: max-height .7s ease-in-out;
  max-height: 255rem;
  &.collapsed {
    max-height: @bu*4;
    transition: max-height .7s cubic-bezier(0, 1, 0, 1);
  }
  .toggleCollapsed {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    color: @cPrimary;
    line-height: @bu*2;
    padding-top: @bu*3;
    font-family: 'IBM Plex Sans Condensed', sans-serif;
    .capitals;
    font-size: .8rem;
    font-weight: 500;
    cursor: pointer;
    background-image: linear-gradient(to bottom, fade(@cRecipeBg, 0%) 0%,@cRecipeBg 100%);
  }
  .toggleExpanded {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    color: @cPrimary;
    line-height: @bu*2;
    padding-top: @bu;
    font-family: 'IBM Plex Sans Condensed', sans-serif;
    .capitals;
    font-size: .8rem;
    font-weight: 500;
    cursor: pointer;
  }
}
</style>
