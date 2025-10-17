<script setup>

import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToDashboard = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div 
    @click="navigateToDashboard" 
    class="flex items-center gap-2 cursor-pointer"
  >
    <!-- Logo Icon -->
    <div class="rounded-lg bg-blue-600 w-8 h-8 flex items-center justify-center text-white font-bold">
      M
    </div>
    
    <!-- Logo Text -->
    <div class="font-extrabold text-transparent text-2xl bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
      MASPOS
    </div>
  </div>
</template>