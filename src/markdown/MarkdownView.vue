<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps<{ text: string }>()

// html: false keeps raw HTML in the source from being rendered
const md = new MarkdownIt({ html: false, linkify: true })
const defaultLink = md.renderer.rules.link_open
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    tokens[idx].attrSet('target', '_blank')
    tokens[idx].attrSet('rel', 'noopener noreferrer')
    return defaultLink ? defaultLink(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options)
}

const html = computed(() => md.render(props.text))
</script>

<template>
    <div class="vuepress-markdown-body" v-html="html"></div>
</template>
