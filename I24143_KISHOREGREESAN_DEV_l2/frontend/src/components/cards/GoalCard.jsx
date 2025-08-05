import React, { useState } from 'react';
import ProgressUpdate from '../forms/ProgressUpdate';
import ProgressHistory from '../forms/ProgressHistory';

const getStatusColor = (status) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'submitted':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'approved':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString();
};

const GoalCard = ({ goal, onEdit, onDelete, highlight, onProgressUpdate }) => {
  const [showProgressUpdate, setShowProgressUpdate] = useState(false);
  const [showProgressHistory, setShowProgressHistory] = useState(false);
  
  const canEdit = goal.status === 'draft';
  const canDelete = goal.status === 'draft';
  const canUpdateProgress = goal.status !== 'draft'; // Can update progress for submitted/approved goals

  const handleProgressUpdate = (updatedGoal) => {
    if (onProgressUpdate) {
      onProgressUpdate(updatedGoal);
    }
  };

  return (
    <>
      <div
        id={`goal-${goal.id}`}
        className={`p-6 hover:bg-gray-50 transition-colors duration-200 rounded-xl border ${highlight ? 'border-2 border-blue-500 shadow-md' : 'border-transparent'}`}
        style={{ scrollMarginTop: '100px' }}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h4 className="text-lg font-semibold text-gray-900 truncate">{goal.title}</h4>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(goal.status)}`}>
                {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
              </span>
            </div>

            <p className="text-gray-600 mb-4 leading-relaxed">{goal.description}</p>

            {/* Progress Section */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-semibold text-blue-600">{goal.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress || 0}%` }}
                ></div>
              </div>
              {goal.progress_updated_at && (
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {formatDate(goal.progress_updated_at)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Target</div>
                <div className="text-sm text-gray-900 font-medium">{goal.target}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Quarter</div>
                <div className="text-sm text-gray-900 font-medium">{goal.quarter}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Timeline</div>
                <div className="text-sm text-gray-900 font-medium">
                  {formatDate(goal.start_date)} - {formatDate(goal.end_date)}
                </div>
              </div>
            </div>

            {goal.comments && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Comments</div>
                <p className="text-sm text-blue-800">{goal.comments}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {/* Progress Tracking Buttons */}
            {canUpdateProgress && (
              <>
                <button
                  onClick={() => setShowProgressUpdate(true)}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Update Progress
                </button>
                <button
                  onClick={() => setShowProgressHistory(true)}
                  className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  View History
                </button>
              </>
            )}

            {/* Edit and Delete Buttons */}
            {onEdit && (
              <button
                onClick={() => onEdit(goal)}
                disabled={!canEdit}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  canEdit
                    ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                Edit
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(goal.id)}
                disabled={!canDelete}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  canDelete
                    ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Update Modal */}
      {showProgressUpdate && (
        <ProgressUpdate
          goal={goal}
          onProgressUpdate={handleProgressUpdate}
          onClose={() => setShowProgressUpdate(false)}
        />
      )}

      {/* Progress History Modal */}
      {showProgressHistory && (
        <ProgressHistory
          goalId={goal.id}
          onClose={() => setShowProgressHistory(false)}
        />
      )}
    </>
  );
};

export default GoalCard; 