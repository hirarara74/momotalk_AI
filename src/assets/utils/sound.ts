import { store } from '../storeUtils/store'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return null

    if (!audioCtx) {
        try {
            audioCtx = new AudioContextClass()
        } catch {
            return null
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {})
    }
    return audioCtx
}

export type MomoSoundType = 'send' | 'receive' | 'rankup'

/**
 * Play synthesized MomoTalk sound effects using Web Audio API
 */
export function playMomoTalkSound(type: MomoSoundType) {
    if (!store.soundEnabled) return
    const volume = Math.max(0, Math.min(1, store.soundVolume ?? 0.7))
    if (volume <= 0) return

    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    switch (type) {
        case 'send': {
            // Subtle crisp pop/blip
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(880, now)
            osc.frequency.exponentialRampToValueAtTime(440, now + 0.06)

            gain.gain.setValueAtTime(volume * 0.35, now)
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

            osc.connect(gain)
            gain.connect(ctx.destination)

            osc.start(now)
            osc.stop(now + 0.06)
            break
        }
        case 'receive': {
            // Signature MomoTalk "Piron♪" two-tone chime (E6 -> B6)
            const osc1 = ctx.createOscillator()
            const osc2 = ctx.createOscillator()
            const gain1 = ctx.createGain()
            const gain2 = ctx.createGain()

            osc1.type = 'sine'
            osc1.frequency.setValueAtTime(1318.51, now) // E6
            gain1.gain.setValueAtTime(volume * 0.45, now)
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.09)

            osc1.connect(gain1)
            gain1.connect(ctx.destination)
            osc1.start(now)
            osc1.stop(now + 0.09)

            // Second tone slightly overlapping
            const t2 = now + 0.07
            osc2.type = 'sine'
            osc2.frequency.setValueAtTime(1975.53, t2) // B6
            gain2.gain.setValueAtTime(volume * 0.5, t2)
            gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.25)

            osc2.connect(gain2)
            gain2.connect(ctx.destination)
            osc2.start(t2)
            osc2.stop(t2 + 0.25)
            break
        }
        case 'rankup': {
            // Ascending Kizuna rank fanfare arpeggio (C5 -> E5 -> G5 -> C6)
            const freqs = [523.25, 659.25, 783.99, 1046.5]
            freqs.forEach((freq, idx) => {
                const toneStart = now + idx * 0.08
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()

                osc.type = 'triangle'
                osc.frequency.setValueAtTime(freq, toneStart)

                const duration = idx === freqs.length - 1 ? 0.35 : 0.1
                gain.gain.setValueAtTime(volume * 0.4, toneStart)
                gain.gain.exponentialRampToValueAtTime(0.001, toneStart + duration)

                osc.connect(gain)
                gain.connect(ctx.destination)

                osc.start(toneStart)
                osc.stop(toneStart + duration)
            })
            break
        }
    }
}
