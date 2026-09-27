import { store } from '../storeUtils/store'

/**
 * ユーザーが自身のAPIキーを設定済みかどうかを判定
 */
export function hasConfiguredApiKey(): boolean {
    const key = (store.aiApiKey || '').trim()
    if (key.length > 0) {
        return true
    }
    if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('ai-api-key')
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                if (typeof parsed === 'string' && parsed.trim().length > 0) {
                    return true
                }
            } catch {}
        }
    }
    return false
}

/**
 * APIキーの安全性とプライバシーに関する多言語告知文
 */
export function getApiKeySecurityNotice(lang: string = 'jp'): string {
    const notices: Record<string, string> = {
        jp: '【🔒 APIキーの安全性について】\n入力されたAPIキーはお使いのブラウザ内（localStorage）にのみ安全に保存され、開発者を含む外部サーバーへ送信・収集されることは一切ありません。\nAIとの通信は、お使いの端末（ブラウザ）からGroq・Google等の公式APIエンドポイントへ直接HTTPS暗号化通信で行われます。',
        en: '【🔒 API Key Privacy & Security】\nYour API key is stored strictly locally in your browser (localStorage). It is NEVER sent to or collected by any intermediate third-party servers.\nAll communications are sent directly and encrypted (HTTPS) from your device to the official AI provider APIs (Groq, Google, etc.).',
        kr: '【🔒 API 키 보안 및 개인정보 보호】\n입력하신 API 키는 브라우저 내부(localStorage)에만 안전하게 저장되며, 외부 서버로 전송되거나 수집되지 않습니다.\n모든 AI 통신은 사용자의 브라우저에서 공식 API(Groq, Google 등)로 직접 암호화되어 전송됩니다.',
        zh: '【🔒 关于 API 密钥的安全性】\n您输入的 API 密钥仅保存在本地浏览器（localStorage）中，绝不会上传或发送至任何第三方中转服务器。\n所有 AI 对话均由您的设备直接向 Groq、Google 等官方 API 发起加密（HTTPS）请求。',
        tw: '【🔒 關於 API 金鑰的安全性】\n您輸入的 API 金鑰僅保存在本機瀏覽器（localStorage）中，絕不會上傳或發送至任何第三方伺服器。\n所有 AI 對話均由您的裝置直接向 Groq、Google 等官方 API 發起加密（HTTPS）請求。'
    }
    return notices[lang] || notices.jp
}

/**
 * 環境に応じたベースURLの動的解決（GitHub Pages: /momotalk_AI/、ローカル開発: /momotalk/）
 */
export function resolveAppBaseUrl(env: Record<string, string | undefined> = {}): string {
    if (env.VITE_BASE) {
        return env.VITE_BASE
    }
    if (env.GITHUB_REPOSITORY) {
        const repoName = env.GITHUB_REPOSITORY.split('/')[1]
        if (repoName) {
            return `/${repoName}/`
        }
    }
    if (env.NODE_ENV === 'production') {
        return '/momotalk_AI/'
    }
    return '/momotalk/'
}
