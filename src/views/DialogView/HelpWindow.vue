<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { store } from '@/assets/storeUtils/store'
import { getHelpMarkdown } from '@/assets/storeUtils/helpContent'
import IconClose from '@/components/icons/IconClose.vue'

const router = useRouter()
const route = useRoute()

const closeDialog = () => {
    store.closeHelpDialog()
    if (route && (route.path === '/help' || route.path.endsWith('/help'))) {
        router.replace({ path: '/', query: route.query }).catch(() => {})
    }
}

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && store.showHelpDialog) {
        closeDialog()
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
    <transition name="dialog-fade">
        <div
            v-if="store.showHelpDialog"
            class="dialog-mask flex-center help-dialog-mask"
            @click="closeDialog"
        >
            <div class="popper-content popper-content--help" @click.stop>
                <div class="popper-content__title">
                    <header>
                        <span class="help-title-badge">?</span>
                        <span>{{ $t('helpTitle') || 'MomoTalk AI 利用ガイド' }}</span>
                    </header>
                    <button class="close-btn" @click="closeDialog" aria-label="Close" title="Close">
                        <IconClose class="icon close" />
                    </button>
                </div>
                <div class="popper-content__body help-body">
                    <v-md-preview :text="getHelpMarkdown(store.language)"></v-md-preview>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped lang="scss">
@import './dialog-view.scss';

.popper-content--help {
    width: 680px;
    max-width: 92vw;
    max-height: min(88vh, 760px);
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(45, 35, 66, 0.25);
    border-radius: 12px;
    overflow: hidden;

    .popper-content__title {
        padding: 8px 16px;
        header {
            max-width: calc(100% - 46px);
            font-size: 17px;
            display: flex;
            align-items: center;
            overflow: hidden;
            span:last-child {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
}

.help-title-badge {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    background-color: var(--theme_title_color, rgb(252, 150, 171));
    color: #fff;
    border-radius: 6px;
    font-weight: 900;
    font-size: 16px;
    margin-right: 8px;
    box-shadow: rgba(45, 35, 66, 0.15) 0 2px 4px;
}

.help-body {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 12px 18px 24px;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;

    :deep(.vuepress-markdown-body) {
        background-color: transparent !important;
        color: #2a323e;
        font-family: inherit;
        padding: 0;

        h1 {
            font-size: 22px;
            border-bottom: 2px solid #e1e7ec;
            padding-bottom: 8px;
            margin-top: 10px;
            margin-bottom: 16px;
            color: #2a323e;
        }

        h2 {
            font-size: 18px;
            margin-top: 20px;
            margin-bottom: 12px;
            color: #2a323e;
        }

        h3 {
            font-size: 16px;
            margin-top: 16px;
            margin-bottom: 8px;
        }

        p, li {
            font-size: 14.5px;
            line-height: 1.65;
            color: #4b5a6f;
        }

        ul {
            padding-left: 20px;
        }

        a {
            color: #3493f9;
            text-decoration: underline;
        }

        code {
            background-color: #f3f7f8;
            color: #2a323e;
            padding: 2px 6px;
            border-radius: 4px;
        }
    }
}
</style>
