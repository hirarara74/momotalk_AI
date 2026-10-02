<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { store } from '@/assets/storeUtils/store'
import { resolveCanonicalStudent } from '@/assets/ai/prompts'

const zoom = ref(1)
const isDownloading = ref(false)
const hasLoadError = ref(false)

const displayStudentName = computed(() => {
  const name = store.modalStudentName
  if (!name) return ''
  const canonical = resolveCanonicalStudent(name)
  if (canonical && canonical.names) {
    const lang = store.language || 'jp'
    const names = (canonical.names as any)[lang] || canonical.names.jp
    if (names && names[0]) return names[0]
  }
  return name
})

const photoTitle = computed(() => {
  const name = displayStudentName.value
  return name ? `📷 ${name}` : '📷 Photo'
})

const closeModal = () => {
  store.showImageModal = false
  store.modalImageUrl = ''
  store.modalStudentName = ''
  zoom.value = 1
  hasLoadError.value = false
}

const zoomIn = () => {
  if (zoom.value < 3) {
    zoom.value = Math.min(3, +(zoom.value + 0.25).toFixed(2))
  }
}

const zoomOut = () => {
  if (zoom.value > 0.5) {
    zoom.value = Math.max(0.5, +(zoom.value - 0.25).toFixed(2))
  }
}

const resetZoom = () => {
  zoom.value = 1
}

const handleWheel = (e: WheelEvent) => {
  if (e.deltaY < 0) {
    zoomIn()
  } else if (e.deltaY > 0) {
    zoomOut()
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && store.showImageModal) {
    closeModal()
  }
}

const handleDownload = async () => {
  if (!store.modalImageUrl || isDownloading.value) return
  isDownloading.value = true

  try {
    const rawName = store.modalStudentName || 'student'
    const safeName = rawName.replace(/[/\\?%*:|"<>]/g, '_')
    const fileName = `${safeName}_photo_${Date.now()}.jpg`

    try {
      const response = await fetch(store.modalImageUrl, { mode: 'cors' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
    } catch {
      // Fallback in case of fetch/CORS restriction
      const link = document.createElement('a')
      link.href = store.modalImageUrl
      link.target = '_blank'
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  } catch (err) {
    console.error('[ImageModalViewer] Failed to save photo:', err)
  } finally {
    isDownloading.value = false
  }
}

watch(
  () => store.showImageModal,
  (newVal) => {
    if (newVal) {
      zoom.value = 1
    }
  }
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <transition name="modal-fade">
    <div
      v-if="store.showImageModal"
      class="photo-modal-mask"
      @click="closeModal"
    >
      <div
        class="photo-modal-container"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="photo-modal-header">
          <div class="photo-modal-title">
            <span class="camera-badge">📷</span>
            <span class="title-text">{{ photoTitle }}</span>
          </div>
          <button
            class="photo-modal-close-btn"
            @click="closeModal"
            title="閉じる"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <!-- Modal Body / Photo Viewport -->
        <div
          class="photo-modal-body"
          @wheel.prevent="handleWheel"
        >
          <div class="photo-viewport">
            <div v-if="hasLoadError" class="photo-load-error">
              <span class="error-icon">⚠️</span>
              <p class="error-msg">画像を読み込めませんでした（通信エラーまたは提供元の制限）</p>
            </div>
            <img
              v-else-if="store.modalImageUrl"
              :src="store.modalImageUrl"
              :alt="displayStudentName || 'Student Photo'"
              class="photo-modal-img"
              referrerpolicy="no-referrer"
              :style="{ transform: `scale(${zoom})` }"
              draggable="false"
              @error="hasLoadError = true"
            />
          </div>
        </div>

        <!-- Modal Footer / Controls -->
        <div class="photo-modal-footer">
          <div class="zoom-controls">
            <button
              class="control-btn"
              @click="zoomOut"
              :disabled="zoom <= 0.5"
              title="Zoom Out"
            >
              −
            </button>
            <button
              class="control-btn zoom-indicator"
              @click="resetZoom"
              title="Reset Zoom"
            >
              {{ Math.round(zoom * 100) }}%
            </button>
            <button
              class="control-btn"
              @click="zoomIn"
              :disabled="zoom >= 3"
              title="Zoom In"
            >
              +
            </button>
          </div>

          <div class="action-controls">
            <button
              class="save-btn"
              @click="handleDownload"
              :disabled="isDownloading"
            >
              <span class="save-icon">💾</span>
              <span class="save-text">{{ $t('savePhoto') || '保存' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
.photo-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.82);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 16px;
  box-sizing: border-box;
}

.photo-modal-container {
  display: flex;
  flex-direction: column;
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6);
  max-width: 92vw;
  max-height: 92vh;
  width: 720px;
  overflow: hidden;
  animation: modal-pop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.photo-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background-color: #0f172a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .photo-modal-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #f1f5f9;
    user-select: none;

    .camera-badge {
      font-size: 17px;
    }

    .title-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 500px;
    }
  }

  .photo-modal-close-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 18px;
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: #f8fafc;
    }

    &:active {
      transform: scale(0.92);
    }
  }
}

.photo-modal-body {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #090d16;
  min-height: 280px;
  max-height: calc(92vh - 120px);
  overflow: hidden;
  user-select: none;
  cursor: grab;

  .photo-viewport {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 12px;
    box-sizing: border-box;

    .photo-modal-img {
      max-width: 100%;
      max-height: calc(92vh - 150px);
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      transition: transform 0.12s ease-out;
      pointer-events: auto;
    }
  }
}

.photo-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 18px;
  background-color: #0f172a;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  gap: 12px;
  flex-wrap: wrap;

  .zoom-controls {
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: rgba(255, 255, 255, 0.06);
    padding: 3px;
    border-radius: 8px;

    .control-btn {
      background: transparent;
      border: none;
      color: #cbd5e1;
      font-size: 15px;
      font-weight: 600;
      min-width: 32px;
      height: 28px;
      padding: 0 6px;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.15s ease, color 0.15s ease;

      &:hover:not(:disabled) {
        background-color: rgba(255, 255, 255, 0.12);
        color: #ffffff;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      &.zoom-indicator {
        font-size: 13px;
        min-width: 48px;
      }
    }
  }

  .action-controls {
    display: flex;
    align-items: center;

    .save-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background-color: #2563eb;
      color: #ffffff;
      border: none;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.15s ease, transform 0.1s ease;

      &:hover:not(:disabled) {
        background-color: #1d4ed8;
      }

      &:active:not(:disabled) {
        transform: scale(0.96);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .save-icon {
        font-size: 15px;
      }
    }
  }
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes modal-pop {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.photo-load-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #ff8585;
  text-align: center;

  .error-icon {
    font-size: 36px;
    margin-bottom: 12px;
  }

  .error-msg {
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .photo-modal-mask {
    padding: 8px;
  }

  .photo-modal-container {
    width: 100%;
    max-width: 100vw;
  }

  .photo-modal-header {
    padding: 10px 14px;

    .photo-modal-title .title-text {
      max-width: 240px;
      font-size: 14px;
    }
  }

  .photo-modal-footer {
    padding: 8px 12px;
  }
}
</style>
