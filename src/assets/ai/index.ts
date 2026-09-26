import type { AIProvider } from './types'
import { GeminiProvider } from './gemini'
import { OpenAIProvider } from './openai'
import { ClaudeProvider } from './claude'
import { GroqProvider, DEFAULT_GROQ_MODEL, DEFAULT_GROQ_BASE_URL } from './groq'
import { store } from '../storeUtils/store'

export function getAIProvider(): AIProvider {
    const provider = store.aiProvider || 'groq'
    const apiKey = store.aiApiKey || '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'
    const model = store.aiModel || undefined

    if (provider === 'groq') {
        return new GroqProvider(apiKey, model || DEFAULT_GROQ_MODEL, store.aiBaseUrl || DEFAULT_GROQ_BASE_URL)
    }

    if (provider === 'openai') {
        return new OpenAIProvider(apiKey, model || 'gpt-4o-mini', store.aiBaseUrl || undefined)
    }

    if (provider === 'claude') {
        return new ClaudeProvider(apiKey, model || 'claude-3-5-sonnet-20241022', store.aiBaseUrl || undefined)
    }

    // Default to Gemini
    return new GeminiProvider(apiKey, model)
}

export * from './types'
export * from './prompts'
export * from './groq'

