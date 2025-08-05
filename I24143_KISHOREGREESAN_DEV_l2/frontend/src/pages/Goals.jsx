import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { getApiUrl } from '../services/api'
import GoalCard from '../components/cards/GoalCard'

const Goals = () => {
  const { user, token, updateUser } = useAuthStore()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [reviewers, setReviewers] = useState([])
  const [loadingReviewers, setLoadingReviewers] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target: '',
    quarter: '',
    start_date: '',
    end_date: '',
    comments: '',
    reviewer_id: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const location = useLocation()
  const [highlightGoalId, setHighlightGoalId] = useState(null)
  const goalRefs = useRef({})

  useEffect(() => {
    fetchGoals()
  }, [])

  useEffect(() => {
    if (showCreateForm && reviewers.length === 0) {
      fetchReviewers()
    }
  }, [showCreateForm])

  // Refresh user data when component mounts
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          const userData = await response.json()
          console.log('✅ Refreshed user data:', userData)
          updateUser(userData) // Update the user state in the auth store
        }
      } catch (err) {
        console.error('❌ Failed to refresh user data:', err)
      }
    }
    
    if (token) {
      refreshUserData()
    }
  }, [token, updateUser])

  useEffect(() => {
    console.log('🔍 useEffect triggered - showCreateForm:', showCreateForm, 'reviewers.length:', reviewers.length, 'user.role:', user?.role)
    if (showCreateForm && reviewers.length === 0 && user?.role === 'employee') {
      console.log('🔍 Calling fetchReviewers from useEffect (employee only)')
      fetchReviewers()
    }
  }, [showCreateForm, user])

  useEffect(() => {
    // Check for goalId in query params
    const params = new URLSearchParams(location.search)
    const goalId = params.get('goalId')
    if (goalId) {
      setHighlightGoalId(Number(goalId))
    } else {
      setHighlightGoalId(null)
    }
  }, [location.search])

  useEffect(() => {
    // Scroll to the highlighted goal if present
    if (highlightGoalId && goalRefs.current[highlightGoalId]) {
      goalRefs.current[highlightGoalId].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightGoalId, goals])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${getApiUrl()}/goals/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch goals')
      }

      const data = await response.json()
      setGoals(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviewers = async () => {
    try {
      console.log('🔍 Starting fetchReviewers...')
      setLoadingReviewers(true)
      
      const apiUrl = `${getApiUrl()}/users/reviewers`
      console.log('🔍 API URL:', apiUrl)
      console.log('🔍 Token:', token ? 'Present' : 'Missing')
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('🔍 Response status:', response.status)
      console.log('🔍 Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Failed to fetch reviewers:', response.status, response.statusText)
        console.error('❌ Error details:', errorText)
        return
      }

      const data = await response.json()
      console.log('✅ Reviewers fetched successfully:', data)
      setReviewers(data)
    } catch (err) {
      console.error('❌ Error fetching reviewers:', err)
      console.error('❌ Error details:', err.message)
      // Don't show error to user as this is optional functionality
    } finally {
      setLoadingReviewers(false)
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    }
    
    if (!formData.target.trim()) {
      errors.target = 'Target is required'
    }
    
    if (!formData.quarter) {
      errors.quarter = 'Quarter is required'
    }
    
    if (!formData.start_date) {
      errors.start_date = 'Start date is required'
    }
    
    if (!formData.end_date) {
      errors.end_date = 'End date is required'
    }
    
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      errors.end_date = 'End date must be after start date'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      target: '',
      quarter: '',
      start_date: '',
      end_date: '',
      comments: '',
      reviewer_id: ''
    })
    setFormErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const url = editingGoal 
        ? `${getApiUrl()}/goals/${editingGoal.id}`
        : `${getApiUrl()}/goals/`
      
      const method = editingGoal ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to save goal')
      }

      setShowCreateForm(false)
      resetForm()
      setEditingGoal(null)
      await fetchGoals()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title || '',
      description: goal.description || '',
      target: goal.target || '',
      quarter: goal.quarter || '',
      start_date: goal.start_date || '',
      end_date: goal.end_date || '',
      comments: goal.comments || '',
      reviewer_id: goal.reviewer_id || ''
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return
    }

    try {
      const response = await fetch(`${getApiUrl()}/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete goal')
      }

      await fetchGoals()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSubmitForReview = async () => {
    const draftGoals = goals.filter(goal => goal.status === 'draft')
    
    if (draftGoals.length === 0) {
      alert('No draft goals available to submit for review.')
      return
    }

    // Check if user has a manager/reviewer assigned
    if (!user.manager_id && !user.appraiser_id) {
      alert('You cannot submit goals for review because no reviewer has been assigned to you. Please contact your administrator to assign a reviewer.')
      return
    }

    if (!confirm(`Are you sure you want to submit ${draftGoals.length} goal${draftGoals.length > 1 ? 's' : ''} for review? You won't be able to edit them after submission.`)) {
      return
    }

    try {
      const response = await fetch(`${getApiUrl()}/goals/submit_all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to submit goals for review')
      }

      await fetchGoals()
      alert(`Successfully submitted ${draftGoals.length} goal${draftGoals.length > 1 ? 's' : ''} for review! Your reviewer will be notified.`)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleProgressUpdate = (updatedGoal) => {
    // Update the goal in the local state
    setGoals(prevGoals => 
      prevGoals.map(goal => 
        goal.id === updatedGoal.id ? updatedGoal : goal
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  const canEditGoal = (goal) => {
    return goal.status === 'draft'
  }

  const canDeleteGoal = (goal) => {
    return goal.status === 'draft'
  }

  const canSubmitForReview = (goal) => {
    return goal.status === 'draft'
  }

  const hasSubmittedGoals = () => {
    return goals.some(goal => goal.status === 'submitted' || goal.status === 'approved' || goal.status === 'rejected')
  }

  const canCreateNewGoals = () => {
    return !hasSubmittedGoals()
  }

  const getReviewerInfo = () => {
    if (user.manager_id) {
      return { id: user.manager_id, type: 'Manager' }
    } else if (user.appraiser_id) {
      return { id: user.appraiser_id, type: 'Appraiser' }
    }
    return null
  }

  const reviewerInfo = getReviewerInfo()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading goals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Goals</h1>
          <p className="text-gray-600 mt-2">Manage your performance goals and track your progress</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={!canCreateNewGoals()}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg ${
            canCreateNewGoals()
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          + Create New Goal
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Create/Edit Goal Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h2>
            <button
              onClick={() => {
                setShowCreateForm(false)
                resetForm()
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter goal title"
                />
                {formErrors.title && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe your goal in detail"
                />
                {formErrors.description && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Target */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target *
                </label>
                <input
                  type="text"
                  name="target"
                  value={formData.target}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.target ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="What do you want to achieve?"
                />
                {formErrors.target && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.target}</p>
                )}
              </div>

              {/* Quarter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quarter *
                </label>
                <select
                  name="quarter"
                  value={formData.quarter}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.quarter ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Quarter</option>
                  <option value="Q1">Q1 (Jan-Mar)</option>
                  <option value="Q2">Q2 (Apr-Jun)</option>
                  <option value="Q3">Q3 (Jul-Sep)</option>
                  <option value="Q4">Q4 (Oct-Dec)</option>
                </select>
                {formErrors.quarter && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.quarter}</p>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.start_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.start_date && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.start_date}</p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.end_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.end_date && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.end_date}</p>
                )}
              </div>

              {/* Reviewer Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Reviewer
                </label>
                <select
                  name="reviewer_id"
                  value={formData.reviewer_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a reviewer (optional)</option>
                  {loadingReviewers ? (
                    <option value="" disabled>Loading reviewers...</option>
                  ) : (
                    reviewers.map((reviewer) => (
                      <option key={reviewer.id} value={reviewer.id}>
                        {reviewer.name} ({reviewer.department || 'No Department'})
                      </option>
                    ))
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use your assigned manager/appraiser
                </p>
              </div>

              {/* Comments */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any additional comments or notes"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  resetForm()
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Your Goals</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {goals.length} {goals.length === 1 ? 'goal' : 'goals'}
              </span>
              {reviewerInfo && (
                <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  ✓ {reviewerInfo.type} assigned
                </span>
              )}
              {/* Debug button - remove this later */}
              {user?.role === 'employee' && (
                <button
                  onClick={() => {
                    console.log('🔍 Manual test: Calling fetchReviewers')
                    fetchReviewers()
                  }}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                >
                  Test Fetch Reviewers
                </button>
              )}
              {goals.filter(goal => goal.status === 'draft').length > 0 && canCreateNewGoals() && (
                <div className="flex items-center gap-2">
                  {(!user.manager_id && !user.appraiser_id) && (
                    <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                      ⚠️ No reviewer assigned
                    </span>
                  )}
                  <button
                    onClick={handleSubmitForReview}
                    disabled={!user.manager_id && !user.appraiser_id}
                    className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                      user.manager_id || user.appraiser_id
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={
                      !user.manager_id && !user.appraiser_id
                        ? 'You need a reviewer assigned before submitting goals'
                        : 'Submit all draft goals for review'
                    }
                  >
                    Submit All for Review
                  </button>
                </div>
              )}
              {hasSubmittedGoals() && (
                <span className="text-sm text-gray-500 bg-yellow-100 px-3 py-1 rounded-full">
                  Goals submitted - editing disabled
                </span>
              )}
            </div>
          </div>
        </div>
        
        {goals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-300 text-5xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">Create your first goal to start tracking your performance and achieving your objectives.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {goals.map((goal) => (
              <div
                key={goal.id}
                ref={el => (goalRefs.current[goal.id] = el)}
              >
                <GoalCard
                  goal={goal}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  highlight={highlightGoalId === goal.id}
                  onProgressUpdate={handleProgressUpdate}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Goals