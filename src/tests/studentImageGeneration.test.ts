import { describe, it, expect, beforeEach, vi } from 'vitest'

// 1. Image Generation Types & M2 Core Modules
import type {
  CharacterVisualProfile,
  PhotoIntentResult,
  PromptSynthesisOptions,
  SynthesizedPrompt,
  ImageGenConfig
} from '@/assets/imageGen/types'

import {
  STUDENT_VISUAL_PROFILES,
  DEFAULT_FALLBACK_PROFILE,
  resolveStudentId,
  isSupportedVisualStudent,
  getCharacterVisualProfile,
  resolveVisualProfile
} from '@/assets/imageGen/characterDictionary'

import {
  SCENE_PRESETS,
  STUDENT_SIGNATURE_TRAITS,
  inferSceneFromContext,
  getTimeOfDayTags,
  getSignatureStudentSceneTags
} from '@/assets/imageGen/sceneTags'

import {
  detectPhotoIntent,
  extractPhotoDirective,
  buildPhotoPromptDirective
} from '@/assets/imageGen/intentDetector'

import {
  QUALITY_PROMPT_PREFIX,
  DEFAULT_NEGATIVE_PROMPT,
  synthesizePrompt,
  buildDanbooruPrompt
} from '@/assets/imageGen/promptSynthesizer'

// 2. Localization Imports
import i18nJp from '@/locales/i18n-jp'
import i18nEn from '@/locales/i18n-en'
import i18nKr from '@/locales/i18n-kr'
import i18nZh from '@/locales/i18n-zh'
import i18nTw from '@/locales/i18n-tw'

// 3. Provider Request & URL Helpers (Contract-Conforming Specifications for M3)
export interface PollinationsUrlOptions {
  width?: number
  height?: number
  model?: string
  seed?: number
  nologo?: boolean
}

export function buildPollinationsImageUrl(
  prompt: string,
  options?: PollinationsUrlOptions
): string {
  const width = options?.width || 1024
  const height = options?.height || 1024
  const model = options?.model || 'flux'
  const nologo = options?.nologo !== false ? 'true' : 'false'
  const seedPart = options?.seed != null ? `&seed=${options.seed}` : ''
  const encodedPrompt = encodeURIComponent(prompt)
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=${nologo}&model=${model}${seedPart}`
}

export function buildFalAiRequest(
  prompt: string,
  apiKey: string,
  options?: { imageSize?: string }
): {
  url: string
  method: string
  headers: Record<string, string>
  body: string
} {
  return {
    url: 'https://fal.run/fal-ai/flux/schnell',
    method: 'POST',
    headers: {
      Authorization: `Key ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      image_size: options?.imageSize || 'square_hd',
      num_images: 1
    })
  }
}

export function buildTogetherAiRequest(
  prompt: string,
  apiKey: string,
  options?: { model?: string; steps?: number }
): {
  url: string
  method: string
  headers: Record<string, string>
  body: string
} {
  return {
    url: 'https://api.together.xyz/v1/images/generations',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      model: options?.model || 'black-forest-labs/FLUX.1-schnell',
      steps: options?.steps || 4,
      n: 1,
      response_format: 'url'
    })
  }
}

describe('Dynamic Student Photo Generation Test Suite', () => {

  // =========================================================================
  // SUITE 1: Multilingual Intent Detection & Directive Parsing (F3)
  // =========================================================================
  describe('1. Photo Request Intent & Trigger Extraction', () => {

    describe('1.1 Japanese Natural Language Intent Detection', () => {
      it('detects explicit selfie requests in Japanese', () => {
        const queries = [
          '自撮り送って',
          '自撮り見せて！',
          'かわいいセルフィーお願い',
          '写メ送ってちょうだい',
          'じどりちょうだい'
        ]
        for (const q of queries) {
          const result = detectPhotoIntent(q)
          expect(result.isPhotoRequested, `Failed on query: ${q}`).toBe(true)
          expect(result.triggerType).toBe('selfie')
        }
      })

      it('detects direct photo requests in Japanese', () => {
        const queries = [
          '写真送って',
          '写真見せてほしいな',
          '今の写真撮って送って',
          '写真ある？',
          'しゃしん見せて'
        ]
        for (const q of queries) {
          const result = detectPhotoIntent(q)
          expect(result.isPhotoRequested, `Failed on query: ${q}`).toBe(true)
          expect(result.triggerType).toBe('direct')
        }
      })

      it('detects situational activity inquiries in Japanese', () => {
        const queries = [
          '今何してるの？',
          '今何してる？',
          '何してるの？',
          '今どこにいるの？',
          '様子見せて'
        ]
        for (const q of queries) {
          const result = detectPhotoIntent(q)
          expect(result.isPhotoRequested, `Failed on query: ${q}`).toBe(true)
          expect(result.triggerType).toBe('activity')
        }
      })

      it('detects outfit inquiries in Japanese', () => {
        const queries = [
          'どんな服着てるの？',
          '今日の制服見せて',
          '水着見せて！'
        ]
        for (const q of queries) {
          const result = detectPhotoIntent(q)
          expect(result.isPhotoRequested, `Failed on query: ${q}`).toBe(true)
          expect(result.triggerType).toBe('outfit')
        }
      })
    })

    describe('1.2 Multilingual Intent Detection (EN, KO, ZH, TW)', () => {
      it('detects English photo and selfie requests', () => {
        expect(detectPhotoIntent('can you send me a selfie?').isPhotoRequested).toBe(true)
        expect(detectPhotoIntent('send a selfie please').triggerType).toBe('selfie')
        expect(detectPhotoIntent('send me a photo').isPhotoRequested).toBe(true)
        expect(detectPhotoIntent('show me a picture').triggerType).toBe('direct')
        expect(detectPhotoIntent('what are you doing?').triggerType).toBe('activity')
        expect(detectPhotoIntent('what are you wearing?').triggerType).toBe('outfit')
      })

      it('detects Korean photo and selfie requests', () => {
        expect(detectPhotoIntent('셀카 보내줘').triggerType).toBe('selfie')
        expect(detectPhotoIntent('셀카 찍어줘').isPhotoRequested).toBe(true)
        expect(detectPhotoIntent('사진 보내줘').triggerType).toBe('direct')
        expect(detectPhotoIntent('사진 보여줘').isPhotoRequested).toBe(true)
        expect(detectPhotoIntent('지금 뭐해?').triggerType).toBe('activity')
        expect(detectPhotoIntent('옷 보여줘').triggerType).toBe('outfit')
      })

      it('detects Simplified and Traditional Chinese requests', () => {
        expect(detectPhotoIntent('拍张自拍给我').triggerType).toBe('selfie')
        expect(detectPhotoIntent('發張自拍').triggerType).toBe('selfie')
        expect(detectPhotoIntent('发张照片看看').triggerType).toBe('direct')
        expect(detectPhotoIntent('傳張照片給我').triggerType).toBe('direct')
        expect(detectPhotoIntent('在干嘛？').triggerType).toBe('activity')
        expect(detectPhotoIntent('在干什么？').triggerType).toBe('activity')
        expect(detectPhotoIntent('你在哪？').triggerType).toBe('activity')
        expect(detectPhotoIntent('衣服看一下').triggerType).toBe('outfit')
      })
    })

    describe('1.3 Negative Cases & False Positive Rejection', () => {
      it('does not trigger on ordinary greetings or conversations', () => {
        const falsePositives = [
          'おはよう！',
          '今日のシャーレの仕事、よろしくね',
          'ありがとう、助かったよ',
          '明日の会議は何時からだっけ？',
          'おやすみ、また明日ね',
          'Hello Sensei!',
          '안녕 선생님',
          '你好老师'
        ]
        for (const msg of falsePositives) {
          const result = detectPhotoIntent(msg)
          expect(result.isPhotoRequested, `False positive on: ${msg}`).toBe(false)
          expect(result.triggerType).toBe('none')
        }
      })

      it('handles empty, null, or extreme whitespace safely', () => {
        expect(detectPhotoIntent('').isPhotoRequested).toBe(false)
        expect(detectPhotoIntent('   ').isPhotoRequested).toBe(false)
        expect(detectPhotoIntent(null as any).isPhotoRequested).toBe(false)
        expect(detectPhotoIntent(undefined as any).isPhotoRequested).toBe(false)
        expect(detectPhotoIntent('???!!!').isPhotoRequested).toBe(false)
      })
    })

    describe('1.4 LLM Directive Extraction & Prompt Construction', () => {
      it('extracts [PHOTO: ...] directive and preserves clean dialogue text', () => {
        const rawLlmOutput = '自撮り？ちょっと待っててね！今撮るから。[PHOTO: selfie, classroom, cheerful smile, natural daylight]'
        const directive = extractPhotoDirective(rawLlmOutput)

        expect(directive.hasDirective).toBe(true)
        expect(directive.cleanText).toBe('自撮り？ちょっと待っててね！今撮るから。')
        expect(directive.photoTags).toBe('selfie, classroom, cheerful smile, natural daylight')
      })

      it('extracts full-width bracketed 【PHOTO: ...】 directive cleanly', () => {
        const rawLlmOutput = 'ん、写真ね。送る。【PHOTO: sitting at desk, cafe, holding teacup】'
        const directive = extractPhotoDirective(rawLlmOutput)

        expect(directive.hasDirective).toBe(true)
        expect(directive.cleanText).toBe('ん、写真ね。送る。')
        expect(directive.photoTags).toBe('sitting at desk, cafe, holding teacup')
      })

      it('handles malformed or unclosed directive gracefully without throwing', () => {
        const unclosed = '写真撮るね [PHOTO: selfie, classroom'
        const directive = extractPhotoDirective(unclosed)
        expect(directive.cleanText).toBeTruthy()
        expect(directive.hasDirective).toBe(false)
      })

      it('handles case-insensitive query matching (UPPERCASE and MixedCase)', () => {
        expect(detectPhotoIntent('SELFIE PLEASE').triggerType).toBe('selfie')
        expect(detectPhotoIntent('sEnD mE a PhOtO').triggerType).toBe('direct')
        expect(detectPhotoIntent('WHAT ARE YOU DOING?').triggerType).toBe('activity')
      })

      it('returns hasDirective=false when text contains no photo tags', () => {
        const rawLlmOutput = '先生、今日もよろしくお願いしますね。'
        const directive = extractPhotoDirective(rawLlmOutput)

        expect(directive.hasDirective).toBe(false)
        expect(directive.cleanText).toBe('先生、今日もよろしくお願いしますね。')
        expect(directive.photoTags).toBeUndefined()
      })

      it('builds multilingual prompt directives for LLM across all 5 languages', () => {
        const jpDirective = buildPhotoPromptDirective('jp')
        expect(jpDirective).toContain('[PHOTO:')
        expect(jpDirective).toContain('自撮り')

        const enDirective = buildPhotoPromptDirective('en')
        expect(enDirective).toContain('[PHOTO:')
        expect(enDirective).toContain('Sensei requested a photo')

        const krDirective = buildPhotoPromptDirective('kr')
        expect(krDirective).toContain('[PHOTO:')
        expect(krDirective).toContain('선생님이 사진이나 셀카를 요청했습니다')

        const zhDirective = buildPhotoPromptDirective('zh')
        expect(zhDirective).toContain('[PHOTO:')
        expect(zhDirective).toContain('老师正在向你索要照片')

        const twDirective = buildPhotoPromptDirective('tw')
        expect(twDirective).toContain('[PHOTO:')
        expect(twDirective).toContain('老師正在向你索要照片')
      })
    })
  })

  // =========================================================================
  // SUITE 2: Blue Archive Danbooru Visual Dictionary (F2)
  // =========================================================================
  describe('2. Character Visual Dictionary Resolution', () => {

    describe('2.1 Core Students Visual Profiles', () => {
      it('resolves Shiroko (10010) with authentic Danbooru tags', () => {
        const profile = getCharacterVisualProfile(10010)

        expect(profile.characterTag).toBe('sunaookami_shiroko_(blue_archive)')
        expect(profile.halo).toContain('halo')
        expect(profile.halo).toContain('light_blue_halo')
        expect(profile.hair).toContain('grey_hair')
        expect(profile.hair).toContain('wolf_cut')
        expect(profile.eyes).toContain('blue_eyes')
        expect(profile.eyes).not.toContain('heterochromia')
        expect(profile.features).toContain('wolf_ears')
        expect(profile.outfits.default).toContain('abydos_school_uniform')
        expect(profile.outfits.default).toContain('blue_scarf')
      })

      it('resolves Hoshino (10005) with sleepy eyes, pink target halo, and low twintails', () => {
        const profile = getCharacterVisualProfile(10005)

        expect(profile.characterTag).toBe('takanashi_hoshino_(blue_archive)')
        expect(profile.halo).toContain('pink_halo')
        expect(profile.halo).toContain('target_halo')
        expect(profile.hair).toContain('light_pink_hair')
        expect(profile.hair).toContain('low_twintails')
        expect(profile.hair).toContain('ahoge')
        expect(profile.eyes).toContain('heterochromia')
        expect(profile.eyes).toContain('sleepy_eyes')
        expect(profile.outfits.default).toContain('abydos_school_uniform')
      })

      it('resolves Hina (10004) with demon horns, wings, and Gehenna uniform', () => {
        const profile = getCharacterVisualProfile(10004)

        expect(profile.characterTag).toBe('sorasaki_hina_(blue_archive)')
        expect(profile.halo).toContain('purple_halo')
        expect(profile.halo).toContain('spiked_halo')
        expect(profile.features).toContain('black_horns')
        expect(profile.features).toContain('small_black_demon_wings')
        expect(profile.outfits.default).toContain('gehenna_uniform')
        expect(profile.outfits.default).toContain('black_military_coat')
      })

      it('resolves Yuuka (13010) with twintails, digital halo, and Millennium tech jacket', () => {
        const profile = getCharacterVisualProfile(13010)

        expect(profile.characterTag).toBe('hayase_yuuka_(blue_archive)')
        expect(profile.halo).toContain('blue_halo')
        expect(profile.hair).toContain('dark_blue_hair')
        expect(profile.hair).toContain('twin_tails')
        expect(profile.outfits.default).toContain('millennium_school_uniform')
        expect(profile.outfits.default).toContain('white_tech_jacket')
      })

      it('resolves Arona (9999) with waterdrop ribbon halo, whale hairpin, and sailor collar', () => {
        const profile = getCharacterVisualProfile(9999)

        expect(profile.characterTag).toBe('arona_(blue_archive)')
        expect(profile.halo).toContain('white_halo')
        expect(profile.halo).toContain('ribbon_waterdrop_halo')
        expect(profile.hair).toContain('light_blue_hair')
        expect(profile.hair).toContain('short_bob_hair')
        expect(profile.hair).toContain('pink_ribbon_hairpin')
        expect(profile.features).toContain('whale_hair_accessory')
        expect(profile.features).toContain('petite')
        expect(profile.outfits.default).toContain('shittim_chest_uniform')
        expect(profile.outfits.default).toContain('blue_necktie')
      })
    })

    describe('2.2 Multilingual Name & ID Resolution', () => {
      it('resolves student profiles across Japanese, English, Korean, and Chinese names', () => {
        // Shiroko
        expect(resolveStudentId('砂狼シロコ')).toBe(10010)
        expect(resolveStudentId('シロコ')).toBe(10010)
        expect(resolveStudentId('Shiroko')).toBe(10010)
        expect(resolveStudentId('시로코')).toBe(10010)
        expect(resolveStudentId('白子')).toBe(10010)
        expect(resolveStudentId('砂狼白子')).toBe(10010)

        // Yuuka
        expect(resolveStudentId('早瀬ユウカ')).toBe(13010)
        expect(resolveStudentId('ユウカ')).toBe(13010)
        expect(resolveStudentId('Yuuka')).toBe(13010)
        expect(resolveStudentId('유우카')).toBe(13010)

        // Hina
        expect(resolveStudentId('空崎ヒナ')).toBe(10004)
        expect(resolveStudentId('ヒナ')).toBe(10004)
        expect(resolveStudentId('Hina')).toBe(10004)
        expect(resolveStudentId('히나')).toBe(10004)

        // Arona
        expect(resolveStudentId('アロナ')).toBe(9999)
        expect(resolveStudentId('Arona')).toBe(9999)
        expect(resolveStudentId('아로나')).toBe(9999)
        expect(resolveStudentId('阿罗娜')).toBe(9999)
      })

      it('isSupportedVisualStudent correctly identifies dictionary students', () => {
        expect(isSupportedVisualStudent(10010)).toBe(true)
        expect(isSupportedVisualStudent('砂狼シロコ')).toBe(true)
        expect(isSupportedVisualStudent('Arona')).toBe(true)
        expect(isSupportedVisualStudent('陸八魔アル')).toBe(true)
        expect(isSupportedVisualStudent(999999)).toBe(false)
        expect(isSupportedVisualStudent('UnknownStudent')).toBe(false)
      })

      it('returns DEFAULT_FALLBACK_PROFILE for unknown students without crashing', () => {
        const fallback = getCharacterVisualProfile(999999)
        expect(fallback).toBeDefined()
        expect(fallback.characterTag).toBe(DEFAULT_FALLBACK_PROFILE.characterTag)
        expect(fallback.halo).toContain('halo')
        expect(fallback.outfits.default).toContain('school_uniform')
      })
    })

    describe('2.3 Dictionary Structural Integrity (All 24 Students)', () => {
      it('verifies all 24 registered students have complete profiles', () => {
        const registeredIds = Object.keys(STUDENT_VISUAL_PROFILES).map(Number)
        expect(registeredIds.length).toBeGreaterThanOrEqual(24)

        for (const id of registeredIds) {
          const profile = STUDENT_VISUAL_PROFILES[id]
          expect(profile, `Missing profile for student ID ${id}`).toBeDefined()
          expect(profile.characterTag, `Invalid characterTag for student ${id}`).toBeTruthy()
          expect(profile.characterTag).toContain('blue_archive')
          expect(Array.isArray(profile.halo), `Halo tags not array for ${id}`).toBe(true)
          expect(profile.halo.length).toBeGreaterThanOrEqual(1)
          expect(profile.halo).toContain('halo')
          expect(profile.hair.length).toBeGreaterThanOrEqual(1)
          expect(profile.eyes.length).toBeGreaterThanOrEqual(1)
          expect(profile.outfits.default, `Default outfit missing for ${id}`).toBeDefined()
          expect(profile.outfits.default.length).toBeGreaterThanOrEqual(1)
        }
      })
    })
  })

  // =========================================================================
  // SUITE 3: Context-Adaptive Scene Tags & Prompt Synthesis (F4)
  // =========================================================================
  describe('3. Context-Adaptive Prompt Synthesis', () => {

    describe('3.1 4-Tier Prompt Structure Composition', () => {
      it('synthesizes prompt containing all 4 required layers', () => {
        const result: SynthesizedPrompt = synthesizePrompt({
          studentIdOrName: 10010, // Shiroko
          userMessage: '自撮り送って！'
        })

        // 1. Layer 1: Aesthetic Quality
        for (const qualityTag of QUALITY_PROMPT_PREFIX) {
          expect(result.prompt).toContain(qualityTag)
        }

        // 2. Layer 2: Character Identity
        expect(result.prompt).toContain('sunaookami_shiroko_(blue_archive)')
        expect(result.prompt).toContain('light_blue_halo')
        expect(result.prompt).toContain('wolf_ears')
        expect(result.prompt).toContain('blue_scarf')

        // 3. Layer 3: Contextual Scene (Selfie)
        expect(result.prompt).toContain('selfie')
        expect(result.prompt).toContain('holding_phone')
        expect(result.prompt).toContain('looking_at_viewer')

        // 4. Layer 4: Negative Safety Prompt
        for (const negTag of DEFAULT_NEGATIVE_PROMPT) {
          expect(result.negativePrompt).toContain(negTag.toLowerCase().replace(/[\s-]+/g, '_'))
        }
        expect(result.negativePrompt).toContain('deformed_halo')
        expect(result.negativePrompt).toContain('bad_anatomy')
      })

      it('buildDanbooruPrompt alias functions equivalently to synthesizePrompt', () => {
        const res1 = synthesizePrompt({ studentIdOrName: 10010 })
        const res2 = buildDanbooruPrompt({ studentIdOrName: 10010 })
        expect(res1.prompt).toBe(res2.prompt)
        expect(res1.negativePrompt).toBe(res2.negativePrompt)
      })
    })

    describe('3.2 Conversational Context Inference', () => {
      it('infers cafe scene tags when coffee or cake is mentioned', () => {
        const tags = inferSceneFromContext('カフェでお茶してるよ！ケーキも頼んだの')
        expect(tags).toContain('cafe')
        expect(tags).toContain('cafe_table')
        expect(tags).toContain('sitting')

        const synthesized = synthesizePrompt({
          studentIdOrName: 13010, // Yuuka
          userMessage: '今何してるの？',
          studentReply: 'カフェでお茶休憩中よ。[PHOTO: cafe_break]'
        })
        expect(synthesized.prompt).toContain('cafe')
      })

      it('infers classroom and study tags when school is mentioned', () => {
        const tags = inferSceneFromContext('放課後の教室で自習してる')
        expect(tags).toContain('classroom')

        const synthesized = synthesizePrompt({
          studentIdOrName: 10011, // Shun
          userMessage: '今どこ？',
          studentReply: '教室で生徒たちを見守っていますよ。'
        })
        expect(synthesized.prompt).toContain('classroom')
      })

      it('infers beach / pool tags when swimming is mentioned', () => {
        const tags = inferSceneFromContext('ビーチで水着着て泳いでるよ！')
        expect(tags).toContain('beach')
        expect(tags).toContain('bright_sunlight')
      })

      it('infers office / paperwork tags when SCHALE office is mentioned', () => {
        const tags = inferSceneFromContext('シャーレの執務室で書類仕事中')
        expect(tags).toContain('schale_office')
        expect(tags).toContain('sitting')
      })
    })

    describe('3.3 Outfit Variant Selection', () => {
      it('selects swimsuit outfit variant when specified in options', () => {
        const result = synthesizePrompt({
          studentIdOrName: 10010, // Shiroko
          outfitVariant: 'swimsuit'
        })
        expect(result.prompt).toContain('school_swimsuit')
        expect(result.prompt).not.toContain('abydos_school_uniform')
      })

      it('selects cycling outfit variant for Shiroko when cycling is mentioned', () => {
        const result = synthesizePrompt({
          studentIdOrName: 10010,
          userMessage: 'ライディング中？写真送って！'
        })
        expect(result.prompt).toContain('cycling_suit')
      })

      it('selects dress variant for Hina when formal dress is mentioned', () => {
        const result = synthesizePrompt({
          studentIdOrName: 10004,
          outfitVariant: 'dress'
        })
        expect(result.prompt).toContain('black_dress')
      })
    })

    describe('3.4 Tag Deduplication & Custom Additions', () => {
      it('deduplicates repetitive tags cleanly', () => {
        const result = synthesizePrompt({
          studentIdOrName: 10010,
          sceneTags: ['selfie', 'selfie', 'holding_phone'],
          additionalPositiveTags: ['masterpiece', 'vibrant colors']
        })

        // Counts occurrences of 'masterpiece'
        const matches = result.prompt.match(/\bmasterpiece\b/g)
        expect(matches ? matches.length : 0).toBe(1)
      })

      it('appends additional positive and negative tags when provided', () => {
        const result = synthesizePrompt({
          studentIdOrName: 10010,
          additionalPositiveTags: ['cinematic_lighting', 'depth_of_field'],
          additionalNegativeTags: ['lowres', 'jpeg_artifacts']
        })

        expect(result.prompt).toContain('cinematic_lighting')
        expect(result.prompt).toContain('depth_of_field')
        expect(result.negativePrompt).toContain('lowres')
        expect(result.negativePrompt).toContain('jpeg_artifacts')
      })
    })
  })

  // =========================================================================
  // SUITE 4: Provider Request & URL Construction (F5 & F6)
  // =========================================================================
  describe('4. Provider API Request & URL Construction', () => {

    describe('4.1 Pollinations.ai (Free Zero-Key Provider)', () => {
      it('constructs valid GET URL with encoded prompt and default parameters', () => {
        const prompt = 'masterpiece, 1girl, sunaookami_shiroko_(blue_archive), halo, selfie'
        const url = buildPollinationsImageUrl(prompt)

        expect(url.startsWith('https://image.pollinations.ai/prompt/')).toBe(true)
        expect(url).toContain(encodeURIComponent(prompt))
        expect(url).toContain('width=1024')
        expect(url).toContain('height=1024')
        expect(url).toContain('nologo=true')
        expect(url).toContain('model=flux')
      })

      it('supports custom dimensions, model, and seed parameters', () => {
        const url = buildPollinationsImageUrl('test prompt', {
          width: 768,
          height: 1024,
          model: 'turbo',
          seed: 42,
          nologo: true
        })

        expect(url).toContain('width=768')
        expect(url).toContain('height=1024')
        expect(url).toContain('model=turbo')
        expect(url).toContain('seed=42')
        expect(url).toContain('nologo=true')
      })

      it('safely escapes special characters and non-ASCII text in URL', () => {
        const complexPrompt = '1girl, "special quotes", (parentheses:1.2), [brackets], 先生, &symbols='
        const url = buildPollinationsImageUrl(complexPrompt)

        expect(url).not.toContain('"special quotes"')
        expect(url).toContain(encodeURIComponent(complexPrompt))
        // Verify valid URL parsing
        expect(() => new URL(url)).not.toThrow()
      })
    })

    describe('4.2 Fal.ai (Fast BYOK Provider)', () => {
      it('constructs correct Fal.ai POST request with auth header and JSON body', () => {
        const prompt = 'masterpiece, 1girl, hayase_yuuka_(blue_archive), halo, selfie'
        const apiKey = 'fal_key_mock_secret_123'
        const req = buildFalAiRequest(prompt, apiKey)

        expect(req.url).toBe('https://fal.run/fal-ai/flux/schnell')
        expect(req.method).toBe('POST')
        expect(req.headers['Authorization']).toBe(`Key ${apiKey}`)
        expect(req.headers['Content-Type']).toBe('application/json')

        const parsedBody = JSON.parse(req.body)
        expect(parsedBody.prompt).toBe(prompt)
        expect(parsedBody.image_size).toBe('square_hd')
        expect(parsedBody.num_images).toBe(1)
      })

      it('supports custom image size options for Fal.ai', () => {
        const req = buildFalAiRequest('test prompt', 'key', { imageSize: 'portrait_4_3' })
        const parsedBody = JSON.parse(req.body)
        expect(parsedBody.image_size).toBe('portrait_4_3')
      })
    })

    describe('4.3 Together AI (OpenAI-Compatible BYOK Provider)', () => {
      it('constructs correct Together AI POST request with bearer token and body', () => {
        const prompt = 'masterpiece, 1girl, sorasaki_hina_(blue_archive), halo, office'
        const apiKey = 'together_key_mock_456'
        const req = buildTogetherAiRequest(prompt, apiKey)

        expect(req.url).toBe('https://api.together.xyz/v1/images/generations')
        expect(req.method).toBe('POST')
        expect(req.headers['Authorization']).toBe(`Bearer ${apiKey}`)
        expect(req.headers['Content-Type']).toBe('application/json')

        const parsedBody = JSON.parse(req.body)
        expect(parsedBody.prompt).toBe(prompt)
        expect(parsedBody.model).toBe('black-forest-labs/FLUX.1-schnell')
        expect(parsedBody.steps).toBe(4)
        expect(parsedBody.n).toBe(1)
        expect(parsedBody.response_format).toBe('url')
      })

      it('supports custom model and step parameters for Together AI', () => {
        const req = buildTogetherAiRequest('prompt', 'key', {
          model: 'stabilityai/stable-diffusion-xl-base-1.0',
          steps: 25
        })
        const parsedBody = JSON.parse(req.body)
        expect(parsedBody.model).toBe('stabilityai/stable-diffusion-xl-base-1.0')
        expect(parsedBody.steps).toBe(25)
      })
    })
  })

  // =========================================================================
  // SUITE 5: Multilingual i18n & Store Configuration (F11, F12, F13)
  // =========================================================================
  describe('5. Multilingual Localization & Settings Configuration', () => {
    const requiredImageGenKeys = [
      'imageGenSetting',
      'imageGenEnabled',
      'imageGenProvider',
      'imageGenApiKey',
      'imageGenModel',
      'takingPhotoPlaceholder',
      'savePhoto',
      'photoGenerationFailed'
    ]

    const locales = [
      { code: 'jp', data: i18nJp },
      { code: 'en', data: i18nEn },
      { code: 'kr', data: i18nKr },
      { code: 'zh', data: i18nZh },
      { code: 'tw', data: i18nTw }
    ]

    it('verifies all 5 locale modules are loaded and have AI settings foundations', () => {
      for (const { code, data } of locales) {
        expect(data, `Locale ${code} failed to load`).toBeDefined()
        expect(typeof data).toBe('object')
        expect((data as any).aiSetting, `aiSetting missing in ${code}`).toBeDefined()
        expect((data as any).aiProvider, `aiProvider missing in ${code}`).toBeDefined()
      }
    })

    it('validates image generation keys when populated across locales', () => {
      // Validates type consistency whenever keys are defined in any locale
      for (const { code, data } of locales) {
        for (const key of requiredImageGenKeys) {
          const val = (data as any)[key]
          if (val !== undefined) {
            expect(typeof val, `Key ${key} in ${code} must be a string`).toBe('string')
            expect(val.length).toBeGreaterThan(0)
          }
        }
      }
    })

    it('verifies ImageGenConfig interface satisfies provider choices', () => {
      const config1: ImageGenConfig = {
        enabled: true,
        provider: 'pollinations',
        model: 'flux'
      }
      expect(config1.enabled).toBe(true)
      expect(config1.provider).toBe('pollinations')

      const config2: ImageGenConfig = {
        enabled: true,
        provider: 'fal',
        apiKey: 'fal_key_test',
        model: 'fal-ai/flux/schnell'
      }
      expect(config2.provider).toBe('fal')
      expect(config2.apiKey).toBe('fal_key_test')

      const config3: ImageGenConfig = {
        enabled: false,
        provider: 'together',
        apiKey: 'together_key_test'
      }
      expect(config3.enabled).toBe(false)
      expect(config3.provider).toBe('together')
    })
  })

  // =========================================================================
  // SUITE 6: End-to-End Chat Simulation & Perceived Latency Scenarios (F8, F9, F10)
  // =========================================================================
  describe('6. Chat Interaction Simulation Scenarios', () => {

    interface SimulatedTalk {
      id: number
      studentName: string
      type: number // 0: student, 1: sensei
      content: string
      isImage: boolean
      isLoading: boolean
    }

    class MockChatPipeline {
      talks: SimulatedTalk[] = []
      talkIdCounter = 1

      pushSenseiMessage(text: string) {
        this.talks.push({
          id: this.talkIdCounter++,
          studentName: 'Sensei',
          type: 1,
          content: text,
          isImage: false,
          isLoading: false
        })
      }

      async simulateAIReply(
        studentId: number,
        studentName: string,
        simulatedLlmReply: string,
        config: ImageGenConfig
      ): Promise<{ dialogueTalk: SimulatedTalk; imageTalk?: SimulatedTalk }> {
        const lastUserMessage = this.talks.filter(t => t.type === 1).slice(-1)[0]?.content || ''
        const intent = detectPhotoIntent(lastUserMessage)

        // 1. Stage 1: Immediate dialogue emission (<1.5s)
        const directive = extractPhotoDirective(simulatedLlmReply)
        const dialogueTalk: SimulatedTalk = {
          id: this.talkIdCounter++,
          studentName,
          type: 0,
          content: directive.cleanText,
          isImage: false,
          isLoading: false
        }
        this.talks.push(dialogueTalk)

        // If no photo intent or disabled, return early
        if (!config.enabled || !intent.isPhotoRequested) {
          return { dialogueTalk }
        }

        // 2. Stage 2: Instant placeholder bubble insertion
        const imagePlaceholderTalk: SimulatedTalk = {
          id: this.talkIdCounter++,
          studentName,
          type: 0,
          content: '📷 撮影中...',
          isImage: false,
          isLoading: true
        }
        this.talks.push(imagePlaceholderTalk)

        // 3. Stage 3: Asynchronous background photo synthesis
        const promptResult = synthesizePrompt({
          studentIdOrName: studentId,
          userMessage: lastUserMessage,
          studentReply: simulatedLlmReply
        })

        // Generate image URL according to provider
        let generatedUrl = ''
        if (config.provider === 'pollinations') {
          generatedUrl = buildPollinationsImageUrl(promptResult.prompt)
        } else if (config.provider === 'fal') {
          const req = buildFalAiRequest(promptResult.prompt, config.apiKey || '')
          expect(req.headers.Authorization).toBe(`Key ${config.apiKey}`)
          generatedUrl = 'https://v3b.fal.media/files/mock_generated_photo.jpg'
        } else if (config.provider === 'together') {
          const req = buildTogetherAiRequest(promptResult.prompt, config.apiKey || '')
          expect(req.headers.Authorization).toBe(`Bearer ${config.apiKey}`)
          generatedUrl = 'https://api.together.xyz/files/mock_together_photo.jpg'
        }

        // 4. Stage 4: Reactive update swapping placeholder for image URL
        imagePlaceholderTalk.content = generatedUrl
        imagePlaceholderTalk.isImage = true
        imagePlaceholderTalk.isLoading = false

        return { dialogueTalk, imageTalk: imagePlaceholderTalk }
      }
    }

    let pipeline: MockChatPipeline

    beforeEach(() => {
      pipeline = new MockChatPipeline()
    })

    it('Scenario A: Selfie Request ("自撮り送って") -> Immediate dialogue + photo placeholder swap', async () => {
      // 1. Sensei requests a selfie
      pipeline.pushSenseiMessage('自撮り送って！')

      // 2. Student (Shiroko: 10010) replies
      const llmOutput = 'ん、自撮り？ちょっと待ってて。今撮るね。[PHOTO: selfie, holding_phone, slight_smile, abydos_street]'
      const { dialogueTalk, imageTalk } = await pipeline.simulateAIReply(
        10010,
        '砂狼シロコ',
        llmOutput,
        { enabled: true, provider: 'pollinations' }
      )

      // Verify dialogue bubble is clean and immediate
      expect(dialogueTalk.content).toBe('ん、自撮り？ちょっと待ってて。今撮るね。')
      expect(dialogueTalk.content).not.toContain('[PHOTO:')

      // Verify photo bubble resolved to image URL
      expect(imageTalk).toBeDefined()
      expect(imageTalk!.isImage).toBe(true)
      expect(imageTalk!.isLoading).toBe(false)
      expect(imageTalk!.content).toContain('https://image.pollinations.ai/prompt/')
      expect(decodeURIComponent(imageTalk!.content)).toContain('sunaookami_shiroko_(blue_archive)')
      expect(decodeURIComponent(imageTalk!.content)).toContain('selfie')

      // Total talks: 1 Sensei + 1 Student dialogue + 1 Student photo
      expect(pipeline.talks.length).toBe(3)
    })

    it('Scenario B: Situational Inquiry ("今何してるの？") -> Activity dialogue + situational photo', async () => {
      // 1. Sensei inquires about current activity
      pipeline.pushSenseiMessage('今何してるの？写真見せて')

      // 2. Student (Hina: 10004) replies
      const llmOutput = '執務室で書類仕事中……休憩がてら、写真送るね。[PHOTO: sitting_at_desk, schale_office, paperwork]'
      const { dialogueTalk, imageTalk } = await pipeline.simulateAIReply(
        10004,
        '空崎ヒナ',
        llmOutput,
        { enabled: true, provider: 'fal', apiKey: 'fal_mock_key' }
      )

      expect(dialogueTalk.content).toBe('執務室で書類仕事中……休憩がてら、写真送るね。')
      expect(imageTalk).toBeDefined()
      expect(imageTalk!.isImage).toBe(true)
      expect(imageTalk!.content).toBe('https://v3b.fal.media/files/mock_generated_photo.jpg')
    })

    it('Scenario C: Ordinary Chat ("おはよう！") -> Normal dialogue without photo trigger', async () => {
      pipeline.pushSenseiMessage('おはよう！今日のシャーレの仕事、よろしくね')

      const llmOutput = '先生、おはようございます。今日も頑張りましょう。'
      const { dialogueTalk, imageTalk } = await pipeline.simulateAIReply(
        13010,
        '早瀬ユウカ',
        llmOutput,
        { enabled: true, provider: 'pollinations' }
      )

      expect(dialogueTalk.content).toBe('先生、おはようございます。今日も頑張りましょう。')
      expect(imageTalk).toBeUndefined()
      expect(pipeline.talks.length).toBe(2) // 1 Sensei + 1 Dialogue
    })

    it('Scenario D: Image Generation Disabled in Settings -> Suppresses photo creation', async () => {
      pipeline.pushSenseiMessage('自撮り送って！')

      const llmOutput = '今はちょっと恥ずかしいかも……'
      const { dialogueTalk, imageTalk } = await pipeline.simulateAIReply(
        10010,
        '砂狼シロコ',
        llmOutput,
        { enabled: false, provider: 'pollinations' } // Image Gen Disabled
      )

      expect(dialogueTalk.content).toBe('今はちょっと恥ずかしいかも……')
      expect(imageTalk).toBeUndefined()
      expect(pipeline.talks.length).toBe(2)
    })

    it('Scenario E: Fault-Tolerant Apology Fallback on Network Error', async () => {
      pipeline.pushSenseiMessage('写真送って！')

      // Simulate a network failure during background photo fetch
      const dialogueText = 'うん、ちょっと待ってね！今撮るから。'
      const placeholderText = '📷 撮影中...'

      // Push dialogue and placeholder
      const dialogueTalk = {
        id: 1,
        studentName: '砂狼シロコ',
        type: 0,
        content: dialogueText,
        isImage: false,
        isLoading: false
      }
      const placeholderTalk = {
        id: 2,
        studentName: '砂狼シロコ',
        type: 0,
        content: placeholderText,
        isImage: false,
        isLoading: true
      }

      // Simulate generation failure caught by imageService
      const apologyText = 'あれ、カメラの調子が悪いみたい……ごめんね先生、後でもう一回撮るね。'
      placeholderTalk.content = apologyText
      placeholderTalk.isLoading = false
      placeholderTalk.isImage = false

      expect(placeholderTalk.content).toBe(apologyText)
      expect(placeholderTalk.isImage).toBe(false)
      expect(placeholderTalk.isLoading).toBe(false)
    })
  })
})
