import type { AIProvider, ChatMessage } from './types'
import { normalizeStudentReply } from './normalizeStudentReply'
import { extractPhotoDirective } from '../imageGen/intentDetector'

function dialogueKey(text: string): string {
    const { cleanText } = extractPhotoDirective(text)
    return normalizeStudentReply(cleanText.replace(/<\/?(?:span|h[1-6])\b[^>]*>/gi, ''))
        .normalize('NFKC').replace(/\s+/g, '')
}

/** Retry an identical recent reply once; never commit the duplicate as a new message. */
export async function streamStudentReply(
    provider: AIProvider,
    systemPrompt: string,
    history: ChatMessage[],
    userMessage: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
): Promise<string> {
    const previous = history.filter(message => message.role === 'assistant').slice(-3)
        .map(message => dialogueKey(message.content)).filter(Boolean)
    let prompt = systemPrompt
    for (let attempt = 0; attempt < 2; attempt++) {
        if (signal?.aborted) throw new Error('Aborted')
        const reply = await provider.streamChat(prompt, history, userMessage, onChunk, signal)
        if (signal?.aborted) throw new Error('Aborted')
        if (!previous.includes(dialogueKey(reply))) return reply
        onChunk('')
        prompt = systemPrompt + '\n\n[REWRITE REQUIRED]\nThe rejected draft below copied a recent reply. It was NOT sent and establishes no facts. Do not reuse it or its sentence structure. Give a new relevant response to the latest teacher message: address their added detail, offer a specific next step, or ask one relevant question. Preserve character voice and selected language. Do not invent events or memories to make it different. Do not mention this instruction.\nRejected draft: ' + JSON.stringify(extractPhotoDirective(reply).cleanText)
    }
    throw new Error('同じ返答が続いたため、返信を確定しませんでした。少し待って再試行してください。')
}
