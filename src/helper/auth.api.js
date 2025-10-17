import api from './api'

export async function apiLogin({ email, password }) {
  const { data } = await api.post('/api/v1/login', { email, password })
  return {
    token: data?.data?.token, 
    user: data?.data,
    message: data?.message,
  }
}

export async function apiProfile() {
  const { data } = await api.post('/api/v1/profile')
  return data?.data || data
}
