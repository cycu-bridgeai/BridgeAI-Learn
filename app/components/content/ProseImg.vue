<script setup lang="ts">
const props = defineProps<{
  src?: string
  alt?: string
}>()

const config = useRuntimeConfig()
const isOpen = ref(false)
const scale = ref(1)
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const hasDragged = ref(false)
const lastMouse = ref({ x: 0, y: 0 })

const resolvedSrc = computed(() => {
  const src = props.src || ''

  if (!src || config.app.baseURL === '/')
    return src

  if (/^(?:[a-z]+:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('#'))
    return src

  if (src.startsWith(config.app.baseURL))
    return src

  if (!src.startsWith('/'))
    return src

  return `${config.app.baseURL.replace(/\/$/, '')}${src}`
})

function open() {
  scale.value = 1
  panX.value = 0
  panY.value = 0
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  scale.value = Math.min(5, Math.max(0.5, scale.value + (e.deltaY > 0 ? -0.2 : 0.2)))

  if (scale.value <= 1) {
    panX.value = 0
    panY.value = 0
  }
}

function onMouseDown(e: MouseEvent) {
  hasDragged.value = false
  if (scale.value <= 1)
    return

  e.preventDefault()
  isDragging.value = true
  lastMouse.value = { x: e.clientX, y: e.clientY }
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value)
    return

  const dx = e.clientX - lastMouse.value.x
  const dy = e.clientY - lastMouse.value.y
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3)
    hasDragged.value = true

  panX.value += dx
  panY.value += dy
  lastMouse.value = { x: e.clientX, y: e.clientY }
}

function onMouseUp() {
  isDragging.value = false
}

function onOverlayClick(e: MouseEvent) {
  if (hasDragged.value)
    return

  if (e.target === e.currentTarget)
    close()
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape')
    close()
}

const imgTransform = computed(() =>
  `scale(${scale.value}) translate(${panX.value / scale.value}px, ${panY.value / scale.value}px)`,
)

const overlayCursor = computed(() => {
  if (scale.value <= 1)
    return 'zoom-out'

  return isDragging.value ? 'grabbing' : 'grab'
})
</script>

<template>
  <span class="inline-block">
    <img
      v-bind="$attrs"
      :src="resolvedSrc"
      :alt="alt || ''"
      class="prose-zoomable"
      @click="open"
    >

    <ClientOnly>
      <Teleport to="body">
        <div
          v-show="isOpen"
          class="lightbox-overlay"
          :style="{ cursor: overlayCursor }"
          tabindex="-1"
          @click="onOverlayClick"
          @keydown="onKey"
          @wheel.prevent="onWheel"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
        >
          <img
            :src="resolvedSrc"
            :alt="alt || ''"
            class="lightbox-img"
            :style="{ transform: imgTransform }"
            @click.stop
            @dragstart.prevent
          >

          <div class="lightbox-hint">
            滾輪縮放 · 放大後可拖曳移動 · 點擊背景關閉
          </div>
        </div>
      </Teleport>
    </ClientOnly>
  </span>
</template>

<style scoped>
.prose-zoomable {
  cursor: zoom-in;
  transition: opacity 0.2s;
}

.prose-zoomable:hover {
  opacity: 0.88;
}

.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.84);
  outline: none;
  user-select: none;
}

.lightbox-img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 0.75rem;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
  cursor: inherit;
  transition: transform 0.1s ease;
  pointer-events: none;
}

.lightbox-hint {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.75rem;
  pointer-events: none;
  white-space: nowrap;
}
</style>
