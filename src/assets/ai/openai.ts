import type { AIProvider, ChatMessage } from './types'
import { parseImageDataUrl, extractTextAndImage } from './gemini'

export class OpenAIProvider implements AIProvider {
    id = 'openai'
    name = 'OpenAI'
    private apiKey: string
    private model: string
    private baseUrl: string

    constructor(apiKey: string, model: string = 'gpt-4o-mini', baseUrl: string = 'https://api.openai.com/v1') {
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

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages,
                stream: true
            }),
            signal
        })

        if (!response.ok) {
            const err = await response.text()
            throw new Error(`OpenAI API error (${response.status}): ${err}`)
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
                        // ignore malformed JSON chunk
                    }
                }
            }
        }

        return fullText
    }
}
