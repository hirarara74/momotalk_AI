import { describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import i18n from '../locales/i18n'
import '../assets/storeUtils/store' // 写真・画像などの文言（src/assets/i18n/*.json）を各言語へ統合する

// 翻訳漏れの再発防止:
//  1. 使っている $t('キー') が全5言語に存在する
//  2. 全言語のキーが揃っている
//  3. 日本語以外の文言に、かな（ひらがな・カタカナ）が混ざっていない
//  4. .vue の画面に、$t を通さない日本語を直接書かない
const LANGS = ['jp', 'en', 'kr', 'zh', 'tw'] as const
const messages = (lang: string) => (i18n.global.getLocaleMessage(lang) as Record<string, unknown>) || {}

function walk(dir: string, out: string[] = []): string[] {
    for (const f of fs.readdirSync(dir)) {
        const p = path.join(dir, f)
        if (fs.statSync(p).isDirectory()) {
            if (f !== 'tests' && f !== 'node_modules') walk(p, out)
        } else out.push(p)
    }
    return out
}
const srcFiles = walk('src')
const vueFiles = srcFiles.filter((f) => f.endsWith('.vue'))
const codeFiles = srcFiles.filter((f) => /\.(vue|ts)$/.test(f) && !/locales[\/]/.test(f))

describe('翻訳の網羅性', () => {
    it('使っている $t / t のキーが、全言語に存在する', () => {
        const used = new Set<string>()
        for (const f of codeFiles) {
            const s = fs.readFileSync(f, 'utf8')
            for (const m of s.matchAll(/\$?\bt\(\s*['"]([A-Za-z][A-Za-z0-9_]*)['"]/g)) used.add(m[1])
        }
        const missing: string[] = []
        for (const key of used) {
            for (const lang of LANGS) if (typeof messages(lang)[key] !== 'string') missing.push(`${lang}:${key}`)
        }
        // 動的に作るキー（例: `$t(variable)`）は対象外。存在しない文字列キーだけを検出する
        expect(missing).toEqual([])
    })

    it('全言語のキーが日本語と揃っている', () => {
        const base = Object.keys(messages('jp')).sort()
        for (const lang of LANGS) {
            const keys = Object.keys(messages(lang)).sort()
            expect(keys.filter((k) => !base.includes(k)), `${lang} にだけあるキー`).toEqual([])
            expect(base.filter((k) => !keys.includes(k)), `${lang} に無いキー`).toEqual([])
        }
    })

    it('日本語以外の文言に、ひらがな・カタカナが混ざっていない', () => {
        const KANA = /[぀-ヿ]/
        const allowed = new Set<string>([]) // 固有名詞などで必要な場合だけ、キーを追加する
        const bad: string[] = []
        for (const lang of LANGS.filter((l) => l !== 'jp')) {
            for (const [k, v] of Object.entries(messages(lang))) {
                if (typeof v === 'string' && KANA.test(v) && !allowed.has(k)) bad.push(`${lang}:${k} = ${v.slice(0, 40)}`)
            }
        }
        expect(bad).toEqual([])
    })
})

describe('画面に日本語を直接書かない', () => {
    it('.vue のテンプレートにある日本語は、$t を通すか、コメントだけ', () => {
        const JP = /[぀-ヿ一-鿿]/
        const bad: string[] = []
        for (const f of vueFiles) {
            const s = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n')
            const m = s.match(/<template>[\s\S]*<\/template>/)
            if (!m) continue
            const stripped = m[0].replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ''))
            stripped.split('\n').forEach((line, i) => {
                const t = line.replace(/\$t\([^)]*\)/g, '')
                if (JP.test(t)) bad.push(`${f}:${i + 1}: ${line.trim().slice(0, 80)}`)
            })
        }
        expect(bad).toEqual([])
    })

    it('.vue のスクリプトにも、画面に出す日本語を直接書かない（保存済みの撮影中メッセージの判定用の文字列は除く）', () => {
        const JP = /[぀-ヿ一-鿿]/
        const bad: string[] = []
        for (const f of vueFiles) {
            const s = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n')
            for (const m of s.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) {
                m[1].split('\n').forEach((line, i) => {
                    const t = line.trim()
                    if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return
                    const code = t.replace(/\/\/.*$/, '')
                    if (!JP.test(code) || !/['"`]/.test(code)) return
                    if (code.includes('撮影中')) return
                    bad.push(`${f}:${i + 1}: ${t.slice(0, 80)}`)
                })
            }
        }
        expect(bad).toEqual([])
    })
})
