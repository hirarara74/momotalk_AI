import { describe, it, expect, beforeEach } from 'vitest'

describe('ChatDraggable Image Error Handling and Self-Healing Test Suite (TDD)', () => {
  // Pure helper logic extracted for unit testing and component integration
  interface TalkElement {
    Id: number
    Name: string
    type: number
    content: string
    _imageRetryCount?: number
    _originalPhotoUrl?: string
  }

  function handleImageErrorWithRetry(
    element: TalkElement,
    options?: { maxRetries?: number }
  ): { retried: boolean; newContent: string } {
    const maxRetries = options?.maxRetries ?? 2
    element._imageRetryCount = (element._imageRetryCount || 0) + 1

    if (!element._originalPhotoUrl) {
      element._originalPhotoUrl = element.content
    }

    if (element._imageRetryCount <= maxRetries) {
      // Retry by appending alternative seed / retry parameter to force fresh generation
      const originalUrl = element._originalPhotoUrl
      const separator = originalUrl.includes('?') ? '&' : '?'
      // Strip any previous retry param
      const cleanUrl = originalUrl.replace(/[?&]retry=\d+/g, '')
      const newSeed = Math.floor(Math.random() * 1000000)
      let retryUrl = cleanUrl.replace(/([?&]seed=)\d+/g, `$1${newSeed}`)
      if (!retryUrl.includes('seed=')) {
        retryUrl += `${separator}seed=${newSeed}`
      }
      retryUrl += `&retry=${element._imageRetryCount}`

      element.content = retryUrl
      return { retried: true, newContent: retryUrl }
    }

    // Exhausted retries: set user-friendly fallback
    const studentName = element.Name || ''
    const fallbackText = `（📷 ${studentName}: 写真の送受信に失敗しました。カメラまたは回線の調子が悪いようです）`
    element.content = fallbackText
    return { retried: false, newContent: fallbackText }
  }

  it('retries up to maxRetries times with alternate seed instead of instantly destroying content', () => {
    const talk: TalkElement = {
      Id: 1,
      Name: 'カリン',
      type: 0,
      content: 'https://image.pollinations.ai/prompt/test?seed=111'
    }

    // First failure -> attempt 1 retry
    const res1 = handleImageErrorWithRetry(talk, { maxRetries: 2 })
    expect(res1.retried).toBe(true)
    expect(talk.content).toContain('https://image.pollinations.ai/prompt/test')
    expect(talk.content).toContain('&retry=1')
    expect(talk._imageRetryCount).toBe(1)

    // Second failure -> attempt 2 retry
    const res2 = handleImageErrorWithRetry(talk, { maxRetries: 2 })
    expect(res2.retried).toBe(true)
    expect(talk.content).toContain('&retry=2')
    expect(talk._imageRetryCount).toBe(2)

    // Third failure -> retries exhausted, fall back to friendly message
    const res3 = handleImageErrorWithRetry(talk, { maxRetries: 2 })
    expect(res3.retried).toBe(false)
    expect(talk.content).toContain('カリン: 写真の送受信に失敗しました')
    expect(talk._originalPhotoUrl).toBe('https://image.pollinations.ai/prompt/test?seed=111')
  })
})
