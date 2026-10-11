import i18n from '@/locales/i18n'

const t = (key: string): string => String((i18n.global as any).t(key))

/** 共有するアプリのURL（GitHub Pages / 開発サーバーのどちらでも、いま開いているサイトのトップ） */
export function getShareUrl(): string {
    const base = (import.meta as any).env?.BASE_URL || '/'
    return location.origin + base
}

/** Web Share API が使えない環境のための、Xの投稿画面へのリンク */
export function getShareIntentUrl(): string {
    return (
        'https://x.com/intent/post?text=' + encodeURIComponent(t('shareText')) + '&url=' + encodeURIComponent(getShareUrl())
    )
}

/**
 * アプリを共有する。端末の共有メニュー（Web Share API）を開き、
 * 使えない環境では X の投稿画面を新しいタブで開く。利用者が共有をやめたときは何もしない。
 */
export async function shareApp(): Promise<'shared' | 'fallback' | 'cancelled'> {
    const data = { title: 'MomoTalk AI', text: t('shareText'), url: getShareUrl() }
    const nav: any = typeof navigator !== 'undefined' ? navigator : undefined
    if (nav && typeof nav.share === 'function' && (typeof nav.canShare !== 'function' || nav.canShare(data))) {
        try {
            await nav.share(data)
            return 'shared'
        } catch (err: any) {
            if (err?.name === 'AbortError') return 'cancelled'
            // 共有メニューを開けなかった場合は、下のフォールバックへ
        }
    }
    window.open(getShareIntentUrl(), '_blank', 'noopener,noreferrer')
    return 'fallback'
}
