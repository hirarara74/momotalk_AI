import { describe, it, expect } from 'vitest'
import { buildPhotoPromptDirective } from '@/assets/imageGen/intentDetector'
import { buildPollinationsUrl } from '@/assets/imageGen/providers/pollinations'

describe('Photo Feature: Character Voice & Image Paywall Fixes (TDD)', () => {
  describe('1. Character Voice Preservation in Photo Prompt Directives', () => {
    it('does NOT contain specific conversational dialogue anchors like "自撮り？ちょっと待ってね！"', () => {
      const jpDirective = buildPhotoPromptDirective('jp')
      // Specific dialogue anchor phrases cause LLMs to echo them verbatim, destroying character voice!
      expect(jpDirective).not.toContain('自撮り？ちょっと待ってね！')
      expect(jpDirective).not.toContain('ちょっと待ってね')
    })

    it('explicitly instructs the LLM to strictly preserve student persona, tone, first/second-person pronouns', () => {
      const jpDirective = buildPhotoPromptDirective('jp')
      // Must emphasize character persona integrity
      expect(jpDirective).toMatch(/キャラクター|口調|一人称|性格/)
      expect(jpDirective).toMatch(/維持|崩さ|忠実/)
    })

    it('maintains persona-first directive across all supported languages (en, kr, zh, tw)', () => {
      const enDirective = buildPhotoPromptDirective('en')
      expect(enDirective).toMatch(/in-character|persona|tone/i)

      const krDirective = buildPhotoPromptDirective('kr')
      expect(krDirective).toMatch(/캐릭터|말투|성격/)

      const zhDirective = buildPhotoPromptDirective('zh')
      expect(zhDirective).toMatch(/性格|语气|人设/)

      const twDirective = buildPhotoPromptDirective('tw')
      expect(twDirective).toMatch(/性格|語氣|人設/)
    })
  })

  describe('2. Pollinations 402 x402 Paywall & Turnstile Avoidance', () => {
    it('does not append nologo=true by default to avoid x402 payment protocol paywall', () => {
      const url = buildPollinationsUrl('masterpiece, 1girl, kakudate karin')
      // nologo=true triggers 402 Payment Required on Pollinations.ai!
      expect(url).not.toContain('nologo=true')
    })

    it('uses a safe, lightweight default resolution to avoid paywall and timeout limits', () => {
      const url = buildPollinationsUrl('masterpiece, 1girl, kakudate karin')
      // Safe resolution for free anonymous tier without triggering x402 limit
      expect(url).not.toContain('width=1024&height=1024&nologo=true')
    })
  })

  describe('3. 2D Anime Cel-Shaded Style Enforcement & Custom Anime Models (TDD)', () => {
    it('enforces 2D anime style, cel shading, and anime coloring in QUALITY_PROMPT_PREFIX to eliminate photorealism', async () => {
      const { QUALITY_PROMPT_PREFIX } = await import('@/assets/imageGen/promptSynthesizer')
      const prefixString = QUALITY_PROMPT_PREFIX.join(', ')
      expect(prefixString).toContain('2d anime illustration')
      expect(prefixString).toContain('cel shaded')
      expect(prefixString).toContain('anime coloring')
    })

    it('includes strict anti-photorealism tags in DEFAULT_NEGATIVE_PROMPT (photorealistic, realistic, 3d, render)', async () => {
      const { DEFAULT_NEGATIVE_PROMPT } = await import('@/assets/imageGen/promptSynthesizer')
      const negString = DEFAULT_NEGATIVE_PROMPT.join(', ')
      expect(negString).toContain('photorealistic')
      expect(negString).toContain('realistic')
      expect(negString).toContain('3d')
      expect(negString).toContain('render')
    })

    it('buildFalAiRequest supports custom anime-specialized models like fal-ai/illustrious and fal-ai/animagine-xl', async () => {
      const { buildFalAiRequest } = await import('@/assets/imageGen/providers/fal')
      const req = buildFalAiRequest('masterpiece, 1girl', 'test-key', { model: 'fal-ai/illustrious' })
      expect(req.url).toBe('https://fal.run/fal-ai/illustrious')
    })
  })
})
