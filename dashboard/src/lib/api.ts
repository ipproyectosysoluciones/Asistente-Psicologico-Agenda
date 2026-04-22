import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10_000
})

api.interceptors.response.use(
  res => res.data,
  err => {
    console.error('API Error:', err.message)
    throw err
  }
)

export const appointmentApi = {
  async list(params: Record<string, string> = {}) {
    const { data } = await axios.get('/api/appointments', { baseURL: import.meta.env.VITE_API_URL || '', params })
    return data
  },

  async getStats() {
    const { data } = await axios.get('/api/stats', { baseURL: import.meta.env.VITE_API_URL || '' })
    return data
  }
}

export const patientApi = {
  async list(params: Record<string, string> = {}) {
    const { data } = await axios.get('/api/patients', { baseURL: import.meta.env.VITE_API_URL || '', params })
    return data
  },

  async get(id: string) {
    const { data } = await axios.get(`/api/patients/${id}`, { baseURL: import.meta.env.VITE_API_URL || '' })
    return data
  }
}

export default api