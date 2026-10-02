/**
 * Central Orchestration Service for MomoTalk Dynamic Student Photo Generation.
 * Manages 4-layer prompt synthesis, multi-provider routing (Pollinations / Fal.ai / Together AI),
 * graceful fallback hierarchies, 15-second timeouts, and student-specific apology messages.
 */

import type { ImageGenConfig, PromptSynthesisOptions } from './types'
import { resolveStudentId } from './characterDictionary'
import { synthesizePrompt } from './promptSynthesizer'
import {
  generatePollinationsImage,
  generateFalImage,
  generateTogetherImage,
  generateOpenAiImage,
  generateStabilityImage,
  checkStabilityBalance
} from './providers'

export const DEFAULT_PHOTO_TIMEOUT_MS = 15000

export interface GeneratePhotoContext {
  userMessage: string
  studentReplyText?: string
  sceneTags?: string[]
  outfitVariant?: string
  locale?: string
  timeoutMs?: number
  signal?: AbortSignal
}

/**
 * Returns character-appropriate student apology text when photo generation fails.
 *
 * @param studentIdOrName Numeric student ID, English canonical name, or Japanese name
 * @param locale Target user locale ('jp' | 'en' | 'kr' | 'zh' | 'tw')
 */
export function getStudentApologyMessage(
  studentIdOrName?: string | number,
  locale: string = 'jp'
): string {
  const normLocale = (locale || 'jp').toLowerCase()

  if (normLocale === 'en') {
    return "Oh no, seems my camera is acting up... Sorry Sensei, I'll take another one for you later!"
  }
  if (normLocale === 'kr') {
    return "어라, 카메라 상태가 안 좋은 것 같아요…… 죄송해요 선생님, 나중에 다시 찍어 드릴게요."
  }
  if (normLocale === 'zh') {
    return "哎呀，相机好像出故障了……对不起老师，稍后我再给您拍一张吧。"
  }
  if (normLocale === 'tw') {
    return "哎呀，相機好像壞掉了……對不起老師，稍後我再重拍一張給您。"
  }

  // Japanese student-specific personality tones
  const studentId = studentIdOrName != null ? resolveStudentId(studentIdOrName) : null
  switch (studentId) {
    case 10010: // Shiroko
      return '「ん、カメラの調子が悪いみたい……ごめんね先生、後でもう一回撮るね。」'
    case 10005: // Hoshino
      return '「うへ〜、カメラの調子が悪いみたいだねぇ……ごめんね先生、後でもう一回撮るよ〜」'
    case 10004: // Hina
      return '「……カメラの調子が悪いみたい。ごめんなさい先生、また後で撮り直すから。」'
    case 13010: // Yuuka
      return '「あれ、カメラの調子が悪いみたい……？もう、先生、また後で撮り直しますからね！」'
    case 9999: // Arona
      return '「先生！カメラの調子が悪いみたいです……ごめんなさい、後でもう一度撮りますね！」'
    default:
      return 'ごめんね先生、ちょっとカメラの調子が悪いみたい……また後で撮るね！'
  }
}

/**
 * Evaluates whether a given string is a valid photo URL (Pollinations, Fal CDN, Together CDN, or standard image).
 */
export function isPhotoUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()

  // Inline data URI or object URL
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('blob:')) {
    return true
  }

  // Pollinations.ai image endpoint
  if (/^https?:\/\/image\.pollinations\.ai\/prompt\//i.test(trimmed)) {
    return true
  }

  // Standard web image file extensions
  if (/^https?:\/\/.*\.(jpe?g|png|webp|gif|svg|bmp)($|\?)/i.test(trimmed)) {
    return true
  }

  // Fal.ai / Together AI CDN endpoints
  if (/^https?:\/\/(.*\.fal\.media|fal\.run|.*\.together\.xyz|api\.together\.ai)\//i.test(trimmed)) {
    return true
  }

  return false
}

/**
 * Evaluates whether a chat message content represents a failed photo attempt or camera apology.
 */
export function isPhotoFailed(content: string): boolean {
  if (!content || typeof content !== 'string') return false
  if (isPhotoUrl(content)) return false
  if (content === '[SHOOTING_PHOTO]' || content === '📷 撮影中...') return false

  const failureKeywords = [
    'カメラの調子',
    'camera is acting up',
    '카메라 상태',
    '相机好像出故障',
    '相機好像壞掉',
    'ごめんね先生',
    'ごめんなさい先生',
    '後でもう一回撮るね',
    'また後で撮るね',
    '撮り直す',
    '[PHOTO_FAILED]'
  ]
  return failureKeywords.some(kw => content.includes(kw))
}

/**
 * Main orchestration entrypoint to generate a dynamic student photo for chat.
 *
 * Flow:
 * 1. Checks if photo generation is enabled. Returns null if disabled.
 * 2. Synthesizes a 4-tier Danbooru prompt (Quality, Character Identity, Contextual Scene, Negative).
 * 3. Dispatches async fetch to selected provider with a 15-second timeout.
 * 4. Gracefully falls back from BYOK providers (Fal/Together) to Pollinations on missing key or API failure.
 * 5. If all generation fails or times out, returns an in-character student apology message.
 *
 * @param studentIdOrName Student numeric ID or name string
 * @param context Conversation context and optional scene tags
 * @param config User image generation settings
 * @returns Resolved photo URL, student apology string, or null if generation is disabled
 */
export async function generateStudentPhoto(
  studentIdOrName: string | number,
  context: GeneratePhotoContext | string,
  config: ImageGenConfig
): Promise<string | null> {
  // If disabled in settings, return null
  if (!config || !config.enabled) {
    return null
  }

  const ctx: GeneratePhotoContext =
    typeof context === 'string' ? { userMessage: context } : context || { userMessage: '' }

  const timeoutMs = ctx.timeoutMs ?? DEFAULT_PHOTO_TIMEOUT_MS
  const controller = new AbortController()

  // Link caller signal if provided
  if (ctx.signal) {
    if (ctx.signal.aborted) {
      controller.abort(ctx.signal.reason)
    } else {
      ctx.signal.addEventListener('abort', () => controller.abort(ctx.signal?.reason), { once: true })
    }
  }

  let timeoutTimer: ReturnType<typeof setTimeout> | undefined
  timeoutTimer = setTimeout(() => {
    controller.abort(new DOMException(`Image generation timed out after ${timeoutMs}ms`, 'TimeoutError'))
  }, timeoutMs)

  try {
    // 1. Synthesize 4-tier Danbooru prompt
    const promptOptions: PromptSynthesisOptions = {
      studentIdOrName,
      userMessage: ctx.userMessage,
      studentReply: ctx.studentReplyText,
      sceneTags: ctx.sceneTags,
      outfitVariant: ctx.outfitVariant,
      locale: ctx.locale
    }
    const synthesized = synthesizePrompt(promptOptions)
    const prompt = synthesized.prompt

    // 2. Route to provider with multi-tiered resilience fallback
    const provider = config.provider || 'pollinations'
    let imageUrl: string

    if (provider === 'fal') {
      const apiKey = typeof config.apiKey === 'string' ? config.apiKey.trim() : ''
      if (!apiKey) {
        console.warn('[ImageService] Fal.ai API key is missing. Gracefully falling back to Pollinations.ai.')
        try {
          imageUrl = await generatePollinationsImage(prompt, { signal: controller.signal, model: config.model })
        } catch (pollinationsError) {
          console.warn('[ImageService] Pollinations fallback failed:', pollinationsError)
          return getStudentApologyMessage(studentIdOrName, ctx.locale)
        }
      } else {
        try {
          imageUrl = await generateFalImage(prompt, apiKey, { signal: controller.signal, model: config.model })
        } catch (falError) {
          console.warn('[ImageService] Fal.ai generation failed, falling back to Pollinations.ai:', falError)
          try {
            imageUrl = await generatePollinationsImage(prompt, { signal: controller.signal, model: config.model })
          } catch (pollinationsError) {
            console.warn('[ImageService] Pollinations fallback also failed:', pollinationsError)
            return getStudentApologyMessage(studentIdOrName, ctx.locale)
          }
        }
      }
    } else if (provider === 'together') {
      const apiKey = typeof config.apiKey === 'string' ? config.apiKey.trim() : ''
      if (!apiKey) {
        console.warn('[ImageService] Together AI API key is missing. Gracefully falling back to Pollinations.ai.')
        try {
          imageUrl = await generatePollinationsImage(prompt, { signal: controller.signal, model: config.model })
        } catch (pollinationsError) {
          console.warn('[ImageService] Pollinations fallback failed:', pollinationsError)
          return getStudentApologyMessage(studentIdOrName, ctx.locale)
        }
      } else {
        try {
          imageUrl = await generateTogetherImage(prompt, apiKey, config.model, { signal: controller.signal })
        } catch (togetherError) {
          console.warn('[ImageService] Together AI generation failed, falling back to Pollinations.ai:', togetherError)
          try {
            imageUrl = await generatePollinationsImage(prompt, { signal: controller.signal, model: config.model })
          } catch (pollinationsError) {
            console.warn('[ImageService] Pollinations fallback also failed:', pollinationsError)
            return getStudentApologyMessage(studentIdOrName, ctx.locale)
          }
        }
      }
    } else if (provider === 'openai') {
      const apiKey = typeof config.apiKey === 'string' ? config.apiKey.trim() : ''
      if (!apiKey) {
        console.warn('[ImageService] OpenAI API key is missing. Gracefully falling back to Pollinations.ai.')
        try {
          imageUrl = await generatePollinationsImage(prompt, { signal: controller.signal, model: config.model })
        } catch (pollinationsError) {
          console.warn('[ImageService] Pollinations fallback failed:', pollinationsError)
          return getStudentApologyMessage(studentIdOrName, ctx.locale)
        }
      } else {
        try {
          imageUrl = await generateOpenAiImage(prompt, apiKey, { signal: controller.signal, model: config.model || 'dall-e-3' })
        } catch (openAiError) {
          console.warn('[ImageService] OpenAI generation failed, falling back to Pollinations.ai:', openAiError)
          try {
            imageUrl = await generatePollinationsImage(prompt, { signal: controller.signal, model: config.model })
          } catch (pollinationsError) {
            console.warn('[ImageService] Pollinations fallback also failed:', pollinationsError)
            return getStudentApologyMessage(studentIdOrName, ctx.locale)
          }
        }
      }
    } else if (provider === 'stability') {
      const apiKey = typeof config.apiKey === 'string' ? config.apiKey.trim() : ''
      if (!apiKey) {
        console.warn('[ImageService] Stability AI API key is missing. Gracefully falling back to Pollinations.ai.')
        try {
          imageUrl = await generatePollinationsImage(prompt, { signal: controller.signal, model: config.model })
        } catch (pollinationsError) {
          console.warn('[ImageService] Pollinations fallback failed:', pollinationsError)
          return getStudentApologyMessage(studentIdOrName, ctx.locale)
        }
      } else {
        try {
          imageUrl = await generateStabilityImage(prompt, apiKey, { signal: controller.signal, engineId: config.model })
        } catch (stabilityError) {
          console.warn('[ImageService] Stability AI generation failed, falling back to Pollinations.ai:', stabilityError)
          try {
            imageUrl = await generatePollinationsImage(prompt, { signal: controller.signal, model: config.model })
          } catch (pollinationsError) {
            console.warn('[ImageService] Pollinations fallback also failed:', pollinationsError)
            return getStudentApologyMessage(studentIdOrName, ctx.locale)
          }
        }
      }
    } else {
      // Default: Pollinations (Zero-Key)
      try {
        imageUrl = await generatePollinationsImage(prompt, { signal: controller.signal, model: config.model })
      } catch (pollinationsError) {
        console.warn('[ImageService] Pollinations generation failed:', pollinationsError)
        return getStudentApologyMessage(studentIdOrName, ctx.locale)
      }
    }

    return imageUrl
  } catch (error) {
    console.warn('[ImageService] Failed to generate student photo:', error)
    return getStudentApologyMessage(studentIdOrName, ctx.locale)
  } finally {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer)
    }
  }
}

export interface ProviderConnectionTestResult {
  success: boolean
  warning?: boolean
  message: string
  details?: Record<string, any>
}

/**
 * Tests connection and credentials for the specified image generation provider.
 */
export async function testImageProviderConnection(
  provider: string,
  apiKey?: string,
  model?: string
): Promise<ProviderConnectionTestResult> {
  const normProvider = (provider || 'pollinations').toLowerCase()

  if (normProvider === 'pollinations') {
    return {
      success: true,
      message: 'Pollinations.ai はAPIキー不要で即座に利用可能です！'
    }
  }

  const cleanKey = String(apiKey || '').trim().replace(/[\r\n]+/g, '')
  if (!cleanKey) {
    return {
      success: false,
      message: 'APIキーが入力されていません。'
    }
  }

  if (normProvider === 'stability') {
    const bal = await checkStabilityBalance(cleanKey)
    if (!bal.valid) {
      return {
        success: false,
        message: bal.message
      }
    }
    return {
      success: true,
      warning: !bal.hasEnoughCredits,
      message: bal.message,
      details: { credits: bal.credits }
    }
  }

  if (normProvider === 'openai') {
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${cleanKey}` }
      })
      if (res.ok) {
        return {
          success: true,
          message: 'OpenAI API 接続成功！'
        }
      }
      const errText = await res.text().catch(() => '')
      return {
        success: false,
        message: `OpenAI API 認証エラー (${res.status}): ${errText.slice(0, 100)}`
      }
    } catch (e: any) {
      return {
        success: false,
        message: `OpenAI 接続エラー: ${e?.message || String(e)}`
      }
    }
  }

  if (normProvider === 'together') {
    try {
      const res = await fetch('https://api.together.xyz/v1/models', {
        headers: { Authorization: `Bearer ${cleanKey}` }
      })
      if (res.ok) {
        return {
          success: true,
          message: 'Together AI 接続成功！'
        }
      }
      const errText = await res.text().catch(() => '')
      return {
        success: false,
        message: `Together AI 認証エラー (${res.status}): ${errText.slice(0, 100)}`
      }
    } catch (e: any) {
      return {
        success: false,
        message: `Together AI 接続エラー: ${e?.message || String(e)}`
      }
    }
  }

  if (normProvider === 'fal') {
    if (cleanKey.length < 10) {
      return {
        success: false,
        message: 'Fal.ai APIキーの形式が正しくない可能性があります。'
      }
    }
    return {
      success: true,
      message: 'Fal.ai APIキーが設定されています。'
    }
  }

  return {
    success: true,
    message: `${provider} の接続確認をスキップしました。`
  }
}

