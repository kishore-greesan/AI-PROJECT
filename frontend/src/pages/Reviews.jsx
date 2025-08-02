import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import reviewsService from '../services/reviews';
import goalsService from '../services/goals';
import usersService from '../services/users';

const Reviews = () => {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [goals, setGoals] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewPeriod, setReviewPeriod] = useState('quarterly');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Form states
  const [formData, setFormData] = useState({
    goal_id: '',
    employee_id: '',
    review_type: 'manager_review',
    quarter: '',
    year: new Date().getFullYear(),
    rating: 3,
    comments: '',
    strengths: '',
    areas_for_improvement: '',
    goals_for_next_period: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewsData, goalsData, summaryData] = await Promise.all([
        reviewsService.getReviews(),
        user.role === 'reviewer' || user.role === 'admin' 
          ? goalsService.getAllGoals() 
          : goalsService.getGoals(),
        reviewsService.getReviewSummary()
      ]);
      
      setReviews(reviewsData);
      setGoals(goalsData);
      setSummary(summaryData);

      // Fetch team members if user is a manager
      if (user.role === 'reviewer' || user.role === 'admin') {
        try {
          const teamData = await usersService.getEmployeesUnderManager();
          setTeamMembers(teamData);
        } catch (err) {
          console.error('Failed to fetch team members:', err);
        }
      }
    } catch (error) {
      setError(error.message);
      toast.error('Failed to load review data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = () => {
    setSelectedReview(null);
    setShowCreateForm(true);
  };

  const handleEditReview = (review) => {
    setSelectedReview(review);
    setShowCreateForm(true);
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setSelectedReview(null);
    fetchData();
    toast.success('Review submitted successfully!');
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
    setSelectedReview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const reviewData = {
        ...formData,
        review_type: 'manager_review',
        period: reviewPeriod === 'quarterly' ? `${selectedYear}-Q${selectedQuarter}` : `${selectedYear}-Annual`
      };

      if (selectedReview) {
        await reviewsService.updateReview(selectedReview.id, reviewData);
        toast.success('Review updated successfully!');
      } else {
        await reviewsService.createReview(reviewData);
        toast.success('Review submitted successfully!');
      }

      handleFormSuccess();
    } catch (error) {
      setError(error.message);
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const getReviewTypeLabel = (type) => {
    return type === 'self_assessment' ? 'Self Assessment' : 'Manager Review';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100';
    if (rating >= 3.5) return 'text-blue-600 bg-blue-100';
    if (rating >= 2.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return 'Outstanding';
    if (rating >= 4) return 'Exceeds Expectations';
    if (rating >= 3.5) return 'Meets Expectations';
    if (rating >= 3) return 'Developing';
    if (rating >= 2) return 'Needs Improvement';
    return 'Unsatisfactory';
  };

  const getPeriodLabel = (period) => {
    if (period && period.includes('Q')) {
      const [year, quarter] = period.split('-');
      return `${year} ${quarter}`;
    }
    return period ? `${period} Annual Review` : 'Unknown Period';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getQuarterOptions = () => {
    return [
      { value: '1', label: 'Q1 (Jan-Mar)' },
      { value: '2', label: 'Q2 (Apr-Jun)' },
      { value: '3', label: 'Q3 (Jul-Sep)' },
      { value: '4', label: 'Q4 (Oct-Dec)' }
    ];
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Performance Reviews</h1>
              <p className="text-gray-600 text-lg">
                {user.role === 'reviewer' || user.role === 'admin' 
                  ? 'Manage team performance reviews and assessments'
                  : 'View your performance reviews and self-assessments'
                }
              </p>
            </div>
            {(user.role === 'reviewer' || user.role === 'admin') && (
              <div className="mt-4 sm:mt-0">
                <button
                  onClick={handleCreateReview}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>📝</span>
                  <span>Create Review</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Reviews</h3>
                  <p className="text-3xl font-bold text-blue-600">{summary.total_reviews || 0}</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Rating</h3>
                  <p className="text-3xl font-bold text-green-600">{summary.average_rating || 0}/5</p>
                </div>
                <div className="text-3xl">⭐</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">This Quarter</h3>
                  <p className="text-3xl font-bold text-purple-600">{summary.quarterly_reviews || 0}</p>
                </div>
                <div className="text-3xl">📅</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending</h3>
                  <p className="text-3xl font-bold text-orange-600">{summary.pending_reviews || 0}</p>
                </div>
                <div className="text-3xl">⏳</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions for Managers */}
        {(user.role === 'reviewer' || user.role === 'admin') && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={() => {
                  setReviewPeriod('quarterly');
                  setShowCreateForm(true);
                }}
                className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 text-left"
              >
                <div className="text-3xl mb-3">📅</div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Quarterly Review</h3>
                <p className="text-blue-600 text-sm">Submit quarterly performance reviews for team members</p>
              </button>
              
              <button
                onClick={() => {
                  setReviewPeriod('annual');
                  setShowCreateForm(true);
                }}
                className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 text-left"
              >
                <div className="text-3xl mb-3">📋</div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Annual Review</h3>
                <p className="text-green-600 text-sm">Complete comprehensive annual performance assessments</p>
              </button>
              
              <button
                onClick={() => toast.info('Analytics feature coming soon!')}
                className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200 text-left"
              >
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Review Analytics</h3>
                <p className="text-purple-600 text-sm">View performance trends and comparisons</p>
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white rounded-2xl shadow-xl">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Recent Reviews</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {reviews.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-600 mb-4">
                  {user.role === 'reviewer' || user.role === 'admin'
                    ? 'Start by creating performance reviews for your team members.'
                    : 'No reviews have been created yet.'
                  }
                </p>
                {(user.role === 'reviewer' || user.role === 'admin') && (
                  <button
                    onClick={handleCreateReview}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200"
                  >
                    Create First Review
                  </button>
                )}
              </div>
            ) : (
              reviews.map((review) => {
                const goal = goals.find(g => g.id === review.goal_id);
                const employee = teamMembers.find(m => m.id === review.reviewer_id);
                return (
                  <div key={review.id} className="p-8 hover:bg-gray-50 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {goal ? goal.title : `Goal ${review.goal_id}`}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            review.review_type === 'self_assessment' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {getReviewTypeLabel(review.review_type)}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {getPeriodLabel(review.period || review.quarter)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Employee</p>
                            <p className="font-medium text-gray-900">
                              {employee ? employee.name : 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Created</p>
                            <p className="font-medium text-gray-900">
                              {formatDate(review.created_at)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Rating</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(review.rating)}`}>
                              {review.rating}/5 - {getRatingLabel(review.rating)}
                            </span>
                          </div>
                        </div>

                        {review.comments && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-1">Comments</p>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                              {review.comments.length > 150 
                                ? `${review.comments.substring(0, 150)}...` 
                                : review.comments
                              }
                            </p>
                          </div>
                        )}

                        {review.strengths && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-1">Strengths</p>
                            <p className="text-gray-700 bg-green-50 p-3 rounded-lg">
                              {review.strengths}
                            </p>
                          </div>
                        )}

                        {review.areas_for_improvement && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-1">Areas for Improvement</p>
                            <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">
                              {review.areas_for_improvement}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Create/Edit Review Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedReview ? 'Edit Review' : 'Create Performance Review'}
                  </h2>
                  <button
                    onClick={handleFormCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-6">
                  {/* Review Period Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Review Period
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="reviewPeriod"
                            value="quarterly"
                            checked={reviewPeriod === 'quarterly'}
                            onChange={(e) => setReviewPeriod(e.target.value)}
                            className="mr-2"
                          />
                          <span>Quarterly</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="reviewPeriod"
                            value="annual"
                            checked={reviewPeriod === 'annual'}
                            onChange={(e) => setReviewPeriod(e.target.value)}
                            className="mr-2"
                          />
                          <span>Annual</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Year
                      </label>
                      <select
                        name="year"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {getYearOptions().map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {reviewPeriod === 'quarterly' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quarter
                      </label>
                      <select
                        name="quarter"
                        value={selectedQuarter}
                        onChange={(e) => setSelectedQuarter(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Quarter</option>
                        {getQuarterOptions().map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Employee Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Employee
                    </label>
                    <select
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Employee</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.name} - {member.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Goal Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Goal
                    </label>
                    <select
                      name="goal_id"
                      value={formData.goal_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Goal</option>
                      {goals.filter(goal => 
                        !formData.employee_id || goal.user_id == formData.employee_id
                      ).map(goal => (
                        <option key={goal.id} value={goal.id}>{goal.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Performance Rating
                    </label>
                    <div className="flex items-center space-x-4">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <label key={rating} className="flex items-center">
                          <input
                            type="radio"
                            name="rating"
                            value={rating}
                            checked={formData.rating == rating}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          <span className="text-lg">{rating}</span>
                        </label>
                      ))}
                      <span className="ml-4 text-sm text-gray-600">
                        {getRatingLabel(formData.rating)}
                      </span>
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Overall Comments
                    </label>
                    <textarea
                      name="comments"
                      value={formData.comments}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Provide overall feedback on performance..."
                    />
                  </div>

                  {/* Strengths */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Key Strengths
                    </label>
                    <textarea
                      name="strengths"
                      value={formData.strengths}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Highlight the employee's key strengths and achievements..."
                    />
                  </div>

                  {/* Areas for Improvement */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Areas for Improvement
                    </label>
                    <textarea
                      name="areas_for_improvement"
                      value={formData.areas_for_improvement}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Identify areas where the employee can improve..."
                    />
                  </div>

                  {/* Goals for Next Period */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Goals for Next Period
                    </label>
                    <textarea
                      name="goals_for_next_period"
                      value={formData.goals_for_next_period}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Set clear goals and expectations for the next period..."
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleFormCancel}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : (selectedReview ? 'Update Review' : 'Submit Review')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews; 