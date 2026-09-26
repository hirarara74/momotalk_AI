import type { AIProvider, ChatMessage } from './types'
import { parseImageDataUrl, extractTextAndImage } from './gemini'

export const DEFAULT_GROQ_MODEL = 'qwen/qwen3.8-27b'
export const DEFAULT_GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

// Candidate models on Groq for automatic fallback
export const GROQ_CANDIDATE_MODELS = [
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b'
]

const TRANSIENT_STATUS_CODES = new Set([429, 500, 502, 503, 504, 529])

function waitWithSignal(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            return reject(new Error('Aborted'))
        }
        const timer = setTimeout(resolve, ms)
        if (signal) {
            signal.addEventListener('abort', () => {
                clearTimeout(timer)
                reject(new Error('Aborted'))
            }, { once: true })
        }
    })
}

export class GroqProvider implements AIProvider {
    id = 'groq'
    name = 'Groq'
    private apiKey: string
    private model: string
    private baseUrl: string

    constructor(
        apiKey: string,
        model: string = DEFAULT_GROQ_MODEL,
        baseUrl: string = DEFAULT_GROQ_BASE_URL
    ) {
        this.apiKey = apiKey
        this.model = model || DEFAULT_GROQ_MODEL
        this.baseUrl = (baseUrl || DEFAULT_GROQ_BASE_URL).replace(/\/+$/, '')
    }

    getModel(): string {
        return this.model
    }

    getBaseUrl(): string {
        return this.baseUrl
    }

    async streamChat(
        systemPrompt: string,
        history: ChatMessage[],
        userMessage: string,
        onChunk: (chunk: string) => void,
        signal?: AbortSignal
    ): Promise<string> {
        const { text, imgInfo } = extractTextAndImage(userMessage)
        const promptText = text
            ? `${text}\n\n（※先生からこの画像が一緒に送られてきました。画像の内容とメッセージの両方を踏まえて、あなたのキャラクターらしく返信してください）`
            : '先生からこの画像が送られてきました。画像の内容を見て、あなたのキャラクターらしくリアクションや感想を返信してください。'

        const userContent: any = imgInfo
            ? [
                {
                    type: 'image_url',
                    image_url: { url: `data:${imgInfo.mimeType};base64,${imgInfo.base64Data}` }
                },
                {
                    type: 'text',
                    text: promptText
                }
              ]
            : userMessage

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.map((m) => {
                const isImg = parseImageDataUrl(m.content)
                return {
                    role: m.role,
                    content: isImg ? '（先生が送信した画像）' : m.content
                }
            }),
            { role: 'user', content: userContent }
        ]

        // Candidate models list: user specified model first, then fallback models
        const candidateModels = this.model
            ? [this.model, ...GROQ_CANDIDATE_MODELS.filter((m) => m !== this.model)]
            : GROQ_CANDIDATE_MODELS

        let lastError: any = null

        for (const modelName of candidateModels) {
            // openai/gpt-oss models do not support image input; skip if image is present
            if (imgInfo && modelName.startsWith('openai/')) {
                continue
            }

            // Reasoning models require larger max_tokens to accommodate internal reasoning tokens
            const maxTokens = modelName.includes('gpt-oss') ? 450 : 130
            const maxAttempts = imgInfo ? 3 : 2

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                if (signal?.aborted) throw new Error('Aborted')

                try {
                    const response = await fetch(`${this.baseUrl}/chat/completions`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${this.apiKey}`
                        },
                        body: JSON.stringify({
                            model: modelName,
                            messages,
                            stream: true,
                            max_tokens: maxTokens,
                            temperature: 0.7
                        }),
                        signal
                    })

                    if (!response.ok) {
                        const errText = await response.text()
                        const isTransient = TRANSIENT_STATUS_CODES.has(response.status) || response.status === 404

                        if (isTransient) {
                            console.warn(`[Groq] Model ${modelName} returned HTTP ${response.status} (attempt ${attempt}/${maxAttempts}):`, errText)
                            lastError = new Error(`Groq ${modelName} (${response.status}): ${errText}`)
                            if (attempt < maxAttempts) {
                                const backoffMs = attempt === 1 ? 1500 : 2500
                                await waitWithSignal(backoffMs, signal)
                                continue
                            }
                            break
                        }

                        throw new Error(`Groq API error (${response.status}): ${errText}`)
                    }

                    const reader = response.body?.getReader()
                    if (!reader) throw new Error('Response body not readable')

                    const decoder = new TextDecoder()
                    let fullText = ''
                    let buffer = ''

                    while (true) {
                        const { done, value } = await reader.read()
                        if (done) break

                        buffer += decoder.decode(value, { stream: true })
                        const lines = buffer.split('\n')
                        buffer = lines.pop() || ''

                        for (const line of lines) {
                            const trimmed = line.trim()
                            if (!trimmed || trimmed === 'data: [DONE]') continue
                            if (trimmed.startsWith('data: ')) {
                                try {
                                    const json = JSON.parse(trimmed.slice(6))
                                    const delta = json.choices?.[0]?.delta?.content || ''
                                    fullText += delta
                                    onChunk(fullText)
                                } catch {
                                    // ignore malformed chunk
                                }
                            }
                        }
                    }

                    // If output was generated successfully, return
                    if (fullText.trim()) {
                        return fullText
                    }

                    console.warn(`[Groq] Model ${modelName} returned empty text, trying fallback candidate`)
                    break
                } catch (err: any) {
                    lastError = err
                    if (signal?.aborted || err.name === 'AbortError') throw err
                    console.warn(`[Groq] Model ${modelName} error (attempt ${attempt}/${maxAttempts}):`, err.message || err)
                    if (attempt < maxAttempts) {
                        await waitWithSignal(1500, signal)
                        continue
                    }
                    break
                }
            }
        }

        throw lastError || new Error('All Groq candidate models failed to produce a reply.')
    }
}
