<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="h-screen flex flex-col items-center justify-center p-4">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 class="text-2xl font-semibold mb-2">Halaman Tidak Ditemukan</h2>
      <p class="text-gray-500 mb-6">Maaf, halaman yang Anda cari tidak dapat ditemukan.</p>
      
      <div class="flex gap-4 justify-center">
        <button 
          @click="goBack" 
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
        >
          Kembali
        </button>
        
        <button 
          @click="goHome" 
          class="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-md transition-colors"
        >
          Ke Beranda
        </button>
      </div>
    </div>
  </div>
</template>