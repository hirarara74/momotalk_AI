/**
 * Pollinations.ai Image Generation Provider.
 * Free, zero-key, client-side anime image generation provider with direct CORS support.
 *
 * Endpoint protocol:
 * GET https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&model=flux&seed={random_seed}
 */

export interface PollinationsOptions {
  width?: number
  height?: number
  model?: string
  seed?: number
  nologo?: boolean
  signal?: AbortSignal
}

export type PollinationsUrlOptions = PollinationsOptions

/**
 * Safely sanitizes malformed/unpaired Unicode surrogates so encodeURIComponent never throws URIError.
 */
function sanitizeSurrogates(str: string): string {
  if (typeof (str as any).toWellFormed === 'function') {
    return (str as any).toWellFormed()
  }
  return str.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '\uFFFD')
}

/**
 * Builds the Pollinations image GET URL.
 * Defaults to 1024x1024, nologo=true, model=flux, and a random seed if unspecified.
 *
 * @param prompt Danbooru/anime prompt string
 * @param seedOrOptions Specific random seed number or PollinationsOptions object
 * @returns Fully qualified Pollinations image URL
 */
export function buildPollinationsUrl(
  prompt: string,
  seedOrOptions?: number | PollinationsOptions
): string {
  let width = 768
  let height = 768
  let model: string | undefined = undefined
  let nologo: boolean = false
  let seed: number

  if (typeof seedOrOptions === 'number') {
    seed = seedOrOptions
  } else if (seedOrOptions && typeof seedOrOptions === 'object') {
    if (seedOrOptions.width != null) width = seedOrOptions.width
    if (seedOrOptions.height != null) height = seedOrOptions.height
    if (seedOrOptions.model != null) model = seedOrOptions.model
    if (seedOrOptions.nologo !== undefined) nologo = !!seedOrOptions.nologo
    seed = seedOrOptions.seed != null ? seedOrOptions.seed : Math.floor(Math.random() * 1000000)
  } else {
    seed = Math.floor(Math.random() * 1000000)
  }

  const safePrompt = sanitizeSurrogates(String(prompt || ''))
  const encodedPrompt = encodeURIComponent(safePrompt)
  let url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}`
  if (model) {
    url += `&model=${model}`
  }
  if (nologo) {
    url += `&nologo=true`
  }
  return url
}

/**
 * Contract alias for buildPollinationsUrl.
 */
export const buildPollinationsImageUrl = buildPollinationsUrl

export interface PollinationsFetchOptions {
  signal?: AbortSignal
  seed?: number
  width?: number
  height?: number
  model?: string
  nologo?: boolean
  maxRetries?: number
}

/**
 * Fetches an image from Pollinations.ai with resilience:
 * - Preloads the image binary via fetch to ensure HTTP 200 and prevent browser <img> breakages.
 * - Automatically retries with alternative seeds if a 500/502/504 transient error occurs.
 * - Automatically falls back to the reliable default model ('flux') if a specialized model (e.g. 'sana') encounters repeated server errors.
 * - Converts image blob to Object URL for instant, flicker-free rendering in chat.
 */
export async function fetchPollinationsImageWithResilience(
  prompt: string,
  options?: PollinationsFetchOptions
): Promise<string> {
  const signal = options?.signal
  if (signal?.aborted) {
    throw signal.reason || new DOMException('The operation was aborted', 'AbortError')
  }

  const requestedModel = options?.model
  const maxRetries = options?.maxRetries ?? 2

  // Model fallback chain: requestedModel -> default 'flux' (if requested was not flux)
  const candidateModels: (string | undefined)[] = [requestedModel]
  if (requestedModel && requestedModel !== 'flux') {
    candidateModels.push('flux')
  }

  let lastError: any = null

  for (const modelToTry of candidateModels) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (signal?.aborted) {
        throw signal.reason || new DOMException('The operation was aborted', 'AbortError')
      }

      // Use specified seed on first attempt if provided, otherwise random seed for retry diversity
      const seedToUse = attempt === 0 && options?.seed != null
        ? options.seed
        : Math.floor(Math.random() * 1000000)

      const targetUrl = buildPollinationsUrl(prompt, {
        width: options?.width,
        height: options?.height,
        model: modelToTry,
        nologo: options?.nologo,
        seed: seedToUse
      })

      try {
        const response = await fetch(targetUrl, {
          method: 'GET',
          signal: options?.signal
        })

        if (response.ok) {
          const blob = await response.blob()
          // In browser environment, return a local Blob URL for 100% reliable <img> rendering
          if (typeof window !== 'undefined' && typeof URL.createObjectURL === 'function') {
            try {
              return URL.createObjectURL(blob)
            } catch (blobErr) {
              console.warn('[Pollinations] createObjectURL failed, returning direct URL:', blobErr)
              return targetUrl
            }
          }
          return targetUrl
        }

        // Server error (e.g. 500, 502, 503, 504) -> log and retry
        const errText = await response.text().catch(() => '')
        lastError = new Error(`Pollinations API HTTP ${response.status}: ${response.statusText} ${errText}`.trim())
        console.warn(`[Pollinations] Attempt ${attempt + 1} with model "${modelToTry || 'default'}" failed (${response.status}):`, lastError.message)

        // If not the last attempt for this model, wait briefly before retrying
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 800 * (attempt + 1)))
        }
      } catch (networkErr: any) {
        if (signal?.aborted || networkErr.name === 'AbortError') {
          throw signal?.reason || networkErr
        }
        lastError = networkErr
        console.warn(`[Pollinations] Network error on attempt ${attempt + 1}:`, networkErr.message || networkErr)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 800 * (attempt + 1)))
        }
      }
    }
    // If we're here, all retries for modelToTry failed. Next candidate model in loop will be tried.
  }

  throw lastError || new Error('Failed to generate Pollinations image after retries and model fallback')
}

/**
 * Generates an image using Pollinations.ai.
 * Resolves with the image URL ready for rendering in <img> or chat bubbles.
 * Contract: makes 0 network calls and resolves synchronously/instantly.
 *
 * @param prompt Danbooru prompt string
 * @param options AbortSignal and URL parameters (seed, width, height, model)
 * @returns Promise resolving to the image URL string
 */
export async function generatePollinationsImage(
  prompt: string,
  options?: { signal?: AbortSignal; seed?: number; width?: number; height?: number; model?: string; nologo?: boolean }
): Promise<string> {
  if (options?.signal?.aborted) {
    throw options.signal.reason || new DOMException('The operation was aborted', 'AbortError')
  }

  const url = buildPollinationsUrl(prompt, {
    seed: options?.seed,
    width: options?.width,
    height: options?.height,
    model: options?.model,
    nologo: options?.nologo
  })

  if (options?.signal) {
    const signal = options.signal
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        return reject(signal.reason || new DOMException('The operation was aborted', 'AbortError'))
      }
      const onAbort = () => {
        reject(signal.reason || new DOMException('The operation was aborted', 'AbortError'))
      }
      signal.addEventListener('abort', onAbort, { once: true })
      resolve(url)
    })
  }

  return url
}

