/**
 * Fal.ai Image Generation Provider (BYOK).
 * High-speed anime diffusion inference using fal-ai/flux/schnell (~1.2s - 2.0s).
 *
 * Endpoint protocol:
 * POST https://fal.run/fal-ai/flux/schnell
 * Authorization: Key {apiKey}
 * Content-Type: application/json
 */

export interface FalImageOptions {
  model?: string
  signal?: AbortSignal
  imageSize?: string | { width: number; height: number }
  numInferenceSteps?: number
  enableSafetyChecker?: boolean
}

/**
 * Builds the Fal.ai HTTP request configuration and payload.
 *
 * @param prompt Danbooru/anime prompt string
 * @param apiKey User BYOK Fal.ai key
 * @param options Optional overrides for model, image size and inference steps
 */
export function buildFalAiRequest(
  prompt: string,
  apiKey: string,
  options?: { model?: string; imageSize?: string | { width: number; height: number }; numInferenceSteps?: number; enableSafetyChecker?: boolean }
): {
  url: string
  method: string
  headers: Record<string, string>
  body: string
} {
  const sanitizedKey = typeof apiKey === 'string'
    ? apiKey.replace(/[\r\n]/g, '').trim()
    : String(apiKey || '').replace(/[\r\n]/g, '').trim()

  const model = options?.model || 'fal-ai/flux/schnell'
  const endpoint = model.startsWith('http') ? model : `https://fal.run/${model}`

  return {
    url: endpoint,
    method: 'POST',
    headers: {
      Authorization: `Key ${sanitizedKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      image_size: options?.imageSize || { width: 1024, height: 1024 },
      num_inference_steps: options?.numInferenceSteps ?? 4,
      enable_safety_checker: options?.enableSafetyChecker ?? true
    })
  }
}

/**
 * Generates an image using Fal.ai FLUX.1 Schnell.
 * Resolves with the CDN URL of the generated image.
 *
 * @param prompt Danbooru prompt string
 * @param apiKey Fal.ai user API key
 * @param options Optional AbortSignal and inference parameters
 * @returns Promise resolving to the image URL string
 */
export async function generateFalImage(
  prompt: string,
  apiKey: string,
  options?: FalImageOptions
): Promise<string> {
  if (typeof apiKey !== 'string') {
    throw new TypeError('Fal.ai API key must be a string')
  }

  const sanitizedKey = apiKey.replace(/[\r\n]/g, '').trim()
  if (!sanitizedKey) {
    throw new Error('Fal.ai API key is required')
  }

  if (options?.signal?.aborted) {
    throw options.signal.reason || new DOMException('The operation was aborted', 'AbortError')
  }

  const req = buildFalAiRequest(prompt, sanitizedKey, options)

  const response = await fetch(req.url, {
    method: req.method,
    headers: req.headers,
    body: req.body,
    signal: options?.signal
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`Fal.ai API error (${response.status}): ${errorBody || response.statusText}`)
  }

  const data = await response.json()
  const imageUrl = data?.images?.[0]?.url

  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('Fal.ai response did not contain a valid image URL')
  }

  return imageUrl
}
