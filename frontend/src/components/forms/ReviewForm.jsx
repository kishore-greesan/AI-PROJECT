import React, { useState, useEffect } from 'react';
import reviewsService from '../../services/reviews';
import useAuthStore from '../../store/authStore';

const ReviewForm = ({ goal, reviewType, quarter, existingReview = null, onSuccess, onCancel }) => {
  const { token } = useAuthStore();
  const [formData, setFormData] = useState({
    goal_id: goal?.id || '',
    review_type: reviewType || 'self_assessment',
    quarter: quarter || '',
    rating: 3,
    comments: '',
    strengths: '',
    areas_for_improvement: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingReview) {
      setFormData({
        goal_id: existingReview.goal_id,
        review_type: existingReview.review_type,
        quarter: existingReview.quarter,
        rating: existingReview.rating,
        comments: existingReview.comments || '',
        strengths: existingReview.strengths || '',
        areas_for_improvement: existingReview.areas_for_improvement || ''
      });
    } else if (goal) {
      setFormData(prev => ({
        ...prev,
        goal_id: goal.id
      }));
    }
  }, [existingReview, goal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Debug logging
    console.log('Submitting review with data:', formData);
    console.log('Auth token present:', !!token);

    try {
      if (existingReview) {
        await reviewsService.updateReview(existingReview.id, formData);
      } else {
        await reviewsService.createReview(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Review submission error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const getReviewTypeLabel = (type) => {
    return type === 'self_assessment' ? 'Self Assessment' : 'Manager Review';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {existingReview ? 'Edit' : 'Create'} {getReviewTypeLabel(formData.review_type)}
        </h2>
        {goal && (
          <p className="text-gray-600">
            Goal: <span className="font-semibold">{goal.title}</span>
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quarter */}
        <div>
          <label htmlFor="quarter" className="block text-sm font-medium text-gray-700 mb-2">
            Quarter *
          </label>
          <select
            id="quarter"
            name="quarter"
            value={formData.quarter}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Quarter</option>
            <option value="Q1 2024">Q1 2024</option>
            <option value="Q2 2024">Q2 2024</option>
            <option value="Q3 2024">Q3 2024</option>
            <option value="Q4 2024">Q4 2024</option>
            <option value="Q1 2025">Q1 2025</option>
            <option value="Q2 2025">Q2 2025</option>
            <option value="Q3 2025">Q3 2025</option>
            <option value="Q4 2025">Q4 2025</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              id="rating"
              name="rating"
              min="1"
              max="5"
              value={formData.rating}
              onChange={handleChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-lg font-semibold text-blue-600 min-w-[2rem]">
              {formData.rating}/5
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 - Poor</span>
            <span>2 - Below Average</span>
            <span>3 - Average</span>
            <span>4 - Above Average</span>
            <span>5 - Excellent</span>
          </div>
        </div>

        {/* Comments */}
        <div>
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
            General Comments
          </label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Provide overall feedback and comments..."
          />
        </div>

        {/* Strengths */}
        <div>
          <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-2">
            Areas of Strength
          </label>
          <textarea
            id="strengths"
            name="strengths"
            value={formData.strengths}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Highlight key strengths and achievements..."
          />
        </div>

        {/* Areas for Improvement */}
        <div>
          <label htmlFor="areas_for_improvement" className="block text-sm font-medium text-gray-700 mb-2">
            Areas for Improvement
          </label>
          <textarea
            id="areas_for_improvement"
            name="areas_for_improvement"
            value={formData.areas_for_improvement}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Identify areas that need development..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : (existingReview ? 'Update Review' : 'Create Review')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 