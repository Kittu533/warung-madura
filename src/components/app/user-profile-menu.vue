<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import api from '@/helper/api'

const user = ref(null)
const loading = ref(true)
const isOpen = ref(false)
const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
  try {
    const res = await api.post('/api/v1/profile')
    user.value = res.data.data
  } catch (err) {
    console.error('[UserProfileMenu] Gagal memuat profil:', err.response?.data || err)
  } finally {
    loading.value = false
  }
})

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/auth/login')
}

const clickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
}
</script>

<template>
  <div class="relative" v-directive:click-outside="closeMenu">
    <!-- Profile Button -->
    <button
      @click="toggleMenu"
      class="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
    >
      <div v-if="loading" class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 animate-pulse"></div>
      <div v-else class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
        {{ user?.name?.charAt(0)?.toUpperCase() || 'P' }}
      </div>
      <span class="hidden lg:block font-medium text-gray-700 text-sm">
        {{ user?.name || 'Pengguna' }}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="hidden lg:block h-4 w-4 text-gray-500 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen && !loading"
        class="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
      >
        <!-- User Info -->
        <div class="px-4 py-3 border-b border-gray-100">
          <p class="text-sm font-semibold text-gray-800 truncate">
            {{ user?.name || 'Pengguna' }}
          </p>
          <p class="text-xs text-gray-500 truncate mt-0.5">
            {{ user?.email || 'email@example.com' }}
          </p>
        </div>

        <!-- Logout -->
        <div class="py-1">
          <button
            @click="handleLogout"
            class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center gap-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Keluar
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

