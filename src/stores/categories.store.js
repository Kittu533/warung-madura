import { defineStore } from 'pinia'
import api from '@/helper/api'
import { toast } from 'vue-sonner'

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    list: [],
    selected: null,
    loading: false,
    error: null,
    total: 0,
    lastQuery: {},
  }),

  getters: {
    sortedCategories: (state) =>
      [...state.list].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      ),
  },

  actions: {
    setError(err, fallback) {
      const payload = err?.response?.data ?? err
      this.error = payload?.message || fallback
      return payload
    },

    /**
     * Validasi nama kategori apakah sudah ada
     */
    validateCategoryName(name, excludeId = null) {
      if (!name || typeof name !== 'string') {
        return 'Nama kategori tidak boleh kosong'
      }

      const normalizedName = name.trim().toLowerCase()
      
      // Cek apakah nama sudah ada (kecuali jika ID sama dengan excludeId)
      const exists = this.list.some(cat => 
        cat.name.toLowerCase() === normalizedName && 
        (excludeId === null || cat.id !== excludeId)
      )
      
      if (exists) {
        return 'Nama kategori sudah digunakan'
      }
      
      return null // valid
    },

    /**
     * Ambil semua kategori dengan server-side pagination
     * endpoint: GET /api/v1/category
     * params: { page, limit, sort, order, search }
     */
    async fetchCategories(params = {}) {
      this.loading = true
      this.error = null
      try {
        this.lastQuery = { ...params }
        const res = await api.get('/api/v1/category', { params: this.lastQuery })
        this.list = res?.data?.data || []
        this.total = res?.data?.total || this.list.length
      } catch (err) {
        const payload = this.setError(err, 'Gagal memuat daftar kategori')
        toast.error(this.error || 'Gagal memuat kategori', { id: 'category:fetch' })
      } finally {
        this.loading = false
      }
    },

    /**
     * Ambil kategori berdasarkan ID
     * endpoint: GET /api/v1/category/:id
     */
    async fetchCategoryById(id) {
      this.loading = true
      this.error = null
      try {
        const res = await api.get(`/api/v1/category/${id}`)
        this.selected = res?.data?.data || null
      } catch (err) {
        const payload = this.setError(err, 'Gagal memuat kategori')
        toast.error(this.error || 'Gagal memuat kategori', { id: `category:fetch:${id}` })
      } finally {
        this.loading = false
      }
    },

    /**
     * Tambah kategori baru
     * endpoint: POST /api/v1/category
     * payload: { name: "string" }
     */
    async addCategory(payload) {
      this.loading = true
      this.error = null
      
      // Validasi nama kategori
      const validationError = this.validateCategoryName(payload.name)
      if (validationError) {
        this.error = validationError
        toast.error(validationError, { id: 'category:add:validation' })
        return Promise.reject({ message: validationError })
      }
      
      try {
        const res = await api.post('/api/v1/category', payload)
        return res.data
      } catch (err) {
        const payload_err = this.setError(err, 'Gagal menambah kategori')
        toast.error(payload_err?.message || 'Gagal menambah kategori', { id: 'category:add' })
        throw payload_err
      } finally {
        this.loading = false
      }
    },

    /**
     * Update kategori
     * endpoint: PUT /api/v1/category/:id
     * payload: { name: "string" }
     */
    async updateCategory(id, payload) {
      this.loading = true
      this.error = null
      
      // Validasi nama kategori (kecuali kategori dengan id yang sama)
      const validationError = this.validateCategoryName(payload.name, id)
      if (validationError) {
        this.error = validationError
        toast.error(validationError, { id: `category:update:validation:${id}` })
        return Promise.reject({ message: validationError })
      }
      
      try {
        const res = await api.put(`/api/v1/category/${id}`, payload)
        return res.data
      } catch (err) {
        const payload_err = this.setError(err, 'Gagal memperbarui kategori')
        toast.error(payload_err?.message || 'Gagal memperbarui kategori', { id: `category:update:${id}` })
        throw payload_err
      } finally {
        this.loading = false
      }
    },

    /**
     * Hapus kategori
     * endpoint: DELETE /api/v1/category/:id
     */
    async deleteCategory(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/api/v1/category/${id}`)
        this.list = this.list.filter((item) => item.id !== id)
      } catch (err) {
        const payload = this.setError(err, 'Gagal menghapus kategori')
        toast.error(payload?.message || 'Gagal menghapus kategori', { id: `category:delete:${id}` })
        throw payload
      } finally {
        this.loading = false
      }
    },
  },
})