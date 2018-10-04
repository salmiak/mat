<template>
  <div class="contextMenuArea" v-long-press="toggleMenu" @mousedown="tapStart" @mouseup="tapEnd" :style="{ zIndex: showMenu||showTapIndicator?900:0 }">
    <slot />
    <svg v-if="showTapIndicator" class="tapIndicator" :style="[pos]" height="64" width="64">
      <circle :class="['circle', {'animate': showTapIndicator} ]" cx="32" cy="32" r="30" stroke="#fbafaf" stroke-width="4" fill-opacity="0" />
    </svg>
    <div v-if="showMenu" class="contextMenu" :style="pos">
      <slot name="contextMenu"></slot>
    </div>
  </div>
</template>

<script>
import {findIndex} from 'lodash'
export default {
  name: 'ContextMenu',
  data () {
    return {
      showMenu: false,
      showTapIndicator: 0,
      pos: {
        top: 0,
        left: 0
      }
    }
  },
  created () {
    this.$root.$on('closeContextMenu', () => {
      this.showMenu = false
    })
  },
  methods: {
    tapStart (e) {
      if (!this.showMenu || findIndex(e.path, {className: 'contextMenu'}) === -1) {
        this.$root.$emit('closeContextMenu')
        this.showTapIndicator = 1
        this.pos = {
          left: e.layerX + 'px',
          top: e.layerY + 'px'
        }
      }
    },
    tapEnd () {
      this.showTapIndicator = 0
    },
    toggleMenu () {
      this.showTapIndicator = 0
      this.showMenu = true
    }
  }
}
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.contextMenuArea {
  position: relative;
  .tapIndicator {
    position: absolute;
    z-index: 100;
    width: 64px;
    height: 64px;
    transform: translate(-32px, -32px);
  }
  .contextMenu {
    position: absolute;
    z-index: 300;
    background: #FFF;
    border-radius: 4px;
    box-shadow: 0 2px 10px fade(#000, 24%);
    li {
      padding: 8px 16px;
      border-bottom: 1px solid fade(#000, 12%);
      white-space: nowrap;
      &:hover {
        background: @cMealBg;
      }
    }
  }
}
.circle {
  stroke-dasharray: 400;
  stroke-dashoffset: 400;
  &.animate {
    animation: stroke 1.2s .3s linear forwards;
  }
}
@keyframes stroke {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
