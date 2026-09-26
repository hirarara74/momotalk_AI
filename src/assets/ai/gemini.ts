import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import type { AIProvider, ChatMessage } from './types'

export const DEFAULT_GEMINI_MODELS = [
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-flash-latest'
]

export const GEMINI_SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
]

export function parseImageDataUrl(input: string): { mimeType: string; base64Data: string } | null {
    if (!input || typeof input !== 'string') return null
    // Match direct data URL: data:image/xxx;base64,yyy
    const directMatch = input.trim().match(/^data:(image\/[a-zA-Z0-9.+/-]+);base64,([A-Za-z0-9+/=]+)$/)
    if (directMatch) {
        return {
            mimeType: directMatch[1],
            base64Data: directMatch[2]
        }
    }
    // Match HTML or markdown wrapped img: src="data:image/xxx;base64,yyy"
    const htmlMatch = input.match(/data:(image\/[a-zA-Z0-9.+/-]+);base64,([A-Za-z0-9+/=]+)/)
    if (htmlMatch) {
        return {
            mimeType: htmlMatch[1],
            base64Data: htmlMatch[2]
        }
    }
    return null
}

export function extractTextAndImage(input: string): {
    text: string
    imgInfo: { mimeType: string; base64Data: string } | null
} {
    if (!input || typeof input !== 'string') {
        return { text: '', imgInfo: null }
    }
    const imgInfo = parseImageDataUrl(input)
    if (!imgInfo) {
        return { text: input, imgInfo: null }
    }

    // Strip out data URL or image tags to isolate accompanying message
    const cleanText = input
        .replace(/<img[^>]*src=["']?data:image\/[^;"']+;base64,[^"'>]+["']?[^>]*>/gi, '')
        .replace(/data:image\/[a-zA-Z0-9.+/-]+;base64,[A-Za-z0-9+/=]+/g, '')
        .trim()

    return { text: cleanText, imgInfo }
}

export function buildGeminiUserParts(userMessage: string): any[] {
    const { text, imgInfo } = extractTextAndImage(userMessage)
    if (imgInfo) {
        const promptText = text
            ? `${text}\n\n（※先生からこの画像が一緒に送られてきました。画像の内容とメッセージの両方を踏まえて、あなたのキャラクターらしく返信してください）`
            : '先生からこの画像が送られてきました。画像の内容を見て、あなたのキャラクターらしくリアクションや感想を返信してください。'
        return [
            {
                inlineData: {
                    mimeType: imgInfo.mimeType,
                    data: imgInfo.base64Data
                }
            },
            {
                text: promptText
            }
        ]
    }
    return [{ text: userMessage }]
}

export class GeminiProvider implements AIProvider {
    id = 'gemini'
    name = 'Google Gemini'
    private apiKey: string
    private customModel?: string

    constructor(apiKey: string, model?: string) {
        this.apiKey = apiKey
        this.customModel = model
    }

    async streamChat(
        systemPrompt: string,
        history: ChatMessage[],
        userMessage: string,
        onChunk: (chunk: string) => void,
        signal?: AbortSignal
    ): Promise<string> {
        const candidateModels = this.customModel
            ? [this.customModel]
            : DEFAULT_GEMINI_MODELS

        let lastError: any = null

        for (const modelName of candidateModels) {
            if (signal?.aborted) throw new Error('Aborted')
            try {
                const genAI = new GoogleGenerativeAI(this.apiKey)
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: systemPrompt,
                    safetySettings: GEMINI_SAFETY_SETTINGS
                })

                const contents = history.map((msg) => {
                    const isAssistant = msg.role === 'assistant'
                    const imgInfo = parseImageDataUrl(msg.content)
                    if (imgInfo) {
                        return {
                            role: isAssistant ? 'model' : 'user',
                            parts: [{ text: '（先生が送信した画像）' }]
                        }
                    }
                    return {
                        role: isAssistant ? 'model' : 'user',
                        parts: [{ text: msg.content }]
                    }
                })

                contents.push({
                    role: 'user',
                    parts: buildGeminiUserParts(userMessage)
                })

                const result = await model.generateContentStream({ contents })
                let fullText = ''

                for await (const chunk of result.stream) {
                    if (signal?.aborted) throw new Error('Aborted')
                    const chunkText = chunk.text()
                    fullText += chunkText
                    onChunk(fullText)
                }

                return fullText
            } catch (err: any) {
                lastError = err
                // If 429 quota exhaustion or model not found, try next candidate
                const errStr = String(err)
                if (errStr.includes('429') || errStr.includes('404') || errStr.includes('quota')) {
                    console.warn(`[Gemini] Model ${modelName} failed, falling back to next candidate:`, err)
                    continue
                }
                throw err
            }
        }

        throw lastError || new Error('All Gemini candidate models failed')
    }
}
