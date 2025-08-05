import api from './api'

class UsersService {
  async getCurrentUser() {
    try {
      const response = await api.get('/users/me')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch user profile')
    }
  }

  async updateCurrentUser(userData) {
    try {
      const response = await api.put('/users/me', userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update user profile')
    }
  }

  async getUsers() {
    try {
      const response = await api.get('/users/')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch users')
    }
  }

  async getReviewers() {
    try {
      const response = await api.get('/users/reviewers')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch reviewers')
    }
  }

  async getAdmins() {
    try {
      const response = await api.get('/users/')
      return response.data.filter(user => user.role === 'admin')
    } catch (error) {
      // If user doesn't have permission to get all users, return empty array
      return []
    }
  }

  async getEmployeesUnderManager() {
    try {
      const response = await api.get('/users/employees')
      return response.data
    } catch (error) {
      console.error('Failed to fetch employees under manager:', error)
      return []
    }
  }

  async getUserById(userId) {
    try {
      const response = await api.get(`/users/${userId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch user')
    }
  }

  async updateReportingStructure(managerId, appraiserId) {
    try {
      console.log('🔍 updateReportingStructure called with:', { managerId, appraiserId })
      const response = await api.put('/users/me', {
        manager_id: managerId,
        appraiser_id: appraiserId
      })
      console.log('✅ updateReportingStructure response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ updateReportingStructure error:', error)
      throw new Error(error.response?.data?.detail || 'Failed to update reporting structure')
    }
  }
}

export default new UsersService() 