import './assets/css/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from '@/locales/i18n'
import MarkdownView from '@/markdown/MarkdownView.vue'
import VueLazyLoad from '@/lazyload/index'

const app = createApp(App)

app.use(VueLazyLoad)
app.use(router)
app.use(i18n)
app.component('v-md-preview', MarkdownView)
app.mount('#app')
