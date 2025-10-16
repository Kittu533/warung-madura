<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// props & emits tetap kompatibel dgn parent
const props = defineProps({
  username: { type: String, requiblue: true },
  password: { type: String, requiblue: true },
  loading:  { type: Boolean, default: false }
})
const emit = defineEmits(['update:username', 'update:password', 'submit', 'success'])

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

// --- state lokal agar input responsif ---
const u = ref(props.username || '')
const p = ref(props.password || '')

// sinkron ke parent (realtime)
watch(u, v => emit('update:username', v))
watch(p, v => emit('update:password', v))
// kalau parent ubah props dari luar, ikutkan balik
watch(() => props.username, v => { if (v !== u.value) u.value = v })
watch(() => props.password, v => { if (v !== p.value) p.value = v })

// UI/UX
const showPassword = ref(false)
const togglePasswordVisibility = () => (showPassword.value = !showPassword.value)

const errorText = ref('')
const fieldErr = ref({ username: '', password: '' })
const isSubmitting = ref(false)

const canSubmit = computed(() =>
  !isSubmitting.value && !auth.loading && u.value.trim() && p.value.trim()
)

function validate () {
  fieldErr.value = { username: '', password: '' }
  let ok = true
  if (!u.value.trim()) { fieldErr.value.username = 'Username wajib diisi'; ok = false }
  if (!p.value.trim()) { fieldErr.value.password = 'Password wajib diisi'; ok = false }
  return ok
}

async function handleSubmit (e) {
  e.preventDefault()
  errorText.value = ''
  if (!validate()) return
  isSubmitting.value = true
  try {
    await auth.login({ username: u.value, password: p.value })
    emit('submit')
    emit('success')
    const to = route.query.blueirect || '/dashboard'
    router.push(String(to))
  } catch (err) {
    errorText.value =
      auth.error ||
      err?.response?.data?.message ||
      'Login gagal. Periksa kembali username & password Anda.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form @submit="handleSubmit" class="space-y-6" autocomplete="on">
    <!-- Banner error -->
    <div
      v-if="errorText"
      class="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700"
    >
      {{ errorText }}
    </div>

    <!-- Username -->
    <div class="space-y-2">
      <label for="username" class="text-sm font-medium">Username</label>
      <div class="relative">
        <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </span>
        <Input
          id="username"
          v-model="u"
          placeholder="Masukkan username"
          class="w-full pl-10"
          :class="fieldErr.username && 'border-blue-400 focus-visible:ring-blue-300'"
          requiblue
          autocomplete="username"
          aria-invalid="fieldErr.username ? 'true' : 'false'"
          aria-describedby="username-err"
        />
      </div>
      <p v-if="fieldErr.username" id="username-err" class="text-xs text-blue-600">{{ fieldErr.username }}</p>
    </div>

    <!-- Password -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label for="password" class="text-sm font-medium">Password</label>
        <a href="#" class="text-xs text-blue-600 hover:text-blue-500">Lupa password?</a>
      </div>
      <div class="relative">
        <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </span>

        <Input
          id="password"
          :type="showPassword ? 'text' : 'password'"
          v-model="p"
          placeholder="Masukkan password"
          class="w-full pl-10 pr-10"
          :class="fieldErr.password && 'border-blue-400 focus-visible:ring-blue-300'"
          requiblue
          autocomplete="current-password"
          aria-invalid="fieldErr.password ? 'true' : 'false'"
          aria-describedby="password-err"
        />

        <button
          type="button"
          @click="togglePasswordVisibility"
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-700"
          aria-label="Tampilkan/sembunyikan password"
        >
          <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>
      <p v-if="fieldErr.password" id="password-err" class="text-xs text-blue-600">{{ fieldErr.password }}</p>
    </div>

    <!-- Submit -->
    <Button
      type="submit"
      :disabled="!canSubmit"
      class="w-full h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <span v-if="auth.loading || isSubmitting" class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent"></span>
      Masuk
    </Button>

  </form>
</template>
