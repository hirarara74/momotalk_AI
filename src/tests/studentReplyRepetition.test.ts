import { describe, expect, it, vi } from 'vitest'
import { streamStudentReply } from '../assets/ai/streamStudentReply'
import type { AIProvider, ChatMessage } from '../assets/ai/types'

const history: ChatMessage[] = [
    { role: 'assistant', content: '先生、任せて！' },
    { role: 'user', content: 'ありがとう' },
    { role: 'assistant', content: 'また相談してね。' }
]

function providerFor(...replies: string[]) {
    const streamChat = vi.fn(async (_prompt, _history, _message, onChunk) => {
        const reply = replies.shift()!
        onChunk(reply)
        return reply
    })
    return { id: 'test', name: 'Test', streamChat } satisfies AIProvider
}

describe('shared reply repetition guard', () => {
    it('keeps a new reply and photo directive without an extra request', async () => {
        const provider = providerFor('これでどう？ [PHOTO: portrait]')
        expect(await streamStudentReply(provider, 'system', history, '写真を見せて', vi.fn()))
            .toBe('これでどう？ [PHOTO: portrait]')
        expect(provider.streamChat).toHaveBeenCalledTimes(1)
    })

    it.each(['先生、任せて！', '「先生、 任せて！」', '先生、任せて！ [PHOTO: different]'])
    ('retries a recent duplicate: %s', async duplicate => {
        const provider = providerFor(duplicate, '今度は何を手伝えばいい？')
        const onChunk = vi.fn()
        expect(await streamStudentReply(provider, 'system', history, 'どうする？', onChunk))
            .toBe('今度は何を手伝えばいい？')
        expect(provider.streamChat).toHaveBeenCalledTimes(2)
        expect(provider.streamChat.mock.calls[1][0]).toContain('REWRITE REQUIRED')
        expect(provider.streamChat.mock.calls[1][1]).toBe(history)
        expect(onChunk).toHaveBeenCalledWith('')
    })

    it('compares against formatted saved dialogue', async () => {
        const provider = providerFor('任せて！', '一緒に確認しよう。')
        await streamStudentReply(provider, 'system', [{ role: 'assistant', content: '<span style="font-weight:bolder;">任せて！</span>' }], '手伝って', vi.fn())
        expect(provider.streamChat).toHaveBeenCalledTimes(2)
    })

    it('rejects a second duplicate instead of retrying indefinitely', async () => {
        const provider = providerFor('また相談してね。', '先生、任せて！')
        await expect(streamStudentReply(provider, 'system', history, 'どうする？', vi.fn()))
            .rejects.toThrow('同じ返答が続いた')
        expect(provider.streamChat).toHaveBeenCalledTimes(2)
    })

    it('does not reject a reply merely because the teacher used the same words', async () => {
        const provider = providerFor('ありがとう')
        expect(await streamStudentReply(provider, 'system', history, 'ありがとう', vi.fn())).toBe('ありがとう')
        expect(provider.streamChat).toHaveBeenCalledTimes(1)
    })

    it('preserves failures and cancellation without a duplicate retry', async () => {
        const provider = providerFor('先生、任せて！')
        provider.streamChat.mockRejectedValueOnce(new Error('429'))
        await expect(streamStudentReply(provider, 'system', history, 'hi', vi.fn())).rejects.toThrow('429')
        expect(provider.streamChat).toHaveBeenCalledTimes(1)
        const controller = new AbortController()
        controller.abort()
        await expect(streamStudentReply(provider, 'system', history, 'hi', vi.fn(), controller.signal)).rejects.toThrow('Aborted')
        expect(provider.streamChat).toHaveBeenCalledTimes(1)
    })
})
