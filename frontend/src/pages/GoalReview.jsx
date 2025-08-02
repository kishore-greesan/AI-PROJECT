import React, { useState, useEffect } from 'react'
import useAuthStore from '../store/authStore'
import goalsService from '../services/goals'

const GoalReview = () => {
  const { user, token } = useAuthStore()
  const [goalsForReview, setGoalsForReview] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewAction, setReviewAction] = useState('')
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user?.role === 'reviewer' || user?.role === 'admin') {
      fetchGoalsForReview()
    }
  }, [user])

  const fetchGoalsForReview = async () => {
    try {
      setLoading(true)
      const goals = await goalsService.getGoalsForReview()
      setGoalsForReview(goals)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewGoal = (goal) => {
    setSelectedGoal(goal)
    setReviewAction('')
    setReviewFeedback('')
    setShowReviewModal(true)
  }

  const handleSubmitReview = async () => {
    if (!reviewAction) {
      alert('Please select an action')
      return
    }

    try {
      setSubmitting(true)
      await goalsService.reviewGoal(selectedGoal.id, reviewAction, reviewFeedback)
      
      // Update local state
      setGoalsForReview(prev => 
        prev.filter(goal => goal.id !== selectedGoal.id)
      )
      
      setShowReviewModal(false)
      setSelectedGoal(null)
      setReviewAction('')
      setReviewFeedback('')
      
      alert(`Goal ${reviewAction}ed successfully!`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'submitted':
        return 'Pending Review'
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      case 'draft':
        return 'Draft'
      default:
        return status
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  if (user?.role !== 'reviewer' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h1>
            <p className="text-red-700">You don't have permission to access goal reviews.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading goals for review...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Goal Reviews</h1>
          <p className="text-gray-600">Review and approve/reject employee goals</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Pending Reviews</h3>
            <p className="text-3xl font-bold text-blue-600">
              {goalsForReview.filter(g => g.status === 'submitted').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Goals</h3>
            <p className="text-3xl font-bold text-gray-600">{goalsForReview.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">This Quarter</h3>
            <p className="text-3xl font-bold text-green-600">
              {goalsForReview.filter(g => g.quarter === 'Q1').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Average Progress</h3>
            <p className="text-3xl font-bold text-purple-600">
              {goalsForReview.length > 0 
                ? Math.round(goalsForReview.reduce((sum, g) => sum + (g.progress || 0), 0) / goalsForReview.length)
                : 0}%
            </p>
          </div>
        </div>

        {/* Goals List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Goals for Review</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {goalsForReview.length} {goalsForReview.length === 1 ? 'goal' : 'goals'}
              </span>
            </div>
          </div>
          
          {goalsForReview.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-300 text-5xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No goals for review</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                All goals have been reviewed or no goals have been submitted for review yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {goalsForReview.map((goal) => (
                <div key={goal.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                          {getStatusLabel(goal.status)}
                        </span>
                      </div>
                      
                      {goal.user && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Submitted by</p>
                          <p className="text-sm font-medium text-gray-900">{goal.user.name}</p>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Target</p>
                          <p className="text-sm font-medium text-gray-900">{goal.target}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Quarter</p>
                          <p className="text-sm font-medium text-gray-900">{goal.quarter}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Timeline</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(goal.start_date)} - {formatDate(goal.end_date)}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{goal.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${goal.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {goal.comments && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-xs text-gray-500 mb-1">Employee Comments</p>
                          <p className="text-sm text-gray-700">{goal.comments}</p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      {goal.status === 'submitted' && (
                        <button
                          onClick={() => handleReviewGoal(goal)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Review Goal
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Review Goal</h2>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">{selectedGoal.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{selectedGoal.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Target</p>
                      <p className="text-sm font-medium text-gray-900">{selectedGoal.target}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Quarter</p>
                      <p className="text-sm font-medium text-gray-900">{selectedGoal.quarter}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Action *
                    </label>
                    <select
                      value={reviewAction}
                      onChange={(e) => setReviewAction(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Action</option>
                      <option value="approve">Approve Goal</option>
                      <option value="reject">Reject Goal</option>
                      <option value="return">Return for Revision</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback (Optional)
                    </label>
                    <textarea
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Provide feedback to the employee..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={!reviewAction || submitting}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      !reviewAction || submitting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GoalReview 