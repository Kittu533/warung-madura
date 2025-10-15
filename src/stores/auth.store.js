import { defineStore } from 'pinia'
import { apiLogin, apiProfile } from '@/helper/auth.api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('user-token') || null,
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login({ username, email, password }) {
      this.loading = true
      this.error = null
      try {
        const credentials = { email: email || username, password }
        const { token, user } = await apiLogin(credentials)

        if (!token) throw new Error('Token tidak ditemukan')

        // simpan token & user ke store
        this.token = token
        this.user = user

        // ✅ simpan token ke Local Storage selalu
        localStorage.setItem('user-token', token)

        return { user, token }
      } catch (e) {
        this.error = e.response?.data?.message || e.message || 'Login gagal'
        throw e
      } finally {
        this.loading = false
      }
    },

    async fetchProfile() {
      try {
        const data = await apiProfile()
        this.user = data
      } catch {
        this.logout()
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('user-token')
    },
  },
})
