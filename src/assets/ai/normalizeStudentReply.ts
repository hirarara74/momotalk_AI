/**
 * Remove accidental dialogue wrappers without removing quotations within a message.
 * Curly apostrophes from the model are straightened so English replies match the prompts.
 */
export function normalizeStudentReply(text: string): string {
    const plain = text.replace(/[‘’]/g, "'")
    const trimmed = plain.trim()
    const wrapped = /^(?:「([^「」]*)」|『([^『』]*)』|"([^"\n]*)")$/.exec(trimmed)
    return wrapped ? (wrapped[1] ?? wrapped[2] ?? wrapped[3]).trim() : plain
}
