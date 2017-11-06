<template>
  <div class="swipeActionItem">
    <template v-if="$store.state.mobile">
      <v-touch
        tag="div"
        class="itemContent"
        v-bind:pan-options="{ direction: 'horizontal', threshold: 20 }"
        v-bind:style="{left: leftOffset+'px'}"
        v-on:panmove="onPanMove"
        v-on:panend="onPanEnd">
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
    </template>
    <div v-else>
      <slot></slot>
      <div class="itemFooter">
        <div class="btnBar">
          <div v-on:click="emitAction('rightprimary')">
            <slot name="rightprimary" ></slot>
          </div>
          <div v-on:click="emitAction('rightsecondary')">
            <slot name="rightsecondary" ></slot>
          </div>
        </div>
        <div class="btnBar">
          <div v-on:click="emitAction('leftsecondary')">
            <slot name="leftsecondary" ></slot>
          </div>
          <div v-on:click="emitAction('leftprimary')">
            <slot name="leftprimary" ></slot>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>

  var friction = 0.85
  var maxThreshold = 0.45

  export default {
    name: "SwipeActionItem",
    props:['rightActions','leftActions'],
    data() {
      return {
        leftOffset: 0
      }
    },
    computed: {
      direction() {
        if (this.leftOffset > 0) return 'right'
        if (this.leftOffset < 0) return 'left'
        return undefined
      },
      action() {
        let itemWidth = this.$el?this.$el.offsetWidth:0
        let thresholdInPixels = maxThreshold*itemWidth
        if ( this[this.direction+'Actions'] == 2 &&
             Math.abs(this.leftOffset) > thresholdInPixels) return 'secondary'
        if ( Math.abs(this.leftOffset) > thresholdInPixels/5) return 'primary'
        return undefined
      }
    },
    methods: {
      onPanMove(e) {
        this.leftOffset = e.deltaX * friction
      },
      onPanEnd(e) {
        if (this.direction && this.action)
          this.$emit(this.direction+this.action)
        this.leftOffset = 0;
      },
      emitAction(action) {
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
  z-index: 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: fade(@colorPrimary, 5%);
  transition: background 0.2s, opacity 0.2s;
  padding: 0 @bu*2;
  .capitals;
  font-size: @fulg;
  font-weight: 700;
  font-style: italic;
  .border-bottom;
  .display(flex);
  .justify-content(space-between);
  .align-items(center);
  &.hidden {
    opacity: 0;
  }
  &.primary {
    background: @colorYellow;
  }
  &.secondary {
    background: @colorSecondary;
  }
  .fa-icon {
    font-size: 1.5em;
    vertical-align: -.25em;
    //vertical-align: bottom;
  }
}
.itemFooter {
  padding: @bu;
  border-bottom: @bu solid @colorBody;
  .capitals;
  .display(flex);
  .justify-content(space-between);
  .btnBar {
    .display(flex);
    > div {
      box-shadow: 0 0 0 1px @colorBorder inset;
      padding: @bu;
      margin: 0 @bu 0 0;
      border-radius: @bu*.5;
      cursor: pointer;
      &:hover {
        background: @colorYellow;
      }
    }
  }
  .fa-icon {
    font-size: 1em;
    vertical-align: -.125em;
  }
}
</style>
