import { useState, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { token, logout } = useAuthStore()

  const apiCall = useCallback(async (url, options = {}) => {
    setLoading(true)
    setError(null)

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      }

      const response = await fetch(url, config)

      if (response.status === 401) {
        logout()
        throw new Error('Session expired. Please login again.')
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [token, logout])

  const get = useCallback((url) => apiCall(url), [apiCall])
  
  const post = useCallback((url, data) => apiCall(url, {
    method: 'POST',
    body: JSON.stringify(data),
  }), [apiCall])
  
  const put = useCallback((url, data) => apiCall(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  }), [apiCall])
  
  const del = useCallback((url) => apiCall(url, {
    method: 'DELETE',
  }), [apiCall])

  return {
    loading,
    error,
    apiCall,
    get,
    post,
    put,
    delete: del,
  }
} 