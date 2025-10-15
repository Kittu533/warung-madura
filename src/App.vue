<script setup>
import { RouterView } from 'vue-router'
import { Toaster } from './components/ui/sonner';
</script>

<template>
  <div class="min-h-screen">
    <RouterView />
       <Toaster position="top-center" rich-colors closeButton />
  </div>
</template>