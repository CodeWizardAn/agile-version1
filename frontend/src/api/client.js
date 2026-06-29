import axios from 'axios'
import { toast } from '../utils/toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
})

api.interceptors.response.use(
  res => res,
  err => {
    if (!err.response) {
      toast('Cannot reach the server. Please check your connection.')
    } else if (err.response.status >= 500) {
      toast(err.response.data?.detail || 'Something went wrong on the server. Please try again.')
    }
    return Promise.reject(err)
  }
)

export default api
