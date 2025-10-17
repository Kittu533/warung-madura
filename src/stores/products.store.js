// src/stores/products.store.js
import { defineStore } from 'pinia'
import api from '@/helper/api'

const CART_KEY = 'cart'

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const isFormData = (v) => typeof FormData !== 'undefined' && v instanceof FormData

export const useProductsStore = defineStore('products', {
  state: () => ({
    list: [],
    selected: null,
    loading: false,
    error: null,
    cart: safeParse(typeof window !== 'undefined' ? localStorage.getItem(CART_KEY) : null, []),
    total: 0,
    lastQuery: {},
  }),

  getters: {
    sortedProducts: (state) =>
      [...state.list].sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0)),
    cartTotal: (state) =>
      state.cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0),
    cartCount: (state) =>
      state.cart.reduce((s, i) => s + (Number(i.qty) || 0), 0),
  },

  actions: {
    // ===== Utils =====
    persistCart() {
      if (typeof window === 'undefined') return
      localStorage.setItem(CART_KEY, JSON.stringify(this.cart))
    },

    setError(err, fallback) {
      const payload = err?.response?.data ?? err
      this.error = payload?.message || fallback
      return payload
    },

    // ===== Fetching =====
    async fetchProducts(params = {}) {
      this.loading = true
      this.error = null
      try {
        this.lastQuery = { ...params }
        const res = await api.get('/api/v1/product', { params: this.lastQuery })
        this.list = res?.data?.data ?? []
        this.total = res?.data?.total ?? this.list.length
      } catch (err) {
        this.setError(err, 'Gagal memuat produk')
      } finally {
        this.loading = false
      }
    },

    async fetchProductById(id) {
      this.loading = true
      this.error = null
      try {
        const res = await api.get(`/api/v1/product/${id}`)
        this.selected = res?.data?.data || null
      } catch (err) {
        this.setError(err, 'Gagal memuat detail produk')
      } finally {
        this.loading = false
      }
    },

    // ===== Create / Update =====
    async addProduct(payload) {
      this.loading = true
      this.error = null
      try {
        let body
        if (isFormData(payload)) {
          body = payload
        } else {
          body = new FormData()
          if (payload?.name != null) body.append('name', String(payload.name).trim())
          if (payload?.price != null) body.append('price', String(Number(payload.price)))
          if (payload?.category_id != null) body.append('category_id', String(Number(payload.category_id)))
          if (payload?.picture) body.append('picture', payload.picture)
        }

        const res = await api.post('/api/v1/product', body)
        await this.fetchProducts(this.lastQuery)
        return res.data
      } catch (err) {
        const payload = this.setError(err, 'Gagal menambah produk')
        throw payload
      } finally {
        this.loading = false
      }
    },

    async updateProduct(id, payload) {
      this.loading = true
      this.error = null
      try {
        let body
        if (isFormData(payload)) {
          body = payload
        } else {
          body = new FormData()
          if (payload?.name != null) body.append('name', String(payload.name).trim())
          if (payload?.price != null) body.append('price', String(Number(payload.price)))
          if (payload?.category_id != null) body.append('category_id', String(Number(payload.category_id)))
          if (payload?.picture) body.append('picture', payload.picture)
        }

        const res = await api.post(`/api/v1/product/update/${id}`, body)
        await this.fetchProducts(this.lastQuery)
        return res.data
      } catch (err) {
        const payload = this.setError(err, 'Gagal memperbarui produk')
        throw payload
      } finally {
        this.loading = false
      }
    },

    async deleteProduct(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/api/v1/product/${id}`)
        this.list = this.list.filter((it) => it.id !== id)
        if (this.total) await this.fetchProducts(this.lastQuery)
      } catch (err) {
        const payload = this.setError(err, 'Gagal menghapus produk')
        throw payload
      } finally {
        this.loading = false
      }
    },

    // ===== Cart (persisted) =====
    addToCart(product) {
      const existing = this.cart.find((i) => i.id === product.id)
      if (existing) existing.qty++
      else this.cart.push({ ...product, qty: 1 })
      this.cart = [...this.cart]
      this.persistCart()
    },

    removeFromCart(productId) {
      this.cart = this.cart.filter((i) => i.id !== productId)
      this.persistCart()
    },

    clearCart() {
      this.cart = []
      this.persistCart()
    },

    incrementCart(productId) {
      const it = this.cart.find(i => i.id === productId)
      if (it) {
        it.qty++
        this.cart = [...this.cart]
        this.persistCart()
      }
    },

    decrementCart(productId) {
      const it = this.cart.find(i => i.id === productId)
      if (it) {
        it.qty = Math.max(1, it.qty - 1)
        this.cart = [...this.cart]
        this.persistCart()
      }
    },

    updateCartQty(productId, qty) {
      const it = this.cart.find(i => i.id === productId)
      if (it) {
        it.qty = Math.max(1, Number(qty) || 1)
        this.cart = [...this.cart]
        this.persistCart()
      }
    },
  },
})
