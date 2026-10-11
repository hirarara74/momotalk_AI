import { stickers2, getStickerDescription } from '../utils/stickers'

const stickerCatalog = new Map(stickers2.map(url => [url.split('/').pop()!, url]))

export const STUDENT_STICKER_DIRECTIVE = `

[MomoTalk sticker replies / スタンプ返信]
You may choose text only, text followed by ONE sticker, or ONE sticker only. Use stickers naturally and occasionally for greetings, thanks, agreement, surprise, or emotion; do not add one to every reply. A brief reaction may be sticker-only, especially when Sensei asks for a sticker-only response. Answer questions and substantive requests with useful in-character text, not just a sticker. Preserve the selected language and character voice. A sticker depicting another character is a shared messenger sticker, not your identity or an event that happened.
To send a sticker, append exactly [STICKER: filename] using a filename from the list below. For a sticker-only reply output only that tag, without narration or quotes. Never invent a filename, URL, HTML, or markdown image. These are control tags, not spoken dialogue; the optional sticker is an exception to the text-only dialogue format. Do not describe pressing or sending it. Avoid repeating the same recent reaction.
Available stickers (filename: meaning):
${[...stickerCatalog].map(([name, url]) => `${name}: ${getStickerDescription(url)}`).join('\n')}`

/** Resolve only bundled images; hide both complete and still-streaming control tags. */
export function extractStudentSticker(reply: string): { cleanText: string; stickerUrl?: string } {
    let stickerUrl: string | undefined
    const cleanText = reply.replace(/(?:\[|【)\s*STICKER\s*:\s*([^\]】]*)(?:\]|】|$)/gi, (_, name: string) => {
        stickerUrl ??= stickerCatalog.get(name.trim())
        return ''
    }).replace(/(?:\[|【)\s*(?:S|ST|STI|STIC|STICK|STICKE|STICKER)\s*$/i, '').trim()
    return { cleanText, stickerUrl }
}

export function studentStickerHistory(url: string): string {
    return `[スタンプ] ${getStickerDescription(url)}`
}
