import { afterEach, describe, expect, it, vi } from 'vitest'

const sse = (...lines: string[]) => new ReadableStream({
    start(c) { c.enqueue(new TextEncoder().encode(lines.map(l => `data: ${l}\n\n`).join(''))); c.close() }
})
const okFetch = (body: ReadableStream) => vi.fn(async () => ({ ok: true, status: 200, body }) as any)

vi.mock('@google/generative-ai', () => ({
    HarmCategory: {}, HarmBlockThreshold: {},
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return {
                generateContentStream: async () => ({
                    stream: (async function* () { yield { text: () => 'こん' }; yield { text: () => 'にちは' } })()
                })
            }
        }
    }
}))

afterEach(() => { vi.unstubAllGlobals() })

describe('LLM adapters stream replies', () => {
    it('OpenAI: concatenates SSE deltas and authenticates with the bearer key', async () => {
        const { OpenAIProvider } = await import('@/assets/ai/openai')
        const fetchMock = okFetch(sse('{"choices":[{"delta":{"content":"こん"}}]}', '{"choices":[{"delta":{"content":"にちは"}}]}', '[DONE]'))
        vi.stubGlobal('fetch', fetchMock)
        const chunks: string[] = []
        const result = await new OpenAIProvider('k', 'gpt-4o-mini').streamChat('s', [], 'hi', c => chunks.push(c))
        expect(result).toBe('こんにちは')
        expect(chunks.at(-1)).toBe('こんにちは')
        const [url, init] = fetchMock.mock.calls[0] as any
        expect(url).toBe('https://api.openai.com/v1/chat/completions')
        expect(init.headers.Authorization).toBe('Bearer k')
    })
    it('Claude: concatenates content_block_delta text', async () => {
        const { ClaudeProvider } = await import('@/assets/ai/claude')
        vi.stubGlobal('fetch', okFetch(sse(
            '{"type":"content_block_delta","delta":{"text":"こん"}}',
            '{"type":"content_block_delta","delta":{"text":"にちは"}}')))
        expect(await new ClaudeProvider('k').streamChat('s', [], 'hi', () => {})).toBe('こんにちは')
    })
    it('Gemini: concatenates streamed chunks', async () => {
        const { GeminiProvider } = await import('@/assets/ai/gemini')
        expect(await new GeminiProvider('k').streamChat('s', [], 'hi', () => {})).toBe('こんにちは')
    })
})
