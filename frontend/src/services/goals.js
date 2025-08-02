import api from './api'

class GoalsService {
  async getGoals() {
    try {
      const response = await api.get('/goals/')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch goals')
    }
  }

  async getAllGoals() {
    try {
      const response = await api.get('/goals/all')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch all goals')
    }
  }

  async getGoal(goalId) {
    try {
      const response = await api.get(`/goals/${goalId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch goal')
    }
  }

  async createGoal(goalData) {
    try {
      const response = await api.post('/goals/', goalData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create goal')
    }
  }

  async updateGoal(goalId, goalData) {
    try {
      const response = await api.put(`/goals/${goalId}`, goalData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update goal')
    }
  }

  async deleteGoal(goalId) {
    try {
      const response = await api.delete(`/goals/${goalId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete goal')
    }
  }

  async submitForReview(goalIds) {
    try {
      const response = await api.post('/goals/submit-for-review', { goal_ids: goalIds })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to submit goals for review')
    }
  }

  async updateProgress(goalId, progressData) {
    try {
      const response = await api.post(`/goals/${goalId}/progress`, progressData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update progress')
    }
  }

  async getProgressHistory(goalId) {
    try {
      const response = await api.get(`/goals/${goalId}/progress`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch progress history')
    }
  }

  async getGoalsForReview() {
    try {
      const response = await api.get('/goals/review')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch goals for review')
    }
  }

  async reviewGoal(goalId, action, feedback = '') {
    try {
      const response = await api.post(`/goals/${goalId}/review`, {
        action,
        feedback
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to review goal')
    }
  }
}

export default new GoalsService() 