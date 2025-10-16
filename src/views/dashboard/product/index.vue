<script setup>
import { ref, onMounted, computed, h, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products.store'
import { useCategoriesStore } from '@/stores/categories.store'
import AppHeader from '@/components/app/app-header.vue'
import BaseModal from '@/components/modals/base-modal.vue'
import DataTable from '@/components/ui/data-table.vue'
import { Toaster, toast } from 'vue-sonner'
import 'vue-sonner/style.css'

const router = useRouter()
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

/* ------------ UI/List state ------------ */
const loading = ref(false)
const submitLoading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref(null)

/* ------------ Modal (DRY) ------------ 
  formMode: 'add' | 'edit' | null
*/
const formMode = ref(null)
const showFormModal = ref(false)
const showDeleteModal = ref(false)

/* ------------ Form (DRY) ------------ */
const productForm = ref({
  id: null,
  name: '',
  price: '',
  category_id: ''
})
const errors = ref({})

/* ------------ Image (DRY) ------------ */
const fileInputRef = ref(null)
const imageFile = ref(null)
const imagePreview = ref(null)

/* ------------ Delete ------------ */
const productToDelete = ref(null)

/* ------------ Table state ------------ */
const pageIndex = ref(0)
const pageSize = ref(10)
const sortState = ref({ id: 'name', desc: false })

/* ------------ Data ------------ */
const products = computed(() => productsStore.list || [])
const totalRows = computed(() => productsStore.total || 0)
const categories = computed(() => categoriesStore.list || [])

/* ------------ Helpers ------------ */
const formatPrice = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price ?? 0)

const getCategoryName = (categoryId) => categories.value.find(c => c.id === categoryId)?.name || 'Tidak ada kategori'

/* ------------ Columns ------------ */
const productColumns = [
  {
    accessorKey: 'product',
    header: 'Produk',
    enableSorting: true,
    id: 'name',
    accessorFn: row => row.name,
    cell: (info) => {
      const p = info.row.original
      return h('div', { class: 'flex items-center' }, [
        h('div', { class: 'h-10 w-10 flex-shrink-0' }, [
          p.picture_url
            ? h('img', { src: p.picture_url, alt: '', class: 'h-10 w-10 rounded-md object-cover' })
            : h('div', { class: 'h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center' }, [
                h('svg', {
                  class: 'h-6 w-6 text-gray-400', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor'
                }, [
                  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
                    d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' })
                ])
              ])
        ]),
        h('div', { class: 'ml-4' }, [
          h('div', { class: 'text-sm font-medium text-gray-900' }, p.name)
        ])
      ])
    }
  },
  {
    accessorKey: 'price',
    header: 'Harga',
    enableSorting: true,
    id: 'price',
    cell: (info) => formatPrice(info.row.original.price)
  },
  {
    accessorKey: 'category_id',
    header: 'Kategori',
    enableSorting: true,
    id: 'category',
    accessorFn: row => getCategoryName(row.category_id),
    cell: (info) => h(
      'span',
      { class: 'inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800' },
      getCategoryName(info.row.original.category_id)
    )
  },
  {
    id: 'actions',
    header: 'Aksi',
    enableSorting: false,
    cell: (info) => h('div', { class: 'text-left' }, [
      h('button', {
        class: 'mr-4 text-blue-600 hover:text-blue-900',
        onClick: (e) => { e.stopPropagation(); openForm('edit', info.row.original) }
      }, 'Edit'),
      h('button', {
        class: 'text-red-600 hover:text-red-900',
        onClick: (e) => { e.stopPropagation(); openDelete(info.row.original) }
      }, 'Hapus')
    ])
  }
]

/* ------------ Fetchers ------------ */
async function fetchProducts() {
  loading.value = true
  try {
    await productsStore.fetchProducts({
      page: pageIndex.value + 1,
      limit: pageSize.value,
      sort: sortState.value?.id || 'name',
      order: sortState.value?.desc ? 'desc' : 'asc',
      search: searchQuery.value?.trim() || '',
      categoryId: selectedCategory.value || ''
    })
  } catch {
    toast.error('Gagal memuat daftar produk')
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    await categoriesStore.fetchCategories()
  } catch {
    toast.error('Gagal memuat kategori')
  }
}

/* ------------ Lifecycle ------------ */
onMounted(async () => {
  await Promise.all([fetchCategories(), fetchProducts()])
})

/* debounce search */
let searchTimer
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pageIndex.value = 0
    fetchProducts()
  }, 300)
})

watch(selectedCategory, () => { pageIndex.value = 0; fetchProducts() })
watch(sortState, () => { pageIndex.value = 0; fetchProducts() })
watch(pageIndex, () => { fetchProducts() })

/* ------------ Header handlers ------------ */
const handleSearch = (q) => { searchQuery.value = q }
const handleSelectCategory = (catId) => { selectedCategory.value = catId }

/* ------------ Modal open/close (DRY) ------------ */
const resetForm = () => {
  productForm.value = { id: null, name: '', price: '', category_id: '' }
  errors.value = {}
  imageFile.value = null
  imagePreview.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const openForm = (mode, product = null) => {
  formMode.value = mode // 'add' | 'edit'
  if (mode === 'edit' && product) {
    productForm.value = {
      id: product.id,
      name: product.name,
      price: product.price,
      category_id: product.category_id
    }
    imagePreview.value = product.picture_url || null
    imageFile.value = null
    if (fileInputRef.value) fileInputRef.value.value = ''
  } else {
    resetForm()
  }
  showFormModal.value = true
}
const closeForm = () => { showFormModal.value = false }

const openDelete = (product) => { productToDelete.value = product; showDeleteModal.value = true }

/* ------------ Image handlers (DRY) ------------ */
const handleImageChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  imageFile.value = file
  const reader = new FileReader()
  reader.onload = () => { imagePreview.value = reader.result }
  reader.readAsDataURL(file)
}
const removeSelectedImage = () => {
  imageFile.value = null
  imagePreview.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

/* ------------ Validation (DRY) ------------ */
const validate = () => {
  const f = productForm.value
  const errs = {}
  if (!f.name?.trim()) errs.name = 'Nama produk wajib'
  if (!f.price || Number(f.price) <= 0) errs.price = 'Harga harus > 0'
  if (!f.category_id) errs.category_id = 'Pilih kategori'
  errors.value = errs
  return Object.keys(errs).length === 0
}

/* ------------ Submit (DRY) ------------ */
const buildPayload = () => {
  // backend kamu menerima multipart utk gambar
  const payload = new FormData()
  payload.append('name', productForm.value.name)
  payload.append('price', String(productForm.value.price))
  payload.append('category_id', String(productForm.value.category_id))
  if (imageFile.value) payload.append('picture', imageFile.value)
  return payload
}

const submitProduct = async () => {
  if (!validate()) {
    toast.error('Periksa kembali form')
    return
  }
  submitLoading.value = true
  try {
    if (formMode.value === 'add') {
      await toast.promise(productsStore.addProduct(buildPayload()), {
        loading: 'Menyimpan produk...',
        success: 'Produk berhasil ditambahkan',
        error: 'Gagal menambahkan produk'
      })
      pageIndex.value = 0
    } else if (formMode.value === 'edit' && productForm.value.id != null) {
      await toast.promise(productsStore.updateProduct(productForm.value.id, buildPayload()), {
        loading: 'Memperbarui produk...',
        success: 'Produk berhasil diperbarui',
        error: 'Gagal memperbarui produk'
      })
    }
    closeForm()
    await fetchProducts()
  } catch {
    // sudah ditangani toast.promise
  } finally {
    submitLoading.value = false
  }
}

/* ------------ Delete ------------ */
const confirmDeleteProduct = async () => {
  if (!productToDelete.value) return
  submitLoading.value = true
  try {
    await toast.promise(productsStore.deleteProduct(productToDelete.value.id), {
      loading: 'Menghapus produk...',
      success: 'Produk berhasil dihapus',
      error: 'Gagal menghapus produk'
    })
    showDeleteModal.value = false
    productToDelete.value = null
    if ((totalRows.value - 1) <= pageIndex.value * pageSize.value && pageIndex.value > 0) {
      pageIndex.value = pageIndex.value - 1
    }
    await fetchProducts()
  } catch {
    // toast sudah tampil
  } finally {
    submitLoading.value = false
  }
}

/* ------------ DataTable events ------------ */
const onPageChange = ({ pageIndex: pi }) => { pageIndex.value = pi }
const onSortChange = (s) => { sortState.value = s || { id: 'name', desc: false } }
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Toaster position="top-center" rich-colors closeButton />

    <!-- HEADER -->
    <div class="w-full border-b border-gray-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <AppHeader
          @search="handleSearch"
          @select-category="handleSelectCategory"
          @open-cart="() => router.push('/dashboard/cart')"
        />
      </div>
    </div>

    <!-- MAIN -->
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div class="rounded-xl bg-white p-6 shadow-sm">
        <div class="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 class="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
          <button
            type="button"
            @click="openForm('add')"
            class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <span class="text-lg">＋</span>
            <span>Tambah Produk</span>
          </button>
        </div>

        <DataTable
          :data="products"
          :columns="productColumns"
          :loading="loading"
          :serverMode="true"
          :totalRows="totalRows"
          :pageSize="10"
          :searchValue="searchQuery"
          searchColumn="name"
          className="rounded-xl bg-white"
          emptyMessage="Belum ada produk"
          @pageChange="onPageChange"
          @sortChange="onSortChange"
        >
          <template #empty-action>
            <button
              type="button"
              @click="openForm('add')"
              class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Tambah Produk
            </button>
          </template>
        </DataTable>
      </div>
    </main>

    <!-- ADD/EDIT FORM MODAL (satu modal untuk keduanya) -->
    <BaseModal
      :show="showFormModal"
      :title="formMode === 'add' ? 'Tambah Produk' : 'Edit Produk'"
      mode="form"
      @close="closeForm"
    >
      <form @submit.prevent="submitProduct" class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Nama Produk</label>
          <input
            v-model="productForm.name"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan nama produk"
          />
          <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Harga</label>
            <input
              v-model.number="productForm.price"
              type="number"
              min="0"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
            <p v-if="errors.price" class="mt-1 text-xs text-red-600">{{ errors.price }}</p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Kategori</label>
            <select
              v-model="productForm.category_id"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Pilih kategori</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <p v-if="errors.category_id" class="mt-1 text-xs text-red-600">{{ errors.category_id }}</p>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Gambar (opsional)</label>
          <input ref="fileInputRef" type="file" accept="image/*" @change="handleImageChange" />
          <div v-if="imagePreview" class="mt-2 flex items-center gap-3">
            <img :src="imagePreview" alt="preview" class="h-16 w-16 rounded object-cover" />
            <button type="button" @click="removeSelectedImage" class="text-sm text-red-600 hover:underline">Hapus gambar</button>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="closeForm"
            class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            :disabled="submitLoading"
          >
            Batal
          </button>
          <button
            type="submit"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            :disabled="submitLoading"
          >
            {{ submitLoading ? (formMode === 'add' ? 'Menyimpan...' : 'Memperbarui...') : (formMode === 'add' ? 'Simpan' : 'Perbarui') }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- DELETE MODAL -->
    <BaseModal
      :show="showDeleteModal"
      title="Hapus Produk"
      :message="`Yakin ingin menghapus produk '${productToDelete?.name || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      mode="confirm"
      confirm-text="Hapus"
      cancel-text="Batal"
      :loading="submitLoading"
      @close="showDeleteModal = false"
      @cancel="showDeleteModal = false"
      @confirm="confirmDeleteProduct"
    />
  </div>
</template>
