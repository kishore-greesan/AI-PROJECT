import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'

const Skills = () => {
  const { user } = useAuthStore()
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    development_area: ''
  })

  const [formData, setFormData] = useState({
    name: '',
    category: 'technical',
    competency_level: 'beginner',
    description: '',
    is_development_area: false,
    tags: ''
  })

  // Mock data for demonstration
  const mockSkills = [
    {
      id: 1,
      name: 'React.js',
      category: 'technical',
      competency_level: 'expert',
      description: 'Advanced React development with hooks, context, and performance optimization',
      is_development_area: false,
      tags: 'frontend, javascript, ui',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: 2,
      name: 'Python',
      category: 'technical',
      competency_level: 'intermediate',
      description: 'Python programming for data analysis and backend development',
      is_development_area: false,
      tags: 'backend, data, automation',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-18T16:45:00Z'
    },
    {
      id: 3,
      name: 'Team Leadership',
      category: 'leadership',
      competency_level: 'beginner',
      description: 'Leading small teams and managing project delivery',
      is_development_area: true,
      tags: 'management, communication, planning',
      created_at: '2024-01-12T11:00:00Z',
      updated_at: '2024-01-19T13:20:00Z'
    },
    {
      id: 4,
      name: 'Communication',
      category: 'soft_skills',
      competency_level: 'expert',
      description: 'Excellent verbal and written communication skills',
      is_development_area: false,
      tags: 'presentation, writing, collaboration',
      created_at: '2024-01-08T08:00:00Z',
      updated_at: '2024-01-15T12:00:00Z'
    }
  ]

  const mockAnalytics = {
    total_skills: 12,
    development_areas: 3,
    expert_skills: 4,
    intermediate_skills: 5,
    beginner_skills: 3
  }

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        setSkills(mockSkills)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error loading skills:', error)
      toast.error('Failed to load skills')
      setLoading(false)
    }
  }

  const handleAddSkill = async () => {
    try {
      const newSkill = {
        id: Date.now(),
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setSkills([...skills, newSkill])
      setShowAddModal(false)
      resetForm()
      toast.success('Skill added successfully!')
    } catch (error) {
      console.error('Error adding skill:', error)
      toast.error('Failed to add skill')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'technical',
      competency_level: 'beginner',
      description: '',
      is_development_area: false,
      tags: ''
    })
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'expert': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'beginner': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'technical': return '💻'
      case 'soft_skills': return '🤝'
      case 'leadership': return '👥'
      case 'domain_knowledge': return '📚'
      case 'tools': return '🛠️'
      default: return '📋'
    }
  }

  const filteredSkills = skills.filter(skill => {
    if (filters.category && skill.category !== filters.category) return false
    if (filters.level && skill.competency_level !== filters.level) return false
    if (filters.development_area !== '' && skill.is_development_area !== (filters.development_area === 'true')) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Skills</h1>
          <p className="text-gray-600">Manage your professional skills and track your development areas</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Skills</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalytics.total_skills}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expert Level</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalytics.expert_skills}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Development Areas</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalytics.development_areas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Intermediate</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalytics.intermediate_skills}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-4">
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="technical">Technical</option>
                  <option value="soft_skills">Soft Skills</option>
                  <option value="leadership">Leadership</option>
                  <option value="domain_knowledge">Domain Knowledge</option>
                  <option value="tools">Tools</option>
                </select>

                <select
                  value={filters.level}
                  onChange={(e) => setFilters({...filters, level: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>

                <select
                  value={filters.development_area}
                  onChange={(e) => setFilters({...filters, development_area: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Skills</option>
                  <option value="true">Development Areas</option>
                  <option value="false">Core Skills</option>
                </select>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                + Add Skill
              </button>
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
            <p className="text-gray-600 mb-4">Start building your skills portfolio by adding your first skill</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Your First Skill
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <div key={skill.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getCategoryIcon(skill.category)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{skill.category.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>

                  {skill.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{skill.description}</p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.competency_level)}`}>
                      {skill.competency_level}
                    </span>
                    {skill.is_development_area && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                        Development Area
                      </span>
                    )}
                  </div>

                  {skill.tags && (
                    <div className="flex flex-wrap gap-1">
                      {skill.tags.split(',').map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Skill Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New Skill</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleAddSkill(); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="technical">Technical</option>
                      <option value="soft_skills">Soft Skills</option>
                      <option value="leadership">Leadership</option>
                      <option value="domain_knowledge">Domain Knowledge</option>
                      <option value="tools">Tools</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Competency Level</label>
                    <select
                      value={formData.competency_level}
                      onChange={(e) => setFormData({...formData, competency_level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., frontend, javascript, ui"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="development_area"
                      checked={formData.is_development_area}
                      onChange={(e) => setFormData({...formData, is_development_area: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="development_area" className="ml-2 block text-sm text-gray-900">
                      Mark as development area
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); resetForm(); }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Skill
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Skills 