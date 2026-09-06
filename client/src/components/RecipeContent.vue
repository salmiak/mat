<template>
  <div class="recipeContent">
    <div v-if="!recipe">…</div>
    <div v-else>
      <div class="head" :class="{ hasThumb: !!recipe.imageUrl }">
        <a v-if="recipe.imageUrl" class="thumb" :href="recipe.imageUrl" target="_blank">
          <img :src="recipe.thumbUrl || recipe.imageUrl" loading="lazy" decoding="async" :alt="recipe.title" />
        </a>
        <div class="headText">
          <h2>
            <a v-if="recipe.url" :href="recipe.url" target="_blank">{{ recipe.title }}</a>
            <a v-else-if="recipe.imageUrl" :href="recipe.imageUrl" target="_blank">{{ recipe.title }}</a>
            <span v-else>{{ recipe.title }}</span>
          </h2>
          <a v-if="sourceHost" class="source" :href="recipe.url" target="_blank">
            {{ sourceHost }} <i class="far fa-external-link"></i>
          </a>
        </div>
      </div>

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

const sourceHost = computed(() => {
  if (!recipe.value?.url) return null
  try {
    return new URL(recipe.value.url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
})
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

  .head {
    margin-bottom: @bu/2;
    &.hasThumb {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: @bu;
      align-items: center;
    }
  }
  .thumb {
    display: block;
    width: 4.5rem;
    height: 4.5rem;
    border-radius: @radius;
    overflow: hidden;
    background: darken(@cRecipeBg, 4%);
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }
  h2 {
    padding-right: @bu*2 * 3;
    margin: 0;
  }
  .source {
    display: inline-block;
    margin-top: @bu/4;
    font-size: 0.7rem;
    font-weight: 700;
    .capitals;
    color: fade(@cPrimary, 80%);
    .far {
      font-size: 0.7em;
      vertical-align: 0.1em;
    }
    &:hover {
      color: @cPrimary;
    }
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
    .thumb {
      width: 3rem;
      height: 3rem;
    }
    &:last-child {
      margin-bottom: -@bu/2;
    }
  }
}
</style>
