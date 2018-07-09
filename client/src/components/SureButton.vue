<template>
  <component @click="clicked" :is="type || 'span'" :class="{'clicked': clickedOnce}">
    <slot></slot>
  </component>
</template>

<script>
export default {
  name: 'SureButton',
  props: ['type'],
  data () {
    return {
      clickedOnce: false,
      to: undefined
    }
  },
  methods: {
    clicked () {
      clearTimeout(this.to)
      if (this.clickedOnce) {
        this.$emit('clicked')
      } else {
        this.clickedOnce = true
        this.to = setTimeout(() => {
          this.clickedOnce = false
        }, 3000)
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.clicked {
  color: darken(@cSecondary, 20%);
  background: @cSecondary;
  &:hover {
    background-color: darken(@cSecondary, 5%);
  }
}
</style>
