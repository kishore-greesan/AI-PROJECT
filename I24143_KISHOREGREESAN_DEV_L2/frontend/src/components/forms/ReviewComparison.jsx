import React, { useState, useEffect } from 'react';
import reviewsService from '../../services/reviews';

const ReviewComparison = ({ goalId, quarter = null }) => {
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComparisons();
  }, [goalId, quarter]);

  const fetchComparisons = async () => {
    try {
      setLoading(true);
      const data = await reviewsService.getReviewComparison(goalId, quarter);
      setComparisons(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingLabel = (rating) => {
    if (rating === 5) return 'Excellent';
    if (rating === 4) return 'Above Average';
    if (rating === 3) return 'Average';
    if (rating === 2) return 'Below Average';
    return 'Poor';
  };

  const getDifferenceColor = (difference) => {
    if (difference > 0) return 'text-green-600';
    if (difference < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getDifferenceLabel = (difference) => {
    if (difference > 0) return 'Manager rated higher';
    if (difference < 0) return 'Self-rated higher';
    return 'Same rating';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-red-600 text-center">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (comparisons.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          <p>No reviews found for this goal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Review Comparison</h3>
      
      <div className="space-y-6">
        {comparisons.map((comparison, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {comparison.goal_title}
              </h4>
              <p className="text-sm text-gray-600">Quarter: {comparison.quarter}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Self Assessment */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-3">Self Assessment</h5>
                {comparison.self_assessment ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <span className={`font-semibold ${getRatingColor(comparison.self_assessment.rating)}`}>
                        {comparison.self_assessment.rating}/5 - {getRatingLabel(comparison.self_assessment.rating)}
                      </span>
                    </div>
                    {comparison.self_assessment.comments && (
                      <div>
                        <span className="text-sm text-gray-600">Comments:</span>
                        <p className="text-sm mt-1">{comparison.self_assessment.comments}</p>
                      </div>
                    )}
                    {comparison.self_assessment.strengths && (
                      <div>
                        <span className="text-sm text-gray-600">Strengths:</span>
                        <p className="text-sm mt-1">{comparison.self_assessment.strengths}</p>
                      </div>
                    )}
                    {comparison.self_assessment.areas_for_improvement && (
                      <div>
                        <span className="text-sm text-gray-600">Areas for Improvement:</span>
                        <p className="text-sm mt-1">{comparison.self_assessment.areas_for_improvement}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No self-assessment submitted</p>
                )}
              </div>

              {/* Manager Review */}
              <div className="bg-green-50 rounded-lg p-4">
                <h5 className="font-medium text-green-900 mb-3">Manager Review</h5>
                {comparison.manager_review ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <span className={`font-semibold ${getRatingColor(comparison.manager_review.rating)}`}>
                        {comparison.manager_review.rating}/5 - {getRatingLabel(comparison.manager_review.rating)}
                      </span>
                    </div>
                    {comparison.manager_review.comments && (
                      <div>
                        <span className="text-sm text-gray-600">Comments:</span>
                        <p className="text-sm mt-1">{comparison.manager_review.comments}</p>
                      </div>
                    )}
                    {comparison.manager_review.strengths && (
                      <div>
                        <span className="text-sm text-gray-600">Strengths:</span>
                        <p className="text-sm mt-1">{comparison.manager_review.strengths}</p>
                      </div>
                    )}
                    {comparison.manager_review.areas_for_improvement && (
                      <div>
                        <span className="text-sm text-gray-600">Areas for Improvement:</span>
                        <p className="text-sm mt-1">{comparison.manager_review.areas_for_improvement}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No manager review submitted</p>
                )}
              </div>
            </div>

            {/* Rating Difference */}
            {comparison.rating_difference !== null && comparison.rating_difference !== undefined && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Rating Difference:</span>
                  <span className={`font-semibold ${getDifferenceColor(comparison.rating_difference)}`}>
                    {comparison.rating_difference > 0 ? '+' : ''}{comparison.rating_difference}
                    <span className="text-sm text-gray-500 ml-2">
                      ({getDifferenceLabel(comparison.rating_difference)})
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewComparison; 