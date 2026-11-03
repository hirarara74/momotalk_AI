// Only the dedicated local server uses debug credentials; builds retain production routing.
export const DEBUG_MODE = import.meta.env.DEV && import.meta.env.MODE === 'debug'
export const DEBUG_GROQ_URL = `${import.meta.env.BASE_URL}api/debug-groq`
