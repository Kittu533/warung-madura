<script setup>
const props = defineProps({
  total: String,
  items: Number
})
</script>

<template>
  <div
    class="bg-white shadow-sm border rounded-xl px-6 py-4 flex items-center justify-between"
  >
    <h2 class="text-gray-700 font-medium">Total Tagihan</h2>
    <div class="text-right">
      <p class="text-blue-700 font-bold text-lg">{{ total }}</p>
      <p class="text-sm text-gray-400">{{ items }} item</p>
    </div>
  </div>
</template>
