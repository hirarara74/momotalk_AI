import { afterEach, describe, expect, it, vi } from 'vitest'
import { GroqProvider } from '../assets/ai/groq'
import { buildSystemPrompt } from '../assets/ai/prompts'

const event = (content: string, reason: string | null = null) =>
    `data: ${JSON.stringify({ choices: [{ delta: { content }, finish_reason: reason }] })}\n\n`
const streamResponse = (text: string) => new Response(new ReadableStream({
    start(controller) {
        const bytes = new TextEncoder().encode(text)
        // UTF-8もイベントも受信チャンクの境界で分割される。
        for (let i = 0; i < bytes.length; i += 7) controller.enqueue(bytes.slice(i, i + 7))
        controller.close()
    }
}))

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

describe('Groq reply completion', () => {
    it('retries token-limited text with more room and returns only the completed replacement', async () => {
        vi.useFakeTimers()
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(streamResponse(event('すぐ現場へ、カヨコに連絡、ハ', 'length') + 'data: [DONE]\n\n'))
            .mockResolvedValueOnce(streamResponse(event('カヨコに相談して、まず状況を確認するわ。', 'stop') + 'data: [DONE]'))
        vi.stubGlobal('fetch', fetchMock)
        const chunks: string[] = []
        const reply = new GroqProvider('test').streamChat('system', [], 'どうする？', chunk => chunks.push(chunk))
        await vi.runAllTimersAsync()
        expect(await reply).toBe('カヨコに相談して、まず状況を確認するわ。')
        expect(chunks.at(-1)).toBe('カヨコに相談して、まず状況を確認するわ。')
        expect(fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).max_tokens)).toEqual([512, 1024])
    })

    it('does not accept a disconnected stream as a successful reply', async () => {
        vi.useFakeTimers()
        vi.stubGlobal('fetch', vi.fn(async () => streamResponse(event('先生、こんな夜にミスが続くと余計に'))))
        const result = expect(new GroqProvider('test').streamChat('system', [], 'hi', () => {})).rejects.toThrow('途中で途切れ')
        await vi.runAllTimersAsync()
        await result
    })

    it('does not accept repeated length limits even when DONE is received', async () => {
        vi.useFakeTimers()
        vi.stubGlobal('fetch', vi.fn(async () => streamResponse(event('途中の', 'length') + 'data: [DONE]\n\n')))
        const result = expect(new GroqProvider('test').streamChat('system', [], 'hi', () => {})).rejects.toThrow('生成上限')
        await vi.runAllTimersAsync()
        await result
    })

    it('preserves the final event without a newline and gives reasoning models enough room', async () => {
        const fetchMock = vi.fn(async (_url: unknown, _init: { body: string }) => streamResponse(event('先生、落ち着いて確認しましょう。', 'stop').trimEnd()))
        vi.stubGlobal('fetch', fetchMock)
        expect(await new GroqProvider('test', 'openai/gpt-oss-120b').streamChat('system', [], 'hi', () => {}))
            .toBe('先生、落ち着いて確認しましょう。')
        expect(JSON.parse(fetchMock.mock.calls[0][1].body).max_tokens).toBe(2048)
    })

    it('uses the supplied Aru reaction for surprises without inventing an event to trigger it', () => {
        const prompt = buildSystemPrompt({ Id: 10000, Name: 'アル', Avatar: '' }, 'jp')
        expect(prompt).toContain('なななな、なっ、何ですってーーーーーー！！！？？？')
        expect(prompt).toContain('長い叫びを必須の冒頭にしない')
        expect(prompt).toContain('何ですってー！')
        expect(prompt).toContain('続けて繰り返さず')
        expect(prompt).toContain('先生との普段の会話へ持ち込まない')
        expect(prompt).toContain('過去の返信が敬語でも')
        expect(prompt).toContain('事件・請求・他の生徒の行動を作って驚かない')
    })
})
