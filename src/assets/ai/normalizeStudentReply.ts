/** Remove accidental dialogue wrappers without removing quotations within a message. */
export function normalizeStudentReply(text: string): string {
    const trimmed = text.trim()
    const wrapped = /^(?:「([^「」]*)」|『([^『』]*)』|"([^"\n]*)")$/.exec(trimmed)
    return wrapped ? (wrapped[1] ?? wrapped[2] ?? wrapped[3]).trim() : text
}
