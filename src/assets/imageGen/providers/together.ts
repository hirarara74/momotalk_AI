/**
 * Together AI Image Generation Provider (BYOK).
 * OpenAI-compatible image generations endpoint with direct CORS support.
 *
 * Endpoint protocol:
 * POST https://api.together.xyz/v1/images/generations
 * Authorization: Bearer {apiKey}
 * Content-Type: application/json
 */

export interface TogetherImageOptions {
  signal?: AbortSignal
  model?: string
  steps?: number
  width?: number
  height?: number
}

/**
 * Builds the Together AI HTTP request configuration and payload.
 *
 * @param prompt Danbooru/anime prompt string
 * @param apiKey User BYOK Together AI key
 * @param options Optional overrides for model, steps, and dimensions
 */
export function buildTogetherAiRequest(
  prompt: string,
  apiKey: string,
  options?: { model?: string; steps?: number; width?: number; height?: number }
): {
  url: string
  method: string
  headers: Record<string, string>
  body: string
} {
  const sanitizedKey = typeof apiKey === 'string'
    ? apiKey.replace(/[\r\n]/g, '').trim()
    : String(apiKey || '').replace(/[\r\n]/g, '').trim()

  return {
    url: 'https://api.together.xyz/v1/images/generations',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sanitizedKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      model: options?.model || 'black-forest-labs/FLUX.1-schnell',
      width: options?.width ?? 1024,
      height: options?.height ?? 1024,
      steps: options?.steps ?? 4,
      n: 1,
      response_format: 'url'
    })
  }
}

/**
 * Generates an image using Together AI image generation API.
 * Resolves with the CDN URL of the generated image.
 *
 * @param prompt Danbooru prompt string
 * @param apiKey Together AI user API key
 * @param modelOrOptions Model name string or options object
 * @param options Optional configuration when model is provided as 3rd parameter
 * @returns Promise resolving to the image URL string
 */
export async function generateTogetherImage(
  prompt: string,
  apiKey: string,
  modelOrOptions?: string | TogetherImageOptions,
  options?: TogetherImageOptions
): Promise<string> {
  if (typeof apiKey !== 'string') {
    throw new TypeError('Together AI API key must be a string')
  }

  const sanitizedKey = apiKey.replace(/[\r\n]/g, '').trim()
  if (!sanitizedKey) {
    throw new Error('Together AI API key is required')
  }

  let model = 'black-forest-labs/FLUX.1-schnell'
  let opt: TogetherImageOptions | undefined = options

  if (typeof modelOrOptions === 'string') {
    model = modelOrOptions || model
  } else if (modelOrOptions && typeof modelOrOptions === 'object') {
    opt = modelOrOptions
    if (opt.model) {
      model = opt.model
    }
  }

  if (opt?.signal?.aborted) {
    throw opt.signal.reason || new DOMException('The operation was aborted', 'AbortError')
  }

  const req = buildTogetherAiRequest(prompt, sanitizedKey, {
    model,
    steps: opt?.steps,
    width: opt?.width,
    height: opt?.height
  })

  const response = await fetch(req.url, {
    method: req.method,
    headers: req.headers,
    body: req.body,
    signal: opt?.signal
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`Together AI API error (${response.status}): ${errorBody || response.statusText}`)
  }

  const data = await response.json()
  const imageUrl = data?.data?.[0]?.url || data?.output?.choices?.[0]?.image_url

  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('Together AI response did not contain a valid image URL')
  }

  return imageUrl
}
