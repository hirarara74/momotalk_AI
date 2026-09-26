import type { AIProvider, ChatMessage } from './types'
import { parseImageDataUrl, extractTextAndImage } from './gemini'

export class ClaudeProvider implements AIProvider {
    id = 'claude'
    name = 'Anthropic Claude'
    private apiKey: string
    private model: string
    private baseUrl: string

    constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022', baseUrl: string = 'https://api.anthropic.com/v1') {
        this.apiKey = apiKey
        this.model = model
        this.baseUrl = baseUrl.replace(/\/+$/, '')
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
                    type: 'image',
                    source: {
                        type: 'base64',
                        media_type: imgInfo.mimeType,
                        data: imgInfo.base64Data
                    }
                },
                {
                    type: 'text',
                    text: promptText
                }
              ]
            : userMessage

        const messages = [
            ...history.map((m) => {
                const isImg = parseImageDataUrl(m.content)
                return {
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: isImg ? '（先生が送信した画像）' : m.content
                }
            }),
            { role: 'user', content: userContent }
        ]

        const response = await fetch(`${this.baseUrl}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
                'dangerously-allow-browser': 'true'
            },
            body: JSON.stringify({
                model: this.model,
                system: systemPrompt,
                messages,
                max_tokens: 1024,
                stream: true
            }),
            signal
        })

        if (!response.ok) {
            const err = await response.text()
            throw new Error(`Claude API error (${response.status}): ${err}`)
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
                if (!trimmed) continue
                if (trimmed.startsWith('data: ')) {
                    try {
                        const json = JSON.parse(trimmed.slice(6))
                        if (json.type === 'content_block_delta' && json.delta?.text) {
                            fullText += json.delta.text
                            onChunk(fullText)
                        }
                    } catch {
                        // ignore malformed JSON chunk
                    }
                }
            }
        }

        return fullText
    }
}
