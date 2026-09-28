<script setup lang="ts">
import { store } from '@/assets/storeUtils/store'
import { getHelpMarkdown } from '@/assets/storeUtils/helpContent'
</script>

<template>
    <main>
        <v-md-preview :text="getHelpMarkdown(store.language)"></v-md-preview>
    </main>
</template>

<style lang="scss" scoped>
main {
    @include hide-scrollbar;
    overflow-x: hidden;
}
</style>
