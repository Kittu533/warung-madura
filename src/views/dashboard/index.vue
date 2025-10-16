<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products.store'
import { useCategoriesStore } from '@/stores/categories.store'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/app/app-header.vue'
import ProductGrid from '@/components/product/product-grid.vue'
import baseModal from '@/components/modals/base-modal.vue'

const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()
const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref(null)
const loading = ref(true)

// Modal state
const showDeleteModal = ref(false)
const productToDelete = ref(null)
const isDeleting = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      productsStore.fetchProducts(),
      categoriesStore.fetchCategories()
    ])
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
})

const filteredProducts = computed(() => {
  return productsStore.list.filter((p) => {
    const matchCategory =
      !selectedCategory.value || p.category_id === selectedCategory.value
    const matchSearch = p.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase())
    return matchCategory && matchSearch
  })
})

// Search and filter handlers
const handleSearch = (q) => {
  searchQuery.value = q
}

const handleSelectCategory = (id) => {
  selectedCategory.value = id
}

// Cart handlers
const handleAddToCart = (product) => {
  productsStore.addToCart(product)
}

// Product handlers
const handleDeleteProduct = (product) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

const confirmDeleteProduct = async () => {
  if (!productToDelete.value) return
  
  isDeleting.value = true
  try {
    await productsStore.deleteProduct(productToDelete.value.id)
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Error deleting product:', error)
  } finally {
    isDeleting.value = false
    showDeleteModal.value = false
    productToDelete.value = null
  }
}

// Navigation handlers
const handleAddProduct = () => {
  router.push('/dashboard/product/index')
}

const handleAddCategory = () => {
  router.push('/dashboard/categories/index')
}

const handleOpenCart = () => {
  router.push('/dashboard/cart')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- HEADER with proper container -->
    <div class="w-full bg-gray-100 border-b border-gray-200">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <AppHeader
        :showSearchBar="true" :showCategoryFilter="true"
          @add-product="handleAddProduct"
          @add-category="handleAddCategory"
          @open-cart="handleOpenCart"
          @search="handleSearch"
          @select-category="handleSelectCategory"
        />
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Loading indicator for filters and other operations -->
      <div v-if="loading && !productsStore.list.length" class="mb-4">
        <div class="bg-blue-50 text-blue-700 px-4 py-2 rounded-md flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Memuat data...</span>
        </div>
      </div>
      
      <ProductGrid
        :products="filteredProducts"
        :loading="loading"
        @add-to-cart="handleAddToCart"
        @delete-product="handleDeleteProduct"
      />
    </main>
    
    <!-- Delete Product Confirmation Modal -->
    <BaseModal
      :show="showDeleteModal"
      title="Hapus Produk"
      :message="`Yakin ingin menghapus produk '${productToDelete?.name || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      mode="confirm"
      confirm-text="Hapus"
      cancel-text="Batal"
      :loading="isDeleting"
      @close="showDeleteModal = false"
      @cancel="showDeleteModal = false"
      @confirm="confirmDeleteProduct"
    />
  </div>
</template>