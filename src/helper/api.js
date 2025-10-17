import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
})

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

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      console.warn('[API] Unauthorized or Forbidden — mungkin token tidak valid.')
    }
    return Promise.reject(error)
  }
)

export default api
