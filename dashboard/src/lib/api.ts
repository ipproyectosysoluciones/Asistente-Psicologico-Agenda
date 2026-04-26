import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10_000
})

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    console.error('API Error:', err.message)
    throw err
  }
)

export const appointmentApi = {
  async list(params: Record<string, string> = {}) {
    return api.get('/appointments', { params })
  },

  async getStats() {
    return api.get('/stats')
  }
}

export const patientApi = {
  async list(params: Record<string, string> = {}) {
    return api.get('/patients', { params })
  },

  async get(id: string) {
    return api.get(`/patients/${id}`)
  }
}

export default api
