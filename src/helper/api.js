import axios from 'axios'

// Ambil base URL dari environment
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
})

// 🔹 Interceptor: tambahkan Authorization header otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 🔹 Interceptor: handle error global
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Kalau token invalid / expired (401 / 403)
    if (error.response && [401, 403].includes(error.response.status)) {
      console.warn('[API] Unauthorized or Forbidden — mungkin token tidak valid.')
    }
    return Promise.reject(error)
  }
)

export default api
