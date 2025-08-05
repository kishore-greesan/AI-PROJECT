import { getApiUrl } from './api'

const SKILLS_API_BASE = `${getApiUrl()}/skills`

class SkillsService {
  // Get all skills for current user with optional filtering
  async getSkills(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.category) params.append('category', filters.category)
      if (filters.level) params.append('level', filters.level)
      if (filters.development_area !== undefined) params.append('development_area', filters.development_area)
      if (filters.page) params.append('page', filters.page)
      if (filters.size) params.append('size', filters.size)
      
      const url = `${SKILLS_API_BASE}/?${params.toString()}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch skills: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching skills:', error)
      throw error
    }
  }

  // Get a specific skill by ID
  async getSkill(skillId) {
    try {
      const response = await fetch(`${SKILLS_API_BASE}/${skillId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch skill: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching skill:', error)
      throw error
    }
  }

  // Create a new skill
  async createSkill(skillData) {
    try {
      const response = await fetch(SKILLS_API_BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(skillData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Failed to create skill: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating skill:', error)
      throw error
    }
  }

  // Update an existing skill
  async updateSkill(skillId, skillData) {
    try {
      const response = await fetch(`${SKILLS_API_BASE}/${skillId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(skillData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Failed to update skill: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating skill:', error)
      throw error
    }
  }

  // Delete a skill
  async deleteSkill(skillId) {
    try {
      const response = await fetch(`${SKILLS_API_BASE}/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete skill: ${response.status}`)
      }
      
      return true
    } catch (error) {
      console.error('Error deleting skill:', error)
      throw error
    }
  }

  // Get skill analytics
  async getSkillAnalytics() {
    try {
      const response = await fetch(`${SKILLS_API_BASE}/analytics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch skill analytics: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching skill analytics:', error)
      throw error
    }
  }

  // Get skill categories
  async getSkillCategories() {
    try {
      const response = await fetch(`${SKILLS_API_BASE}/categories`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch skill categories: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching skill categories:', error)
      throw error
    }
  }
}

export default new SkillsService() 