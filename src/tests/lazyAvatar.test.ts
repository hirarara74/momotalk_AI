import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, nextTick, ref } from 'vue'
import VueLazyLoad from '@/lazyload'
import Lazy from '@/lazyload/lazy'

const observerSupport = vi.hoisted(() => ({ enabled: true }))
vi.mock('@/lazyload/util', async importOriginal => ({
    ...await importOriginal<typeof import('@/lazyload/util')>(),
    get hasIntersectionObserver() { return observerSupport.enabled }
}))

describe('student avatar loading', () => {
    const observers: { fire: () => void; disconnect: ReturnType<typeof vi.fn> }[] = []
    const pending = new Map<string, (response: Response) => void>()
    let app: ReturnType<typeof createApp> | undefined

    beforeEach(() => {
        observerSupport.enabled = true
        observers.length = 0
        pending.clear()
        vi.stubGlobal('IntersectionObserver', class {
            target!: Element
            disconnect = vi.fn()
            unobserve = vi.fn()
            constructor(callback: IntersectionObserverCallback) {
                observers.push({
                    fire: () => callback([{ target: this.target, isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver),
                    disconnect: this.disconnect
                })
            }
            observe(target: Element) { this.target = target }
        })
        vi.stubGlobal('fetch', vi.fn((url: string) => new Promise<Response>(resolve => pending.set(url, resolve))))
        vi.stubGlobal('URL', class extends URL {
            static createObjectURL(blob: Blob & { url: string }) { return `blob:${blob.url}` }
        })
    })

    afterEach(() => {
        app?.unmount()
        app = undefined
        vi.restoreAllMocks()
        vi.unstubAllGlobals()
        vi.useRealTimers()
        document.body.innerHTML = ''
    })

    async function finish(url: string) {
        pending.get(url)!({ blob: async () => ({ url }) } as unknown as Response)
        // Drain fetch, blob conversion, and the DOM update.
        await new Promise(resolve => setTimeout(resolve, 0))
    }

    it('keeps the current avatar when startup filtering reuses an image before the old request finishes', async () => {
        const students = ref([{ id: 1, avatar: '/old.webp' }])
        app = createApp(defineComponent({
            setup: () => ({ students }),
            template: '<img v-for="(student, index) in students" :key="index" v-lazy="student.avatar" :alt="String(student.id)">'
        }))
        app.use(VueLazyLoad)
        app.mount(document.body.appendChild(document.createElement('div')))
        observers[0].fire()
        students.value = [{ id: 2, avatar: '/current.webp' }]
        await nextTick()
        observers[1].fire()
        await finish('/current.webp')
        await finish('/old.webp')
        expect(document.querySelector('img')!.getAttribute('src')).toBe('blob:/current.webp')
    })

    it('does not apply a pending image after unmount', async () => {
        const lazy = new Lazy()
        const image = document.createElement('img')
        lazy.mount(image, '/old.webp')
        observers[0].fire()
        const loading = image.getAttribute('src')
        lazy.unmount(image)
        await finish('/old.webp')
        expect(image.getAttribute('src')).toBe(loading)
        expect(observers[0].disconnect).toHaveBeenCalled()
    })

    it('clears the previous avatar immediately and ignores callbacks from its old observer', async () => {
        const lazy = new Lazy()
        const image = document.createElement('img')
        lazy.mount(image, '/old.webp')
        const loading = image.getAttribute('src')
        observers[0].fire()
        await finish('/old.webp')
        lazy.update(image, '/current.webp')
        expect(image.getAttribute('src')).toBe(loading)
        expect(observers[0].disconnect).toHaveBeenCalled()
        observers[0].fire()
        await nextTick()
        expect(image.getAttribute('src')).toBe(loading)
        observers[1].fire()
        await finish('/current.webp')
        expect(image.getAttribute('src')).toBe('blob:/current.webp')
        lazy.update(image, '/current.webp')
        expect(observers).toHaveLength(2)
    })

    it('cancels a delayed request when the avatar changes', () => {
        vi.useFakeTimers()
        const lazy = new Lazy()
        lazy.options.delay = 20
        const image = document.createElement('img')
        lazy.mount(image, '/old.webp')
        observers[0].fire()
        lazy.update(image, '/current.webp')
        observers[1].fire()
        vi.advanceTimersByTime(20)
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(fetch).toHaveBeenCalledWith('/current.webp')
        lazy.unmount(image)
    })

    it('loads the current avatar without IntersectionObserver support', async () => {
        observerSupport.enabled = false
        const lazy = new Lazy()
        const image = document.createElement('img')
        lazy.mount(image, '/old.webp')
        lazy.update(image, '/current.webp')
        await finish('/current.webp')
        await finish('/old.webp')
        expect(image.getAttribute('src')).toBe('blob:/current.webp')
        expect(observers).toHaveLength(0)
    })
})
