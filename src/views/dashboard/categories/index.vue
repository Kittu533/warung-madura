<script setup>
// filepath: d:\js\vue\warung-madura\src\views\dashboard\categories\index.vue
import { ref, onMounted, computed, h, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCategoriesStore } from '@/stores/categories.store'
import AppHeader from '@/components/app/app-header.vue'
import BaseModal from '@/components/modals/base-modal.vue'
import DataTable from '@/components/ui/data-table.vue'

// === Sonner (Toast)
import { Toaster, toast } from 'vue-sonner'
import 'vue-sonner/style.css'

const router = useRouter()
const categoriesStore = useCategoriesStore()

// --- UI state
const loading = ref(false)
const submitLoading = ref(false)
const searchQuery = ref('')

// --- Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// --- Form states
const newCategory = ref({ name: '' })
const categoryToEdit = ref(null)
const categoryToDelete = ref(null)
const errors = ref({})

// --- Table state
const pageIndex = ref(0)
const pageSize = ref(10)
const sortState = ref({ id: 'name', desc: false })

// --- Data
const categories = computed(() => categoriesStore.list || [])
const totalRows = computed(() => categoriesStore.total || 0)

// --- Columns
const categoryColumns = [
  {
    accessorKey: 'name',
    header: 'Nama Kategori',
    enableSorting: true,
    id: 'name',
    cell: (info) => info.getValue(),
  },
  {
    id: 'actions',
    header: 'Aksi',
    enableSorting: false,
    cell: (info) => {
      return h('div', { class: 'text-left' }, [
        h('button', {
          class: 'mr-4 text-blue-600 hover:text-blue-900',
          onClick: (e) => { e.stopPropagation(); openEditModal(info.row.original) }
        }, 'Edit'),
        h('button', {
          class: 'text-red-600 hover:text-red-900',
          onClick: (e) => { e.stopPropagation(); openDeleteModal(info.row.original) }
        }, 'Hapus')
      ])
    }
  }
]

// --- Fetch data
async function fetchCategories() {
  loading.value = true
  try {
    await categoriesStore.fetchCategories({
      page: pageIndex.value + 1,
      limit: 10,
      sort: sortState.value?.id || 'name',
      order: sortState.value?.desc ? 'desc' : 'asc',
      search: searchQuery.value?.trim() || '',
    })
  } catch (e) {
    console.error('Error fetching categories:', e)
    toast.error('Gagal memuat kategori')
  } finally {
    loading.value = false
  }
}

// --- Lifecycle
onMounted(fetchCategories)
watch(sortState, () => { pageIndex.value = 0; fetchCategories() })
watch(pageIndex, () => { fetchCategories() })

// --- Handlers Header
const handleSearch = (q) => { searchQuery.value = q }

// --- Row click (optional)
const handleRowClick = (category) => {
  console.log('Category clicked:', category)
}

// =====================
// ADD CATEGORY
// =====================
const openAddModal = () => {
  newCategory.value = { name: '' }
  errors.value = {}
  showAddModal.value = true
}

const closeAddModal = () => { showAddModal.value = false }

const validateAdd = () => {
  const errs = {}
  if (!newCategory.value.name?.trim()) errs.name = 'Nama kategori wajib diisi'
  errors.value = errs
  return Object.keys(errs).length === 0
}

const submitAddCategory = async () => {
  if (!validateAdd()) {
    toast.error('Periksa kembali form tambah kategori')
    return
  }
  submitLoading.value = true
  try {
    await toast.promise(
      categoriesStore.addCategory(newCategory.value),
      {
        loading: 'Menyimpan kategori...',
        success: 'Kategori berhasil ditambahkan',
        error: 'Gagal menambahkan kategori'
      }
    )
    closeAddModal()
    pageIndex.value = 0
    await fetchCategories()
  } catch (e) {
    console.error('Add category failed:', e)
  } finally {
    submitLoading.value = false
  }
}

// =====================
// EDIT CATEGORY
// =====================
const openEditModal = (category) => {
  categoryToEdit.value = { ...category }
  errors.value = {}
  showEditModal.value = true
}

const closeEditModal = () => { showEditModal.value = false }

const validateEdit = () => {
  const errs = {}
  if (!categoryToEdit.value.name?.trim()) errs.name = 'Nama kategori wajib diisi'
  errors.value = errs
  return Object.keys(errs).length === 0
}

const submitEditCategory = async () => {
  if (!validateEdit()) {
    toast.error('Periksa kembali form edit kategori')
    return
  }
  submitLoading.value = true
  try {
    await toast.promise(
      categoriesStore.updateCategory(categoryToEdit.value.id, { name: categoryToEdit.value.name }),
      {
        loading: 'Memperbarui kategori...',
        success: 'Kategori berhasil diperbarui',
        error: 'Gagal memperbarui kategori'
      }
    )
    closeEditModal()
    await fetchCategories()
  } catch (e) {
    console.error('Edit category failed:', e)
  } finally {
    submitLoading.value = false
  }
}

// =====================
// DELETE CATEGORY
// =====================
const openDeleteModal = (category) => { categoryToDelete.value = category; showDeleteModal.value = true }

const confirmDeleteCategory = async () => {
  if (!categoryToDelete.value) return
  submitLoading.value = true
  try {
    await toast.promise(
      categoriesStore.deleteCategory(categoryToDelete.value.id),
      {
        loading: 'Menghapus kategori...',
        success: 'Kategori berhasil dihapus',
        error: 'Gagal menghapus kategori'
      }
    )
    showDeleteModal.value = false
    categoryToDelete.value = null
    if ((totalRows.value - 1) <= pageIndex.value * pageSize.value && pageIndex.value > 0) {
      pageIndex.value = pageIndex.value - 1
    }
    await fetchCategories()
  } catch (e) {
    console.error('Delete category failed:', e)
  } finally {
    submitLoading.value = false
  }
}

// --- Events DataTable
const onPageChange = ({ pageIndex: pi }) => { pageIndex.value = pi }
const onSortChange = (s) => { sortState.value = s || { id: 'name', desc: false } }
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Toaster -->
    <Toaster position="top-center" rich-colors closeButton />

    <!-- HEADER -->
    <div class="w-full border-b border-gray-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <AppHeader
          @add-product="() => router.push('/dashboard/product/index')"
          @search="handleSearch"
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
            type="button"
            @click="openAddModal"
            class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <span class="text-lg">＋</span>
            <span>Tambah Kategori</span>
          </button>
        </div>

        <DataTable
          :data="categories"
          :columns="categoryColumns"
          :loading="loading"
          :serverMode="true"
          :totalRows="totalRows"
          :pageSize="pageSize"
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
              type="button"
              @click="openAddModal"
              class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Tambah Kategori
            </button>
          </template>
        </DataTable>
      </div>
    </main>

    <!-- ADD MODAL -->
    <BaseModal
      :show="showAddModal"
      title="Tambah Kategori"
      mode="form"
      @close="closeAddModal"
    >
      <form @submit.prevent="submitAddCategory" class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Nama Kategori</label>
          <input
            v-model="newCategory.name"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan nama kategori"
          />
          <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="closeAddModal"
            class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            :disabled="submitLoading"
          >Batal</button>
          <button
            type="submit"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            :disabled="submitLoading"
          >
            {{ submitLoading ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- EDIT MODAL -->
    <BaseModal
      :show="showEditModal"
      title="Edit Kategori"
      mode="form"
      @close="closeEditModal"
    >
      <form v-if="categoryToEdit" @submit.prevent="submitEditCategory" class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Nama Kategori</label>
          <input
            v-model="categoryToEdit.name"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan nama kategori"
          />
          <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="closeEditModal"
            class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            :disabled="submitLoading"
          >Batal</button>
          <button
            type="submit"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            :disabled="submitLoading"
          >
            {{ submitLoading ? 'Memperbarui...' : 'Perbarui' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- DELETE MODAL -->
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
