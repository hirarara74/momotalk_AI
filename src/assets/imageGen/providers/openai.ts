/**
 * OpenAI Image Generation Provider (DALL-E 3 / DALL-E 2).
 * Fast, highly stable commercial API endpoint for anime/character illustrations.
 *
 * Endpoint: POST https://api.openai.com/v1/images/generations
 */

export interface OpenAiImageOptions {
  model?: string // 'dall-e-3' (default) or 'dall-e-2'
  size?: '1024x1024' | '1024x1792' | '1792x1024' | '512x512' | '256x256'
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
  signal?: AbortSignal
}

/**
 * Builds the HTTP POST request specification for OpenAI image generation.
 */
export function buildOpenAiImageRequest(
  prompt: string,
  apiKey: string,
  options?: OpenAiImageOptions
): {
  url: string
  method: string
  headers: Record<string, string>
  body: string
} {
  const cleanKey = String(apiKey || '').trim().replace(/[\r\n]+/g, '')
  const model = options?.model || 'dall-e-3'
  const size = options?.size || '1024x1024'

  // Enhance prompt for DALL-E 3 to maintain pure 2D anime aesthetic
  const animeEnhancedPrompt = prompt.includes('Anime illustration style')
    ? prompt
    : `Anime illustration style, Blue Archive official art style: ${prompt}`

  const bodyPayload: Record<string, any> = {
    model,
    prompt: animeEnhancedPrompt,
    n: 1,
    size
  }

  if (model === 'dall-e-3') {
    if (options?.quality) bodyPayload.quality = options.quality
    if (options?.style) bodyPayload.style = options.style
  }

  return {
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cleanKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyPayload)
  }
}

/**
 * Generates an image via OpenAI DALL-E 3 / DALL-E 2 API.
 * Returns the hosted image URL on success.
 */
export async function generateOpenAiImage(
  prompt: string,
  apiKey: string,
  options?: OpenAiImageOptions
): Promise<string> {
  const req = buildOpenAiImageRequest(prompt, apiKey, options)

  const response = await fetch(req.url, {
    method: req.method,
    headers: req.headers,
    body: req.body,
    signal: options?.signal
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`OpenAI API error (${response.status}): ${response.statusText} ${errorText}`.trim())
  }

  const data = await response.json()
  const imageUrl = data?.data?.[0]?.url

  if (!imageUrl) {
    throw new Error('OpenAI API returned success but no image URL was found in the response payload.')
  }

  return imageUrl
}
