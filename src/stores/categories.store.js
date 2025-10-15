import { defineStore } from 'pinia'
import api from '@/helper/api'

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    list: [],         // daftar semua kategori
    selected: null,   // kategori yang sedang dilihat/diedit
    loading: false,
    error: null,
  }),

  getters: {
    sortedCategories: (state) =>
      [...state.list].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      ),
  },

  actions: {
    /**
     * 🔹 Ambil semua kategori
     * endpoint: GET /api/v1/category
     */
    async fetchCategories() {
      this.loading = true
      this.error = null
      try {
        const res = await api.get('/api/v1/category')
        this.list = res?.data?.data || []
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal memuat daftar kategori.'
        console.error('[CategoriesStore] fetchCategories:', this.error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 🔹 Ambil kategori berdasarkan ID
     * endpoint: GET /api/v1/category/:id
     */
    async fetchCategoryById(id) {
      this.loading = true
      this.error = null
      try {
        const res = await api.get(`/api/v1/category/${id}`)
        this.selected = res?.data?.data || null
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal memuat kategori.'
        console.error('[CategoriesStore] fetchCategoryById:', this.error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 🔹 Tambah kategori baru
     * endpoint: POST /api/v1/category
     * payload: { name: "string" }
     */
    async addCategory(payload) {
      this.loading = true
      this.error = null
      try {
        const res = await api.post('/api/v1/category', payload)
        // refresh list
        await this.fetchCategories()
        return res.data
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal menambah kategori.'
        console.error('[CategoriesStore] addCategory:', this.error)
        throw this.error
      } finally {
        this.loading = false
      }
    },

    /**
     * 🔹 Update kategori
     * endpoint: PUT /api/v1/category/:id
     * payload: { name: "string" }
     */
    async updateCategory(id, payload) {
      this.loading = true
      this.error = null
      try {
        const res = await api.put(`/api/v1/category/${id}`, payload)
        await this.fetchCategories()
        return res.data
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal memperbarui kategori.'
        console.error('[CategoriesStore] updateCategory:', this.error)
        throw this.error
      } finally {
        this.loading = false
      }
    },

    /**
     * 🔹 Hapus kategori
     * endpoint: DELETE /api/v1/category/:id
     */
    async deleteCategory(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/api/v1/category/${id}`)
        this.list = this.list.filter((item) => item.id !== id)
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal menghapus kategori.'
        console.error('[CategoriesStore] deleteCategory:', this.error)
        throw this.error
      } finally {
        this.loading = false
      }
    },
  },
})
