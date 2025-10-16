// src/stores/products.store.js
import { defineStore } from 'pinia'
import api from '@/helper/api'
import { toast } from 'vue-sonner'

const CART_KEY = 'cart'

const safeParse = (raw, fallback) => {
  try { return raw ? JSON.parse(raw) : fallback } catch { return fallback }
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
    cartTotal: (state) => state.cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0),
    cartCount: (state) => state.cart.reduce((s, i) => s + (Number(i.qty) || 0), 0),
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
        const payload = this.setError(err, 'Gagal memuat produk')
        console.error('[ProductsStore] fetchProducts:', payload)
        console.log('[DEBUG] Showing error toast from fetchProducts')
        toast.error(this.error || 'Gagal memuat produk', { id: 'product:fetch' })
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
        const payload = this.setError(err, 'Gagal memuat detail produk')
        console.error('[ProductsStore] fetchProductById:', payload)
        console.log('[DEBUG] Showing error toast from fetchProductById')
        toast.error(this.error || 'Gagal memuat detail produk', { id: `product:fetch:${id}` })
      } finally {
        this.loading = false
      }
    },

    // ===== Create / Update =====
    async addProduct(payload) {
      this.loading = true
      this.error = null
      const tid = 'product:add'
      try {
        console.log('[DEBUG] addProduct: Starting...')
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
        console.log('[DEBUG] addProduct: API Success, refetching products...')
        await this.fetchProducts(this.lastQuery)
        console.log('[DEBUG] addProduct: Completed (NO toast from store, component will handle it)')
        return res.data
      } catch (err) {
        console.log('[DEBUG] addProduct: ERROR caught')
        const payload = this.setError(err, 'Gagal menambah produk')
        console.error('[ProductsStore] addProduct:', payload)
        console.log('[DEBUG] Showing error toast from addProduct')
        toast.error(payload?.message || 'Gagal menambah produk', { id: tid })
        throw payload
      } finally {
        this.loading = false
      }
    },

    async updateProduct(id, payload) {
      this.loading = true
      this.error = null
      const tid = `product:update:${id}`
      try {
        console.log('[DEBUG] updateProduct: Starting...')
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
        console.log('[DEBUG] updateProduct: API Success, refetching products...')
        await this.fetchProducts(this.lastQuery)
        console.log('[DEBUG] updateProduct: Completed (NO toast from store, component will handle it)')
        return res.data
      } catch (err) {
        console.log('[DEBUG] updateProduct: ERROR caught')
        const payload = this.setError(err, 'Gagal memperbarui produk')
        console.error('[ProductsStore] updateProduct:', payload)
        console.log('[DEBUG] Showing error toast from updateProduct')
        toast.error(payload?.message || 'Gagal memperbarui produk', { id: tid })
        throw payload
      } finally {
        this.loading = false
      }
    },

    async deleteProduct(id) {
      this.loading = true
      this.error = null
      const tid = `product:delete:${id}`
      try {
        console.log('[DEBUG] deleteProduct: Starting...')
        await api.delete(`/api/v1/product/${id}`)
        console.log('[DEBUG] deleteProduct: API Success, optimistic delete from list')
        this.list = this.list.filter((it) => it.id !== id)
        if (this.total) await this.fetchProducts(this.lastQuery)
        console.log('[DEBUG] deleteProduct: Completed (NO toast from store, component will handle it)')
      } catch (err) {
        console.log('[DEBUG] deleteProduct: ERROR caught')
        const payload = this.setError(err, 'Gagal menghapus produk')
        console.error('[ProductsStore] deleteProduct:', payload)
        console.log('[DEBUG] Showing error toast from deleteProduct')
        toast.error(payload?.message || 'Gagal menghapus produk', { id: tid })
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
      console.log('[DEBUG] Showing toast from addToCart (store)')
      toast.success('Ditambahkan ke keranjang', { id: `cart:add:${product.id}` })
    },

    removeFromCart(productId) {
      const item = this.cart.find(i => i.id === productId)
      this.cart = this.cart.filter((i) => i.id !== productId)
      this.persistCart()
      console.log('[DEBUG] Showing toast from removeFromCart (store)')
      toast('Item dihapus dari keranjang', {
        id: `cart:remove:${productId}`,
        description: item?.name ? `Produk: ${item.name}` : undefined,
      })
    },

    clearCart() {
      this.cart = []
      this.persistCart()
      console.log('[DEBUG] Showing toast from clearCart (store)')
      toast('Keranjang dikosongkan', { id: 'cart:clear' })
    },

    incrementCart(productId) {
      const it = this.cart.find(i => i.id === productId)
      if (it) { it.qty++; this.cart = [...this.cart]; this.persistCart() }
    },

    decrementCart(productId) {
      const it = this.cart.find(i => i.id === productId)
      if (it) { it.qty = Math.max(1, it.qty - 1); this.cart = [...this.cart]; this.persistCart() }
    },

    updateCartQty(productId, qty) {
      const it = this.cart.find(i => i.id === productId)
      if (it) { it.qty = Math.max(1, Number(qty) || 1); this.cart = [...this.cart]; this.persistCart() }
    },
  },
})