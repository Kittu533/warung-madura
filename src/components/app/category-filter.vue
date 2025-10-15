<script setup>
import { ref, onMounted } from 'vue'
import { useCategoriesStore } from '@/stores/categories.store'

const categoriesStore = useCategoriesStore()
const selected = ref('all')
const emit = defineEmits(['change'])

const loading = ref(true)

onMounted(async () => {
  try {
    loading.value = true
    await categoriesStore.fetchCategories()
  } finally {
    loading.value = false
  }
})

const handleSelect = (id) => {
  selected.value = id
  emit('change', id === 'all' ? null : id)
}
</script>

<template>
  <div
    class="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide py-1"
  >
    <!-- Saat Loading -->
    <template v-if="loading">
      <div
        v-for="n in 6"
        :key="n"
        class="h-8 w-20 rounded-full bg-gray-200 animate-pulse"
      ></div>
    </template>

    <!-- Saat Data Sudah Ada -->
    <template v-else>
      <button
        :class="[
          'px-4 py-1.5 rounded-full text-sm font-medium transition',
          selected === 'all'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
        ]"
        @click="handleSelect('all')"
      >
        Semua
      </button>

      <button
        v-for="cat in categoriesStore.list"
        :key="cat.id"
        :class="[
          'px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap',
          selected === cat.id
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
        ]"
        @click="handleSelect(cat.id)"
      >
        {{ cat.name }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
