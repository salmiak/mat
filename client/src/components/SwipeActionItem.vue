<template>
<div class="swipeActionItem">
  <v-touch tag="div" class="itemContent" v-bind:pan-options="{ direction: 'horizontal', threshold: 30 }" v-bind:style="{left: leftOffset+'px'}" v-on:panmove="onPanMove" v-on:panend="onPanEnd">
    <slot></slot>
  </v-touch>
  <div class="itemBackground" :class="action" v-if="direction">
    <div>
      <slot v-if="direction=='right' && action =='primary'" name="rightprimary"></slot>
      <slot v-if="direction=='right' && action == 'secondary'" name="rightsecondary"></slot>
    </div>
    <div>
      <slot v-if="direction=='left' && action =='primary'" name="leftprimary"></slot>
      <slot v-if="direction=='left' && action == 'secondary'" name="leftsecondary"></slot>
    </div>
  </div>
</div>
</template>

<script>
var friction = 0.95
var maxThreshold = 0.65
export default {
  name: 'SwipeActionItem',
  props: ['rightActions', 'leftActions'],
  data () {
    return {
      leftOffset: 0
    }
  },
  computed: {
    direction () {
      if (this.leftOffset > 0) {
        return 'right'
      }
      if (this.leftOffset < 0) {
        return 'left'
      }
      return undefined
    },
    action () {
      let itemWidth = this.$el ? this.$el.offsetWidth : 0
      let thresholdInPixels = maxThreshold * itemWidth
      if (this[this.direction + 'Actions'] === 2 && Math.abs(this.leftOffset) > thresholdInPixels) {
        return 'secondary'
      }
      if (Math.abs(this.leftOffset) > thresholdInPixels / 3) {
        return 'primary'
      }
      return undefined
    }
  },
  methods: {
    onPanMove (e) {
      this.leftOffset = e.deltaX * friction
    },
    onPanEnd (e) {
      if (this.direction && this.action) {
        this.$emit(this.direction + this.action)
      }
      this.leftOffset = 0
    },
    emitAction (action) {
      console.log(action)
      this.$emit(action)
    }
  }
}
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.swipeActionItem {
    position: relative;
    overflow: hidden;
}
.itemContent {
    position: relative;
    z-index: 100;
}
.itemBackground {
    .h2;
    @bg: @cBackground;
    z-index: 0;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: @bg;
    box-shadow: 0 0 1*@bu darken(@bg, 15%) inset;
    transition: all 0.2s, opacity 0.2s;
    padding: 0 @bu*2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: @radius;
    &.hidden {
        opacity: 0;
    }
    &.primary {
        @bg: @cSecondary;
        background: @bg;
        box-shadow: 0 0 1*@bu darken(@bg, 10%) inset;
    }
    &.secondary {
        @bg: darken(@cBackground, 10%);
        background: @bg;
        box-shadow: 0 0 1*@bu darken(@bg, 17%) inset;
    }
    .fa-icon {
        font-size: 1.5em;
        vertical-align: -.25em;
        //vertical-align: bottom;
    }
}
.itemFooter {
    padding: @bu;
    border-bottom: @bu solid @cBackground;
    .capitals;
    display: flex;
    justify-content: space-between;
    .btnBar {
        display: flex;
        > div {
            box-shadow: 0 0 0 1px @cPrimary inset;
            padding: @bu;
            margin: 0 @bu 0 0;
            border-radius: @bu*.5;
            cursor: pointer;
            &:hover {
                background: @cPrimary;
            }
        }
    }
    .fa-icon {
        font-size: 1em;
        vertical-align: -.125em;
    }
}
</style>
