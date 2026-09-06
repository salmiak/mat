<template>
  <div class="expander" :class="{ collapsed }">
    <slot></slot>
    <div v-if="collapsed" class="toggleCollapsed" @click="collapsed = false">
      + {{ t('Show more') }}
    </div>
    <div v-else class="toggleExpanded" @click="collapsed = true">
      - {{ t('Show less') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const collapsed = ref(true)
</script>

<style lang="less" scoped>
@import "@/assets/global.less";
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
    .capitals;
    font-size: .8rem;
    font-weight: 500;
    cursor: pointer;
    // Fades into the surrounding card's color: cards set --expander-bg to
    // their background (defaults to the white recipe card).
    background-image: linear-gradient(to bottom, transparent 0%, var(--expander-bg, @cRecipeBg) 100%);
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
    .capitals;
    font-size: .8rem;
    font-weight: 500;
    cursor: pointer;
  }
}
</style>
