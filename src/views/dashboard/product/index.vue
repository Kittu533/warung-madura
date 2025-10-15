<script setup>
import { ref, onMounted, computed, h, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products.store'
import { useCategoriesStore } from '@/stores/categories.store'
import AppHeader from '@/components/app/app-header.vue'
import BaseModal from '@/components/modals/base-modal.vue'
import DataTable from '@/components/ui/data-table.vue'

// === Sonner (Toast) ===
import { Toaster, toast } from 'vue-sonner'
import 'vue-sonner/style.css'

const router = useRouter()
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

// --- UI/List state
const loading = ref(false)
const submitLoading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref(null)          // id kategori (number/string) atau null

// --- Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// --- Form states (ADD)
const imageFile = ref(null)
const imageLoading = ref(false)
const imagePreview = ref(null)
const newProduct = ref({
  name: '',
  price: '',
  category_id: ''
})
const errors = ref({})

// --- Form states (EDIT)
const editImageFile = ref(null)
const editImagePreview = ref(null)
const productToEdit = ref(null)

// --- Delete
const productToDelete = ref(null)

// --- Template refs
const fileInputRef = ref(null)
const editFileInputRef = ref(null)

// --- Table state (server-side)
const pageIndex = ref(0)                     // 0-based
const pageSize = ref(10)                     // kunci 10 baris/halaman
const sortState = ref({ id: 'name', desc: false })

// --- Sumber data
const products = computed(() => productsStore.list || [])
const totalRows = computed(() => productsStore.total || 0)
const categories = computed(() => categoriesStore.list || [])

// --- Helpers
const formatPrice = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price ?? 0)

const getCategoryName = (categoryId) => {
  const cat = categories.value.find(c => c.id === categoryId)
  return cat?.name || 'Tidak ada kategori'
}

// --- Columns untuk DataTable
const productColumns = [
  {
    accessorKey: 'product',
    header: 'Produk',
    enableSorting: true,              // sort by name (lihat accessorFn)
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
                    h('path', {
                      'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
                      d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                    })
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
    cell: (info) =>
      h('span', { class: 'inline-flex rounded-full bg-indigo-100 px-2 text-xs font-semibold leading-5 text-indigo-800' },
        getCategoryName(info.row.original.category_id))
  },
  {
    id: 'actions',
    header: 'Aksi',
    enableSorting: false,
    cell: (info) => h('div', { class: 'text-right' }, [
      h('button', {
        class: 'mr-4 text-indigo-600 hover:text-indigo-900',
        onClick: (e) => { e.stopPropagation(); openEditModal(info.row.original) }
      }, 'Edit'),
      h('button', {
        class: 'text-red-600 hover:text-red-900',
        onClick: (e) => { e.stopPropagation(); openDeleteModal(info.row.original) }
      }, 'Hapus')
    ])
  }
]

// --- Fetch data dari API (server-side)
async function fetchProducts() {
  loading.value = true
  try {
    await productsStore.fetchProducts({
      page: pageIndex.value + 1,                        // backend 1-based
      limit: 10,                                        // enforce 10
      sort: sortState.value?.id || 'name',
      order: sortState.value?.desc ? 'desc' : 'asc',
      search: searchQuery.value?.trim() || '',
      categoryId: selectedCategory.value || ''          // kosongkan jika null
    })
  } catch (e) {
    console.error('Error loading products:', e)
    toast.error('Gagal memuat daftar produk')
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    await categoriesStore.fetchCategories() // untuk lookup nama kategori & filter
  } catch (e) {
    console.error('Error loading categories:', e)
    toast.error('Gagal memuat kategori')
  }
}

// --- Lifecycle
onMounted(async () => {
  await Promise.all([fetchCategories(), fetchProducts()])
})

// --- Reaksi ke perubahan filter/sort/page
let searchTimer
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pageIndex.value = 0
    fetchProducts()
  }, 300)
})

watch(selectedCategory, () => {
  pageIndex.value = 0
  fetchProducts()
})

watch(sortState, () => {
  pageIndex.value = 0
  fetchProducts()
})

watch(pageIndex, () => {
  fetchProducts()
})

// --- Handlers untuk AppHeader
const handleSearch = (q) => { searchQuery.value = q }
const handleSelectCategory = (catId) => { selectedCategory.value = catId } // null = semua

// --- Row click (opsional)
const handleRowClick = (product) => {
  console.log('Product clicked:', product)
}

// =========================
//       ADD HANDLERS
// =========================
const openAddModal = () => {
  // reset form
  newProduct.value = { name: '', price: '', category_id: '' }
  imageFile.value = null
  imagePreview.value = null
  errors.value = {}
  showAddModal.value = true
}

const closeAddModal = () => { showAddModal.value = false }

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

const validateAdd = () => {
  const errs = {}
  if (!newProduct.value.name?.trim()) errs.name = 'Nama produk wajib'
  if (!newProduct.value.price || Number(newProduct.value.price) <= 0) errs.price = 'Harga harus > 0'
  if (!newProduct.value.category_id) errs.category_id = 'Pilih kategori'
  errors.value = errs
  return Object.keys(errs).length === 0
}

const submitAddProduct = async () => {
  if (!validateAdd()) {
    toast.error('Periksa kembali form tambah produk')
    return
  }
  submitLoading.value = true
  try {
    const payload = new FormData()
    payload.append('name', newProduct.value.name)
    payload.append('price', String(newProduct.value.price))
    payload.append('category_id', String(newProduct.value.category_id))
    if (imageFile.value) payload.append('picture', imageFile.value)

    await toast.promise(
      productsStore.addProduct(payload),
      {
        loading: 'Menyimpan produk...',
        success: 'Produk berhasil ditambahkan',
        error: 'Gagal menambahkan produk'
      }
    )
    closeAddModal()
    pageIndex.value = 0
    await fetchProducts()
  } catch (e) {
    console.error('Add product failed:', e)
  } finally {
    submitLoading.value = false
  }
}

// =========================
//       EDIT HANDLERS
// =========================
const openEditModal = (product) => {
  productToEdit.value = { ...product } // {id, name, price, category_id, picture_url?}
  editImageFile.value = null
  editImagePreview.value = product.picture_url || null
  errors.value = {}
  showEditModal.value = true
}

const closeEditModal = () => { showEditModal.value = false }

const handleEditImageChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  editImageFile.value = file
  const reader = new FileReader()
  reader.onload = () => { editImagePreview.value = reader.result }
  reader.readAsDataURL(file)
}

const removeEditImage = () => {
  editImageFile.value = null
  editImagePreview.value = null
  if (editFileInputRef.value) editFileInputRef.value.value = ''
}

const validateEdit = () => {
  const errs = {}
  if (!productToEdit.value.name?.trim()) errs.name = 'Nama produk wajib'
  if (!productToEdit.value.price || Number(productToEdit.value.price) <= 0) errs.price = 'Harga harus > 0'
  if (!productToEdit.value.category_id) errs.category_id = 'Pilih kategori'
  errors.value = errs
  return Object.keys(errs).length === 0
}

const submitEditProduct = async () => {
  if (!validateEdit()) {
    toast.error('Periksa kembali form edit produk')
    return
  }
  submitLoading.value = true
  try {
    const payload = new FormData()
    payload.append('name', productToEdit.value.name)
    payload.append('price', String(productToEdit.value.price))
    payload.append('category_id', String(productToEdit.value.category_id))
    if (editImageFile.value) payload.append('picture', editImageFile.value)

    await toast.promise(
      productsStore.updateProduct(productToEdit.value.id, payload),
      {
        loading: 'Memperbarui produk...',
        success: 'Produk berhasil diperbarui',
        error: 'Gagal memperbarui produk'
      }
    )
    closeEditModal()
    await fetchProducts()
  } catch (e) {
    console.error('Update product failed:', e)
  } finally {
    submitLoading.value = false
  }
}

// =========================
//      DELETE HANDLERS
// =========================
const openDeleteModal = (product) => { productToDelete.value = product; showDeleteModal.value = true }

const confirmDeleteProduct = async () => {
  if (!productToDelete.value) return
  submitLoading.value = true
  try {
    await toast.promise(
      productsStore.deleteProduct(productToDelete.value.id),
      {
        loading: 'Menghapus produk...',
        success: 'Produk berhasil dihapus',
        error: 'Gagal menghapus produk'
      }
    )
    showDeleteModal.value = false
    productToDelete.value = null
    // kalau halaman jadi kosong setelah delete, mundur satu halaman
    if ((totalRows.value - 1) <= pageIndex.value * pageSize.value && pageIndex.value > 0) {
      pageIndex.value = pageIndex.value - 1
    }
    await fetchProducts()
  } catch (e) {
    console.error('Error deleting product:', e)
  } finally {
    submitLoading.value = false
  }
}

// --- Events dari DataTable
const onPageChange = ({ pageIndex: pi }) => { pageIndex.value = pi }
const onSortChange = (s) => { sortState.value = s || { id: 'name', desc: false } }
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Toaster: idealnya diletakkan sekali di App.vue; sementara ditempatkan di sini agar komponen ini mandiri -->
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
            @click="openAddModal"
            class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <span class="text-lg">＋</span>
            <span>Tambah Produk</span>
          </button>
        </div>

        <!-- DataTable: serverMode, pageSize 10, pagination ori -->
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
          @rowClick="handleRowClick"
          @pageChange="onPageChange"
          @sortChange="onSortChange"
        >
          <template #empty-action>
            <button
              type="button"
              @click="openAddModal"
              class="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Tambah Produk
            </button>
          </template>
        </DataTable>
      </div>
    </main>

    <!-- ===================== -->
    <!--      ADD MODAL        -->
    <!-- ===================== -->
    <BaseModal
      :show="showAddModal"
      title="Tambah Produk"
      mode="form"
      @close="closeAddModal"
    >
      <form @submit.prevent="submitAddProduct" class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Nama Produk</label>
          <input
            v-model="newProduct.name"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Masukkan nama produk"
          />
          <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Harga</label>
            <input
              v-model.number="newProduct.price"
              type="number"
              min="0"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0"
            />
            <p v-if="errors.price" class="mt-1 text-xs text-red-600">{{ errors.price }}</p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Kategori</label>
            <select
              v-model="newProduct.category_id"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            @click="closeAddModal"
            class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            :disabled="submitLoading"
          >
            Batal
          </button>
          <button
            type="submit"
            class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            :disabled="submitLoading"
          >
            {{ submitLoading ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- ===================== -->
    <!--      EDIT MODAL       -->
    <!-- ===================== -->
    <BaseModal
      :show="showEditModal"
      title="Edit Produk"
      mode="form"
      @close="closeEditModal"
    >
      <form v-if="productToEdit" @submit.prevent="submitEditProduct" class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Nama Produk</label>
          <input
            v-model="productToEdit.name"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Masukkan nama produk"
          />
          <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Harga</label>
            <input
              v-model.number="productToEdit.price"
              type="number"
              min="0"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0"
            />
            <p v-if="errors.price" class="mt-1 text-xs text-red-600">{{ errors.price }}</p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Kategori</label>
            <select
              v-model="productToEdit.category_id"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>Pilih kategori</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <p v-if="errors.category_id" class="mt-1 text-xs text-red-600">{{ errors.category_id }}</p>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Gambar (opsional)</label>
          <input ref="editFileInputRef" type="file" accept="image/*" @change="handleEditImageChange" />
          <div v-if="editImagePreview" class="mt-2 flex items-center gap-3">
            <img :src="editImagePreview" alt="preview" class="h-16 w-16 rounded object-cover" />
            <button type="button" @click="removeEditImage" class="text-sm text-red-600 hover:underline">Hapus gambar</button>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="closeEditModal"
            class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            :disabled="submitLoading"
          >
            Batal
          </button>
          <button
            type="submit"
            class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            :disabled="submitLoading"
          >
            {{ submitLoading ? 'Memperbarui...' : 'Perbarui' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- ===================== -->
    <!--     DELETE MODAL      -->
    <!-- ===================== -->
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
