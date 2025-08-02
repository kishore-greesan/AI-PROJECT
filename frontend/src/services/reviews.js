import api from './api'

class ReviewsService {
  async createReview(reviewData) {
    try {
      const response = await api.post('/reviews/', reviewData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create review')
    }
  }

  async getReviews(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.goal_id) params.append('goal_id', filters.goal_id)
      if (filters.review_type) params.append('review_type', filters.review_type)
      if (filters.quarter) params.append('quarter', filters.quarter)

      const response = await api.get(`/reviews/?${params}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch reviews')
    }
  }

  async getReview(reviewId) {
    try {
      const response = await api.get(`/reviews/${reviewId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch review')
    }
  }

  async updateReview(reviewId, reviewData) {
    try {
      const response = await api.put(`/reviews/${reviewId}`, reviewData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update review')
    }
  }

  async deleteReview(reviewId) {
    try {
      const response = await api.delete(`/reviews/${reviewId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete review')
    }
  }

  async getReviewComparison(goalId, quarter = null) {
    try {
      const params = new URLSearchParams()
      if (quarter) params.append('quarter', quarter)

      const response = await api.get(`/reviews/comparison/${goalId}?${params}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch review comparison')
    }
  }

  async getReviewSummary() {
    try {
      const response = await api.get('/reviews/summary/')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch review summary')
    }
  }
}

export default new ReviewsService() 