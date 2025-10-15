<script setup>
import { computed } from 'vue'
import { useProductsStore } from '@/stores/products.store'

const productsStore = useProductsStore()

// hitung total harga semua produk
const totalPrice = computed(() =>
  productsStore.list.reduce((sum, item) => sum + item.price, 0)
)
</script>

<template>
  <div class="bg-white shadow rounded-xl p-4 flex justify-between items-center">
    <h2 class="text-gray-700 font-semibold">Total Produk</h2>
    <div class="text-right">
      <p class="text-lg font-bold text-blue-600">
        Rp {{ totalPrice.toLocaleString() }}
      </p>
      <p class="text-sm text-gray-400">
        {{ productsStore.list.length }} item
      </p>
    </div>
  </div>
</template>
