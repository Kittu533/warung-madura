<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: '' },
  message: { type: String, default: '' },

  // info | confirm | form | success
  mode: { type: String, default: 'info' },

  confirmText: { type: String, default: 'OK' },
  cancelText: { type: String, default: 'Batal' },
  closeText: { type: String, default: 'Tutup' },

  loading: { type: Boolean, default: false },
  size: { type: String, default: 'md' }, // sm | md | lg
  showClose: { type: Boolean, default: true }, // tombol X
  closeOnBackdrop: { type: Boolean, default: true }, // klik di luar untuk tutup
  closeOnEsc: { type: Boolean, default: true },
})

const emit = defineEmits(['close', 'confirm', 'cancel'])

const sizeClass = computed(() => ({
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
}[props.size] || 'max-w-md'))

const color = computed(() => {
  if (props.mode === 'confirm') return { bg: 'bg-red-100', text: 'text-red-600' }
  if (props.mode === 'success') return { bg: 'bg-green-100', text: 'text-green-600' }
  return { bg: 'bg-blue-100', text: 'text-blue-600' } // info
})

const iconPath = computed(() => {
  switch (props.mode) {
    case 'confirm': return 'M9 3h6a1 1 0 0 1 1 1v1h4v2h-1v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7H4V5h4V4a1 1 0 0 1 1-1zM9 9h2v8H9V9zm4 0h2v8h-2V9z'
    case 'success': return 'M9 16.2l-3.5-3.6L4 14.1l5 5 11-11-1.5-1.4z'
    default:        return 'M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z'
  }
})

function onKeydown(e) {
  if (!props.show || !props.closeOnEsc) return
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    @click.self="closeOnBackdrop && emit('close')"
  >
    <div
      class="w-full animate-fade-in rounded-2xl bg-white p-6 shadow-xl mx-4"
      :class="sizeClass"
      role="dialog"
      aria-modal="true"
    >
      <!-- Close (X) -->
      <button
        v-if="showClose"
        class="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        @click="emit('close')"
        aria-label="Tutup"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.225 4.811L4.811 6.225 10.586 12l-5.775 5.775 1.414 1.414L12 13.414l5.775 5.775 1.414-1.414L13.414 12l5.775-5.775-1.414-1.414L12 10.586 6.225 4.811z"/>
        </svg>
      </button>

      <!-- Header -->
      <header v-if="title || message || mode !== 'form'" class="mb-4 flex items-start gap-3">
        <div v-if="mode !== 'form'" :class="[color.bg, color.text, 'rounded-full p-3 shrink-0']">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path :d="iconPath" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 v-if="title" class="text-lg font-semibold text-gray-800">{{ title }}</h3>
          <p v-if="message" class="mt-1 text-sm text-gray-500">{{ message }}</p>
        </div>
      </header>

      <!-- Body -->
      <section>
        <slot />
      </section>

      <!-- Footer -->
      <footer class="mt-6 flex justify-end gap-3" v-if="$slots.footer || mode !== 'form'">
        <!-- Custom footer -->
        <slot name="footer" />

        <!-- Default footers -->
        <template v-if="!$slots.footer">
          <template v-if="mode === 'confirm'">
            <button
              @click="emit('cancel')"
              class="rounded-lg border border-red-500 px-5 py-2 font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-60"
              :disabled="loading"
            >
              {{ cancelText }}
            </button>
            <button
              @click="emit('confirm')"
              class="rounded-lg bg-red-600 px-5 py-2 font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
              :disabled="loading"
            >
              {{ loading ? 'Memproses...' : confirmText }}
            </button>
          </template>

          <template v-else-if="mode === 'info' || mode === 'success'">
            <button
              @click="emit('close')"
              class="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700"
            >
              {{ closeText }}
            </button>
          </template>
        </template>
      </footer>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95) }
  to   { opacity: 1; transform: scale(1) }
}
.animate-fade-in { animation: fade-in 0.15s ease-out }
</style>
