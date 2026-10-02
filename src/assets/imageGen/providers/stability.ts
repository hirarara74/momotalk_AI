/**
 * Stability AI Image Generation Provider (SDXL / Stable Diffusion).
 * Direct native support for 'anime' style presets and Danbooru tags.
 *
 * Endpoint: POST https://api.stability.ai/v1/generation/{engine_id}/text-to-image
 */

export interface StabilityAiOptions {
  engineId?: string // default: 'stable-diffusion-xl-1024-v1-0'
  stylePreset?: string // default: 'anime'
  width?: number // default: 1024
  height?: number // default: 1024
  cfgScale?: number // default: 7
  steps?: number // default: 30
  signal?: AbortSignal
}

/**
 * Builds the HTTP POST request specification for Stability AI text-to-image.
 */
export function buildStabilityAiRequest(
  prompt: string,
  apiKey: string,
  options?: StabilityAiOptions
): {
  url: string
  method: string
  headers: Record<string, string>
  body: string
} {
  const cleanKey = String(apiKey || '').trim().replace(/[\r\n]+/g, '')
  const engineId = options?.engineId || 'stable-diffusion-xl-1024-v1-0'
  const stylePreset = options?.stylePreset || 'anime'
  const width = options?.width || 1024
  const height = options?.height || 1024

  const bodyPayload: Record<string, any> = {
    text_prompts: [
      {
        text: prompt,
        weight: 1.0
      }
    ],
    cfg_scale: options?.cfgScale ?? 7,
    height,
    width,
    samples: 1,
    steps: options?.steps ?? 30
  }

  if (stylePreset) {
    bodyPayload.style_preset = stylePreset
  }

  return {
    url: `https://api.stability.ai/v1/generation/${engineId}/text-to-image`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cleanKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(bodyPayload)
  }
}

/**
 * Parses Stability AI API error responses into clear, actionable user messages.
 */
export function parseStabilityErrorMessage(status: number, rawError: string): string {
  let parsed: any = null
  try {
    parsed = JSON.parse(rawError)
  } catch {
    // raw text
  }

  const name = parsed?.name || ''
  const message = parsed?.message || rawError

  if (status === 429 && (name === 'insufficient_balance' || message.includes('not have enough balance') || message.includes('insufficient_balance'))) {
    return 'Stability AIのクレジット残高が不足しています (1回の生成に約 $0.009 / 0.9 credits 必要です)。Stability AI ダッシュボード (https://platform.stability.ai/account/credits) でクレジットをチャージするか、他の画像生成プロバイダーをご利用ください。'
  }

  if (status === 401 || message.includes('Unauthorized') || message.includes('Invalid API Key') || message.includes('invalid_api_key')) {
    return 'Stability AI の APIキーが無効です。APIキーを確認してください。'
  }

  if (status === 429) {
    return 'Stability AI のリクエスト上限（レート制限）に達しました。しばらく待ってから再試行してください。'
  }

  return `Stability AI API エラー (${status}): ${message}`.trim()
}

export interface StabilityBalanceResult {
  valid: boolean
  credits: number
  hasEnoughCredits: boolean
  message: string
}

/**
 * Checks the user's account credit balance on Stability AI.
 * Endpoint: GET https://api.stability.ai/v1/user/balance
 */
export async function checkStabilityBalance(apiKey: string): Promise<StabilityBalanceResult> {
  const cleanKey = String(apiKey || '').trim().replace(/[\r\n]+/g, '')
  if (!cleanKey) {
    return {
      valid: false,
      credits: 0,
      hasEnoughCredits: false,
      message: 'APIキーが入力されていません。'
    }
  }

  try {
    const response = await fetch('https://api.stability.ai/v1/user/balance', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cleanKey}`,
        Accept: 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      const errorMsg = parseStabilityErrorMessage(response.status, errorText)
      return {
        valid: false,
        credits: 0,
        hasEnoughCredits: false,
        message: errorMsg
      }
    }

    const data = await response.json()
    const credits = typeof data?.credits === 'number' ? data.credits : 0
    const hasEnough = credits >= 0.9 // SDXL 1024 requires ~0.9 credits ($0.009)

    return {
      valid: true,
      credits,
      hasEnoughCredits: hasEnough,
      message: hasEnough
        ? `Stability AI 接続成功！残高: ${credits} credits`
        : `Stability AI 接続成功ですが、残高が不足しています (残高: ${credits} credits / 必要: 約0.9 credits)。チャージが必要です。`
    }
  } catch (error: any) {
    return {
      valid: false,
      credits: 0,
      hasEnoughCredits: false,
      message: `Stability AI 接続エラー: ${error?.message || String(error)}`
    }
  }
}

/**
 * Generates an image via Stability AI SDXL API.
 * Resolves with a Data URL (base64) ready for immediate display.
 */
export async function generateStabilityImage(
  prompt: string,
  apiKey: string,
  options?: StabilityAiOptions
): Promise<string> {
  const req = buildStabilityAiRequest(prompt, apiKey, options)

  const response = await fetch(req.url, {
    method: req.method,
    headers: req.headers,
    body: req.body,
    signal: options?.signal
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    const friendlyError = parseStabilityErrorMessage(response.status, errorText)
    throw new Error(friendlyError)
  }

  const data = await response.json()
  const base64Data = data?.artifacts?.[0]?.base64

  if (!base64Data) {
    throw new Error('Stability AI API returned success but no base64 artifact was found in payload.')
  }

  return `data:image/png;base64,${base64Data}`
}

