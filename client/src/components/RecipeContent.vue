<template>
  <div class="recipeContent">
    <div v-if="!recipe">…</div>
    <div v-else>
      <h2>
        <a v-if="recipe.url" :href="recipe.url" target="_blank">{{ recipe.title }}</a>
        <a v-else-if="recipe.imageUrl" :href="recipe.imageUrl" target="_blank">{{ recipe.title }}</a>
        <span v-else>{{ recipe.title }}</span>
      </h2>

      <a v-if="recipe.imageUrl" :href="recipe.imageUrl" target="_blank">
        <img :src="recipe.imageUrl" class="recipe-thumbnail" />
      </a>

      <expander-box v-if="recipe.comment && recipe.comment.length > 70" class="comment">
        <markdown-text :source="recipe.comment" />
      </expander-box>
      <markdown-text v-else class="comment" :source="recipe.comment" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRecipesStore } from '@/stores/recipes'
import ExpanderBox from './ExpanderBox.vue'
import MarkdownText from './MarkdownText.vue'

const props = defineProps<{ id: number }>()

const recipesStore = useRecipesStore()
const recipe = computed(() => recipesStore.recipeById(props.id))
</script>

<style lang="less" scoped>
@import "@/assets/global.less";
.recipeContent {
  position: relative;
  background: @cRecipeBg;
  // Recipe cards stay white even inside a meal card, so reset the fade color
  --expander-bg: @cRecipeBg;
  padding: @bu @bu @bu/2;
  border-radius: @radius;
  margin: 0;
  h2 {
    padding-right: @bu*2 * 3;
    &:not(:last-child) {
      margin-bottom: @bu/2;
    }
  }
  .recipe-thumbnail {
    max-width: 120px;
    height: auto;
    float: left;
    margin: 0 @bu @bu/2 0;
  }

  &::after {
    content: '';
    display: block;
    clear: both;
  }
}
.meal {
  .recipeContent {
    width: auto;
    margin: @bu/2 -@bu/2;
    h2 {
      .h3;
      line-height: @bu;
    }
    &:last-child {
      margin-bottom: -@bu/2;
    }
  }
}
</style>
