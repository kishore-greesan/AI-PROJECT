import React, { useState, useEffect } from 'react'
import { getApiUrl } from '../services/api'
import useAuthStore from '../store/authStore'

const PendingRegistrations = () => {
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(null)
  const { token } = useAuthStore()

  useEffect(() => {
    fetchPendingRegistrations()
  }, [])

  const fetchPendingRegistrations = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/pending-registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch pending registrations')
      }

      const data = await response.json()
      setPendingUsers(data)
    } catch (error) {
      console.error('Error fetching pending registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId) => {
    setApproving(userId)
    try {
      const response = await fetch(`${getApiUrl()}/auth/approve-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          approval_status: 'approved'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to approve user')
      }

      // Remove the approved user from the list
      setPendingUsers(prev => prev.filter(user => user.id !== userId))
      alert('User approved successfully!')
    } catch (error) {
      console.error('Error approving user:', error)
      alert('Failed to approve user: ' + error.message)
    } finally {
      setApproving(null)
    }
  }

  const handleReject = async (userId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    setApproving(userId)
    try {
      const response = await fetch(`${getApiUrl()}/auth/approve-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          approval_status: 'rejected',
          reason: rejectionReason
        })
      })

      if (!response.ok) {
        throw new Error('Failed to reject user')
      }

      // Remove the rejected user from the list
      setPendingUsers(prev => prev.filter(user => user.id !== userId))
      setShowRejectModal(null)
      setRejectionReason('')
      alert('User rejected successfully!')
    } catch (error) {
      console.error('Error rejecting user:', error)
      alert('Failed to reject user: ' + error.message)
    } finally {
      setApproving(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading pending registrations...</span>
        </div>
      </div>
    )
  }

  if (pendingUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Pending Registrations</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <p className="text-gray-600">No pending registrations</p>
          <p className="text-sm text-gray-500 mt-2">All user registrations have been processed</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Pending Registrations</h2>
      <div className="space-y-4">
        {pendingUsers.map((user) => (
          <div key={user.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Role:</span>
                    <span className="ml-2 text-gray-600 capitalize">{user.role}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Department:</span>
                    <span className="ml-2 text-gray-600">{user.department}</span>
                  </div>
                  {user.title && (
                    <div>
                      <span className="font-medium text-gray-700">Title:</span>
                      <span className="ml-2 text-gray-600">{user.title}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="ml-2 text-gray-600">{user.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  Registered: {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleApprove(user.id)}
                  disabled={approving === user.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {approving === user.id ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => setShowRejectModal(user.id)}
                  disabled={approving === user.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {approving === user.id ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Registration</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this user's registration:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows="3"
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(null)
                  setRejectionReason('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingRegistrations 