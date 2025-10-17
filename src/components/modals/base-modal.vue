<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: '' },
  message: { type: String, default: '' },

  mode: { type: String, default: 'info' },

  confirmText: { type: String, default: 'OK' },
  cancelText: { type: String, default: 'Batal' },
  closeText: { type: String, default: 'Tutup' },

  loading: { type: Boolean, default: false },
  size: { type: String, default: 'md' }, 
  showClose: { type: Boolean, default: true }, 
  closeOnBackdrop: { type: Boolean, default: true }, 
  closeOnEsc: { type: Boolean, default: true },
})

const emit = defineEmits(['close', 'confirm', 'cancel'])

const sizeClass = computed(() => ({
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
}[props.size] || 'max-w-md'))

const color = computed(() => {
  if (props.mode === 'confirm') return { bg: 'bg-gray-50', text: 'text-gray-600', button: 'bg-red-600' }
  if (props.mode === 'success') return { bg: 'bg-gray-50', text: 'text-gray-600', button: 'bg-green-600' }
  return { bg: 'bg-gray-50', text: 'text-gray-600', button: 'bg-blue-600' } // info
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
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="closeOnBackdrop && emit('close')"
  >
    <div
      class="w-full animate-fade-in rounded-lg bg-white shadow-xl mx-4"
      :class="sizeClass"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100">
        <div class="flex justify-between items-center">
          <h3 v-if="title" class="text-lg font-medium text-gray-800">{{ title }}</h3>
          <button
            v-if="showClose"
            class="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            @click="emit('close')"
            aria-label="Tutup"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="px-6 py-4">
        <p v-if="message" class="mb-4 text-gray-600">{{ message }}</p>
        <slot />
      </div>

      <!-- Footer -->
      <div 
        class="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-3" 
        v-if="$slots.footer || mode !== 'form'"
      >
        <!-- Custom footer -->
        <slot name="footer" />

        <!-- Default footers -->
        <template v-if="!$slots.footer">
          <template v-if="mode === 'confirm'">
            <button
              @click="emit('cancel')"
              class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors disabled:opacity-60"
              :disabled="loading"
            >
              {{ cancelText }}
            </button>
            <button
              @click="emit('confirm')"
              class="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors disabled:opacity-60"
              :disabled="loading"
            >
              {{ loading ? 'Memproses...' : confirmText }}
            </button>
          </template>

          <template v-else-if="mode === 'info' || mode === 'success'">
            <button
              @click="emit('close')"
              :class="`px-4 py-2 ${color.button} text-white font-medium rounded hover:opacity-90 transition-colors`"
            >
              {{ closeText }}
            </button>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.98) }
  to   { opacity: 1; transform: scale(1) }
}
.animate-fade-in { animation: fade-in 0.2s ease-out }
</style>