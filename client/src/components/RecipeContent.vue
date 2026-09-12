<template>
  <div class="recipeContent">
    <div v-if="!recipe">…</div>
    <div v-else>
      <!-- The image links to the full-size file only for photographed
           uploads without a recipe link; og/AI images are decoration -->
      <a v-if="imageLink" class="hero" :href="imageLink" target="_blank">
        <img :src="recipe.thumbUrl || recipe.imageUrl || undefined" loading="lazy" decoding="async" :alt="recipe.title" />
      </a>
      <div v-else-if="recipe.imageUrl" class="hero">
        <img :src="recipe.thumbUrl || recipe.imageUrl" loading="lazy" decoding="async" :alt="recipe.title" />
      </div>
      <div class="head">
        <div class="headText">
          <h2>
            <a v-if="recipe.url" :href="recipe.url" target="_blank">{{ recipe.title }}</a>
            <a v-else-if="imageLink" :href="imageLink" target="_blank">{{ recipe.title }}</a>
            <span v-else>{{ recipe.title }}</span>
            <span v-if="recipe.score" class="score" :class="recipe.score > 0 ? 'positive' : 'negative'">
              <ThumbsUp v-if="recipe.score > 0" :size="12" /><ThumbsDown v-else :size="12" />
              {{ Math.abs(recipe.score) }}
            </span>
          </h2>
          <a v-if="sourceHost" class="source" :href="recipe.url" target="_blank">
            {{ sourceHost }} <ExternalLink :size="11" />
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
import { ExternalLink, ThumbsDown, ThumbsUp } from 'lucide-vue-next'

const props = defineProps<{ id: number }>()

const recipesStore = useRecipesStore()
const recipe = computed(() => recipesStore.recipeById(props.id))

// Full-size view is only meaningful for a photographed recipe (an upload
// or a migrated legacy photo). With a recipe link the image is decoration,
// and AI/og-generated images have no original worth opening.
const imageLink = computed(() => {
  const r = recipe.value
  if (!r?.imageUrl || r.url) return null
  if (r.imageSource === 'ai' || r.imageSource === 'og') return null
  return r.imageUrl
})

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

  // Full-bleed image on top of the card: cancels the card padding so the
  // image runs edge to edge, rounded with the card's top corners
  .hero {
    display: block;
    margin: -@bu -@bu @bu;
    border-radius: @radius @radius 0 0;
    overflow: hidden;
    background: darken(@cRecipeBg, 4%);
    img {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
    }
  }
  .head {
    margin-bottom: @bu/2;
  }
  h2 {
    padding-right: @bu*2 * 3;
    margin: 0;
  }
  .score {
    display: inline-block;
    margin-left: @bu/4;
    padding: 0.05rem 0.45rem;
    border-radius: @bu;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0;
    vertical-align: 0.15em;
    white-space: nowrap;
    &.positive {
      color: darken(@cSecondary, 25%);
      background: fade(@cSecondary, 45%);
    }
    &.negative {
      color: fade(@cText, 60%);
      background: darken(@cRecipeBg, 7%);
    }

  }
  .source {
    display: inline-block;
    margin-top: @bu/4;
    font-size: 0.7rem;
    font-weight: 700;
    .capitals;
    color: fade(@cPrimary, 80%);

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
    &:last-child {
      margin-bottom: -@bu/2;
    }
  }
}
</style>
