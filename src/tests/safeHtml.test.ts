import { describe, expect, it } from 'vitest'
import '@/assets/storeUtils/talkHistory' // load first: markdown.ts and send.ts import each other
import { myReExp, safeHtml } from '@/assets/utils/markdown'

const re = new myReExp()
describe('safeHtml', () => {
    it('keeps markup produced by md2html', () => {
        const html = re.md2html('# 見出し\n**太字** [color:red;](赤)')
        expect(safeHtml(html)).toBe(html)
    })
    it('escapes scripts, event handlers and url() styles', () => {
        for (const bad of ['<img src=x onerror=alert(1)>', '<script>alert(1)</script>',
            '<span style="a" onmouseover="alert(1)">x</span>', '<span style="background:url(http://e/x)">x</span>']) {
            expect(safeHtml(bad)).not.toMatch(/<(?!\/span>)/)
        }
        expect(safeHtml(re.md2html('[a" onclick="x](b)'))).not.toMatch(/<(?!\/span>)/)
    })
})
