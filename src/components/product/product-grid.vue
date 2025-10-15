<script setup>
import ProductCard from '@/components/product/product-card.vue'

const props = defineProps({
  products: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add-to-cart', 'delete-product'])

// Create an array for skeleton placeholders
const skeletonCount = 10 // Number of skeleton cards to show while loading
const skeletonArray = Array(skeletonCount).fill(null)
</script>

<template>
  <div>
    <!-- Loading Skeleton -->
    <div 
      v-if="loading" 
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
    >
      <div 
        v-for="(_, index) in skeletonArray" 
        :key="'skeleton-' + index"
        class="bg-white rounded-xl shadow p-3 flex flex-col animate-pulse"
      >
        <!-- Image skeleton -->
        <div class="w-full h-40 bg-gray-200 rounded-md"></div>
        
        <!-- Title skeleton -->
        <div class="mt-3 w-3/4 h-5 bg-gray-200 rounded"></div>
        
        <!-- Price skeleton -->
        <div class="mt-2 w-1/2 h-4 bg-gray-200 rounded"></div>
        
        <!-- Button skeleton -->
        <div class="mt-auto w-full h-9 bg-gray-200 rounded-md"></div>
      </div>
    </div>
    
    <!-- Actual Product Grid -->
    <div 
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
    >
      <ProductCard
        v-for="p in products"
        :key="p.id"
        :product="p"
        @add-to-cart="$emit('add-to-cart', p)"
        @delete-product="$emit('delete-product', p)"
      />
      
      <!-- Empty State -->
      <div 
        v-if="!loading && products.length === 0" 
        class="col-span-full flex flex-col items-center justify-center py-10 text-gray-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M4 11h16M4 15h8" />
        </svg>
        <p class="text-lg font-medium">Tidak ada produk</p>
        <p class="text-sm text-gray-400 mt-1">Tambahkan produk atau ubah filter pencarian</p>
      </div>
    </div>
  </div>
</template>