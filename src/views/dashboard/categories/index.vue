<script setup>
// filepath: d:\js\vue\warung-madura\src\views\dashboard\categories\index.vue
import { ref, onMounted, computed, h, watch } from 'vue'
import { useCategoriesStore } from '@/stores/categories.store'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/app/app-header.vue'
import BaseModal from '@/components/modals/base-modal.vue'
import DataTable from '@/components/ui/data-table.vue'

const router = useRouter()
const categoriesStore = useCategoriesStore()

// --- UI state
const loading = ref(false)
const submitLoading = ref(false)
const searchQuery = ref('')

// modal
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// form
const newCategory = ref({ name: '' })
const categoryToEdit = ref(null)
const categoryToDelete = ref(null)

// --- Table state (server-side pagination + sorting)
const pageIndex = ref(0)             // 0-based
const pageSize = ref(10)             // dikunci 10
const sortState = ref({ id: 'name', desc: false }) // default sort by name asc

// --- ambil data dari store (aman kalau null)
const categories = computed(() => categoriesStore.list || [])
const totalRows = computed(() => categoriesStore.total || 0)

// --- columns (pakai render h untuk aksi)
const categoryColumns = [
  {
    accessorKey: 'name',
    header: 'Nama Kategori',
    cell: (info) => info.getValue(),
    enableSorting: true,
    id: 'name',
  },
  {
    id: 'actions',
    header: 'Aksi',
    enableSorting: false,
    cell: (info) => {
      return h('div', { class: 'text-right' }, [
        h('button', {
          class: 'text-indigo-600 hover:text-indigo-900 mr-4',
          onClick: (e) => {
            e.stopPropagation()
            handleEditCategory(info.row.original)
          }
        }, 'Edit'),
        h('button', {
          class: 'text-red-600 hover:text-red-900',
          onClick: (e) => {
            e.stopPropagation()
            handleDeleteConfirm(info.row.original)
          }
        }, 'Hapus')
      ])
    },
  },
]

// --- fetch helper (server-side)
async function fetchCategories() {
  loading.value = true
  try {
    await categoriesStore.fetchCategories({
      page: pageIndex.value + 1,              // backend 1-based
      limit: 10,                               // kunci 10
      sort: sortState.value?.id || 'name',
      order: sortState.value?.desc ? 'desc' : 'asc',
      search: searchQuery.value?.trim() || '',
    })
  } catch (err) {
    console.error('Error fetching categories:', err)
  } finally {
    loading.value = false
  }
}

// --- lifecycle
onMounted(fetchCategories)

// --- debounce sederhana untuk search
let searchTimer
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pageIndex.value = 0 // reset ke halaman 1 saat cari
    fetchCategories()
  }, 300)
})

// reset halaman jika sort berubah
watch(sortState, () => {
  pageIndex.value = 0
  fetchCategories()
})

// jika halaman berubah
watch(pageIndex, () => {
  fetchCategories()
})

// === handlers ===
const handleSearch = (query) => {
  searchQuery.value = query
}

const handleRowClick = (category) => {
  // optional action on row click
  console.log('Category clicked:', category)
}

const handleAddCategory = () => {
  newCategory.value = { name: '' }
  showAddModal.value = true
}

const handleSubmitCategory = async () => {
  if (!newCategory.value.name.trim()) {
    alert('Nama kategori harus diisi')
    return
  }
  submitLoading.value = true
  try {
    await categoriesStore.addCategory(newCategory.value)
    showAddModal.value = false
    newCategory.value = { name: '' }
    // refresh list, tetap di halaman sekarang (atau reset ke awal jika mau)
    await fetchCategories()
  } catch (error) {
    console.error('Error adding category:', error)
  } finally {
    submitLoading.value = false
  }
}

const handleEditCategory = (category) => {
  categoryToEdit.value = { ...category }
  showEditModal.value = true
}

const handleUpdateCategory = async () => {
  if (!categoryToEdit.value.name.trim()) {
    alert('Nama kategori harus diisi')
    return
  }
  submitLoading.value = true
  try {
    const { id, name } = categoryToEdit.value
    await categoriesStore.updateCategory(id, { name })
    showEditModal.value = false
    await fetchCategories()
  } catch (error) {
    console.error('Error updating category:', error)
  } finally {
    submitLoading.value = false
  }
}

const handleDeleteConfirm = (category) => {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

const confirmDeleteCategory = async () => {
  if (!categoryToDelete.value) return
  submitLoading.value = true
  try {
    await categoriesStore.deleteCategory(categoryToDelete.value.id)
    showDeleteModal.value = false
    categoryToDelete.value = null
    // jika halaman jadi kosong setelah delete, mundurkan halaman 1 langkah
    if ((totalRows.value - 1) <= pageIndex.value * pageSize.value && pageIndex.value > 0) {
      pageIndex.value = pageIndex.value - 1
    }
    await fetchCategories()
  } catch (error) {
    console.error('Error deleting category:', error)
  } finally {
    submitLoading.value = false
  }
}

// event dari DataTable
const onPageChange = ({ pageIndex: pi }) => {
  pageIndex.value = pi
}
const onSortChange = (s) => {
  // s: { id, desc } | null
  sortState.value = s || { id: 'name', desc: false }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- HEADER -->
    <div class="w-full border-b border-gray-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <AppHeader
          @search="handleSearch"
          @add-category="handleAddCategory"
          @add-product="() => router.push('/dashboard/product/index')"
          @open-cart="() => router.push('/dashboard/cart')"
        />
      </div>
    </div>

    <!-- MAIN -->
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div class="rounded-xl bg-white p-6 shadow-sm">
        <div class="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 class="text-2xl font-bold text-gray-800">Manajemen Kategori</h1>
          <button
            @click="handleAddCategory"
            class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <span class="text-lg">＋</span>
            <span>Tambah Kategori</span>
          </button>
        </div>

        <!-- DataTable: serverMode, pageSize kunci 10, pagination original -->
        <DataTable
          :data="categories"
          :columns="categoryColumns"
          :loading="loading"
          :serverMode="true"
          :totalRows="totalRows"
          :pageSize="10"
          :searchValue="searchQuery"
          searchColumn="name"
          className="rounded-xl bg-white"
          emptyMessage="Belum ada kategori"
          @rowClick="handleRowClick"
          @pageChange="onPageChange"
          @sortChange="onSortChange"
        >
          <template #empty-action>
            <button
              @click="handleAddCategory"
              class="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Tambah Kategori
            </button>
          </template>
        </DataTable>
      </div>
    </main>

    <!-- ADD -->
    <BaseModal
      :show="showAddModal"
      title="Tambah Kategori"
      mode="form"
      @close="showAddModal = false"
    >
      <form @submit.prevent="handleSubmitCategory" class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Nama Kategori</label>
          <input
            v-model="newCategory.name"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Masukkan nama kategori"
          />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="showAddModal = false"
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

    <!-- EDIT -->
    <BaseModal
      :show="showEditModal"
      title="Edit Kategori"
      mode="form"
      @close="showEditModal = false"
    >
      <form v-if="categoryToEdit" @submit.prevent="handleUpdateCategory" class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Nama Kategori</label>
          <input
            v-model="categoryToEdit.name"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Masukkan nama kategori"
          />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="showEditModal = false"
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

    <!-- DELETE -->
    <BaseModal
      :show="showDeleteModal"
      title="Hapus Kategori"
      :message="`Yakin ingin menghapus kategori '${categoryToDelete?.name || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      mode="confirm"
      confirm-text="Hapus"
      cancel-text="Batal"
      :loading="submitLoading"
      @close="showDeleteModal = false"
      @cancel="showDeleteModal = false"
      @confirm="confirmDeleteCategory"
    />
  </div>
</template>
