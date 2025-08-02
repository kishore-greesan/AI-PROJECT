import axios from 'axios'
import useAuthStore from '../store/authStore'

// Get API URL from environment or use default
export const getApiUrl = () => {
  // Check if we're running in a browser (client-side)
  if (typeof window !== 'undefined') {
    // In production, use the environment variable
    if (import.meta.env.PROD) {
      const url = import.meta.env.VITE_API_URL || 'https://your-backend-url.railway.app/api'
      console.log('Production detected, using URL:', url)
      return url
    }
    // In development, use localhost
    const url = 'http://localhost:8000/api'
    console.log('Development detected, using URL:', url)
    return url
  }
  
  // In server-side or container environment, use the environment variable
  const url = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  console.log('Server-side detected, using URL:', url)
  return url
}

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api 