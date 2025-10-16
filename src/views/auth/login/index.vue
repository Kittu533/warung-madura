<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import LoginForm from '@/components/ui/login-form.vue'
import HeroSection from '@/components/ui/hero-section.vue'
import AppLogo from '@/components/ui/app-logo.vue'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  errorMsg.value = ''

  if (!username.value || !password.value) {
    errorMsg.value = 'Username dan password diperlukan'
    return
  }

  try {
    isLoading.value = true
    await auth.login({
      email: username.value,
      password: password.value
    })

    // redirect ke dashboard
    router.push('/dashboard')
  } catch (err) {
    errorMsg.value = auth.error || 'Login gagal. Periksa kredensial Anda.'
  } finally {
    isLoading.value = false
  }
}
</script>


<template>
  <!-- FULL SCREEN LAYOUT -->
  <main class="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2 bg-neutral-100">
    <!-- LEFT: HERO (tetap stabil, tidak mengubah layout) -->
    <section class="hidden lg:block h-screen overflow-hidden">
      <HeroSection class="h-full w-full rounded-none shadow-none" />
    </section>

    <!-- RIGHT: LOGIN (scrollable kalau lebih tinggi dari viewport) -->
    <section class="h-screen overflow-auto flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-md">
        <div class="flex items-center justify-end mb-6">
          <AppLogo />
        </div>

        <header>
          <h2 class="text-2xl md:text-3xl font-semibold tracking-tight">Selamat Datang di MASPOS</h2>
          <p class="mt-2 text-neutral-600">
            Masuk untuk mengelola bisnis Anda dengan mudah dan efisien. MASPOS menghadirkan solusi
            point-of-sale terbaik untuk kemudahan operasional sehari-hari.
          </p>
        </header>

        <div v-if="errorMsg" class="mt-6 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {{ errorMsg }}
        </div>

        <div class="mt-8">
          <LoginForm
            v-model:username="username"
            v-model:password="password"
            :loading="isLoading"
            @submit="handleLogin"
          />
        </div>
      </div>
    </section>
  </main>
</template>
