// Mac IMEs send the conversion-confirming Enter as key "Enter": Chrome sets isComposing, Safari only keyCode 229
export const isImeComposing = (e: KeyboardEvent) => e.isComposing || e.keyCode === 229
