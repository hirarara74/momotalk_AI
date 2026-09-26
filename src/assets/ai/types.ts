export interface AIConfig {
    provider: 'gemini' | 'openai' | 'claude'
    apiKey: string
    model?: string
    baseUrl?: string
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
}

export interface AIProvider {
    id: string
    name: string
    streamChat(
        systemPrompt: string,
        history: ChatMessage[],
        userMessage: string,
        onChunk: (chunk: string) => void,
        signal?: AbortSignal
    ): Promise<string>
}
