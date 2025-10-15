<script setup>
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  FlexRender,
} from '@tanstack/vue-table'
import { ref, computed, watch } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },          // data current page (server mode) atau full (client)
  columns: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  // pagination
  totalRows: { type: Number, default: 0 },         // wajib diisi kalau serverMode=true
  serverMode: { type: Boolean, default: true },    // true = ambil data per page dari API
  pageSize: { type: Number, default: 10 },         // fix 10 sesuai permintaan
  // searching (opsional)
  searchValue: { type: String, default: '' },
  searchColumn: { type: String, default: '' },
  className: { type: String, default: '' },
  emptyMessage: { type: String, default: 'Tidak ada data' },
})

const emit = defineEmits(['rowClick', 'pageChange', 'sortChange'])

const sorting = ref([])
const paginationState = ref({
  pageIndex: 0,
  pageSize: 10, // paksa 10
})

const globalFilter = computed(() => props.searchValue)

// filter global sederhana
const globalFilterFn = (row, columnId, filterValue) => {
  const value = row.getValue(columnId)
  return value != null
    ? String(value).toLowerCase().includes(String(filterValue).toLowerCase())
    : false
}

const table = useVueTable({
  get data() {
    // client mode boleh kasih semua data; server mode: kasih data halaman aktif
    return props.data
  },
  get columns() {
    return props.columns
  },
  state: {
    get sorting() {
      return sorting.value
    },
    get pagination() {
      return paginationState.value
    },
    get globalFilter() {
      return globalFilter.value
    },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
    // beritahu parent utk fetch ulang (server mode)
    const s = sorting.value?.[0]
    emit('sortChange', s ? { id: s.id, desc: s.desc } : null)
  },
  onPaginationChange: (updater) => {
    paginationState.value =
      typeof updater === 'function' ? updater(paginationState.value) : updater
    // beritahu parent (server mode)
    emit('pageChange', {
      pageIndex: paginationState.value.pageIndex,
      pageSize: paginationState.value.pageSize,
    })
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: props.serverMode ? undefined : getSortedRowModel(),
  getPaginationRowModel: props.serverMode ? undefined : getPaginationRowModel(),
  getFilteredRowModel: props.serverMode ? undefined : getFilteredRowModel(),
  globalFilterFn:
    !props.serverMode && props.searchColumn
      ? (row, _colId, filterValue) => globalFilterFn(row, props.searchColumn, filterValue)
      : undefined,
})

watch(
  () => props.pageSize,
  (n) => {
    paginationState.value.pageSize = 10 // tetap 10
  },
  { immediate: true }
)

watch(
  () => props.data,
  () => {
    // reset ke halaman pertama jika data source berubah total (opsional)
    if (!props.serverMode) table.resetPageIndex()
  }
)

const pageCount = computed(() => {
  if (props.serverMode) {
    return Math.max(1, Math.ceil((props.totalRows || 0) / paginationState.value.pageSize))
  }
  // client mode
  const total = table.getPrePaginationRowModel().rows.length
  return Math.max(1, Math.ceil(total / paginationState.value.pageSize))
})

const rowsExist = computed(() => table.getRowModel().rows.length > 0)
const handleRowClick = (row) => emit('rowClick', row.original)

// helpers pagination ui
const current = computed(() => paginationState.value.pageIndex + 1)
const canPrev = computed(() => (props.serverMode ? current.value > 1 : table.getCanPreviousPage()))
const canNext = computed(() =>
  props.serverMode ? current.value < pageCount.value : table.getCanNextPage()
)

const goFirst = () => table.setPageIndex(0)
const goPrev = () => table.previousPage()
const goNext = () => table.nextPage()
const goLast = () => table.setPageIndex(pageCount.value - 1)

// generate page numbers (maks 5)
const visiblePages = computed(() => {
  const total = pageCount.value
  const cur = current.value
  const max = 5
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1)
  const start = Math.max(1, cur - 2)
  const end = Math.min(total, start + max - 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})
</script>

<template>
  <div :class="className">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
    </div>

    <!-- Tabel -->
    <div
      v-else-if="rowsExist"
      class="overflow-hidden rounded-xl border border-gray-200 bg-white"
    >
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-left  text-gray-600">
          <tr v-for="hg in table.getHeaderGroups()" :key="hg.id">
            <th
              v-for="header in hg.headers"
              :key="header.id"
              :colspan="header.colSpan"
              class="px-5 py-3 font-semibold"
            >
              <button
                v-if="header.column.getCanSort()"
                class="flex items-center gap-1 hover:text-gray-900"
                @click="header.column.getToggleSortingHandler()?.($event)"
              >
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
                <svg
                  v-if="header.column.getIsSorted() === 'asc'"
                  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                  class="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M5 12l5-5 5 5H5z" />
                </svg>
                <svg
                  v-else-if="header.column.getIsSorted() === 'desc'"
                  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                  class="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M5 8l5 5 5-5H5z" />
                </svg>
              </button>
              <template v-else>
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </template>
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="hover:bg-gray-50"
            @click="handleRowClick(row)"
          >
            <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="px-5 py-4">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination (tanpa emoji, “ori” style) -->
      <div class="flex items-center justify-between border-t border-gray-200 px-5 py-3 text-sm text-gray-600">
        <p>
          Showing
          <span class="font-medium">
            {{
              (paginationState.pageIndex * paginationState.pageSize) + (rowsExist ? 1 : 0)
            }}
          </span>
          to
          <span class="font-medium">
            {{
              Math.min(
                (paginationState.pageIndex + 1) * paginationState.pageSize,
                serverMode ? totalRows : table.getFilteredRowModel().rows.length
              )
            }}
          </span>
          of
          <span class="font-medium">
            {{ serverMode ? totalRows : table.getFilteredRowModel().rows.length }}
          </span>
          results
        </p>

        <nav class="inline-flex items-center gap-1">
          <button
            class="rounded-md border px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canPrev"
            @click="goFirst"
            aria-label="First page"
          >
            First
          </button>
          <button
            class="rounded-md border px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canPrev"
            @click="goPrev"
            aria-label="Previous page"
          >
            Prev
          </button>

          <button
            v-for="p in visiblePages"
            :key="p"
            class="rounded-md border px-3 py-1.5"
            :class="p === current ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'hover:bg-gray-50'"
            @click="table.setPageIndex(p - 1)"
            :aria-current="p === current ? 'page' : undefined"
          >
            {{ p }}
          </button>

          <button
            class="rounded-md border px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canNext"
            @click="goNext"
            aria-label="Next page"
          >
            Next
          </button>
          <button
            class="rounded-md border px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canNext"
            @click="goLast"
            aria-label="Last page"
          >
            Last
          </button>
        </nav>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="py-16 text-center text-gray-500">
      <p class="text-base">{{ emptyMessage }}</p>
    </div>
  </div>
</template>
