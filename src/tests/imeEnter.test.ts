import { describe, it, expect } from 'vitest'
import { isImeComposing } from '@/assets/utils/ime'

const enter = (init: KeyboardEventInit & { keyCode?: number } = {}) =>
    new KeyboardEvent('keydown', { key: 'Enter', ...init })

describe('isImeComposing (Enter that confirms an IME conversion must not send)', () => {
    it('detects the conversion-confirming Enter on Mac Chrome (isComposing)', () => {
        expect(isImeComposing(enter({ isComposing: true, keyCode: 229 }))).toBe(true)
    })

    it('detects it on Mac Safari, which only reports keyCode 229', () => {
        expect(isImeComposing(enter({ keyCode: 229 }))).toBe(true)
    })

    it('lets a normal Enter through so it still sends', () => {
        expect(isImeComposing(enter({ keyCode: 13 }))).toBe(false)
    })
})
