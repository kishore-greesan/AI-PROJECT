import React, { useState, useEffect } from 'react'
import usersService from '../services/users'

const EditableReportingStructure = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [availableUsers, setAvailableUsers] = useState([])
  const [managerDetails, setManagerDetails] = useState(null)
  const [appraiserDetails, setAppraiserDetails] = useState(null)
  const [formData, setFormData] = useState({
    manager_id: user?.manager_id || null,
    appraiser_id: user?.appraiser_id || null
  })

  useEffect(() => {
    if (isEditing) {
      fetchAvailableUsers()
    }
  }, [isEditing])

  useEffect(() => {
    // Update form data when user prop changes
    if (user) {
      console.log('🔍 User prop updated:', user)
      setFormData({
        manager_id: user.manager_id || null,
        appraiser_id: user.appraiser_id || null
      })
    }
  }, [user])

  // Refresh user data when component mounts
  useEffect(() => {
    if (user && onUpdate) {
      console.log('🔍 Refreshing user data on mount')
      onUpdate()
    }
  }, [])

  // Fetch manager and appraiser details when user changes
  useEffect(() => {
    if (user) {
      fetchManagerAndAppraiserDetails()
    }
  }, [user])

  const fetchManagerAndAppraiserDetails = async () => {
    if (!user?.manager_id && !user?.appraiser_id) return

    try {
      // Fetch all reviewers and admins to get their details
      const [reviewers, admins] = await Promise.all([
        usersService.getReviewers(),
        usersService.getAdmins()
      ])
      
      // Find manager details
      if (user.manager_id) {
        const manager = [...reviewers, ...admins].find(u => u.id === user.manager_id)
        if (manager) {
          setManagerDetails(manager)
        }
      }
      
      // Find appraiser details
      if (user.appraiser_id) {
        const appraiser = [...reviewers, ...admins].find(u => u.id === user.appraiser_id)
        if (appraiser) {
          setAppraiserDetails(appraiser)
        }
      }
    } catch (err) {
      console.error('❌ Failed to fetch manager/appraiser details:', err)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      console.log('🔍 Starting fetchAvailableUsers...')
      setLoading(true)
      setError(null)
      
      // Fetch reviewers and admins separately
      console.log('🔍 Fetching reviewers...')
      const reviewers = await usersService.getReviewers()
      console.log('✅ Reviewers fetched:', reviewers)
      
      console.log('🔍 Fetching admins...')
      const admins = await usersService.getAdmins()
      console.log('✅ Admins fetched:', admins)
      
      // Combine and filter out current user
      const availableUsers = [...reviewers, ...admins].filter(u => u.id !== user?.id)
      console.log('✅ Available users:', availableUsers)
      setAvailableUsers(availableUsers)
    } catch (err) {
      console.error('❌ Failed to fetch available users:', err)
      setError('Failed to fetch available users')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setFormData({
      manager_id: user?.manager_id || null,
      appraiser_id: user?.appraiser_id || null
    })
  }

  const handleSave = async () => {
    try {
      console.log('🔍 Starting handleSave...')
      console.log('🔍 Form data:', formData)
      setLoading(true)
      setError(null)
      
      console.log('🔍 Calling updateReportingStructure with:', formData.manager_id, formData.appraiser_id)
      const result = await usersService.updateReportingStructure(
        formData.manager_id,
        formData.appraiser_id
      )
      console.log('✅ Update successful:', result)
      
      setIsEditing(false)
      if (onUpdate) {
        console.log('🔍 Calling onUpdate callback')
        onUpdate()
      }
    } catch (err) {
      console.error('❌ Save failed:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError(null)
    setFormData({
      manager_id: user?.manager_id || null,
      appraiser_id: user?.appraiser_id || null
    })
  }

  const getManagerName = () => {
    if (!user?.manager_id) return 'Not assigned'
    
    // First try to find in availableUsers
    const manager = availableUsers.find(u => u.id === user.manager_id)
    if (manager) return manager.name
    
    // If not found in availableUsers, try to use fetched details
    if (managerDetails) return managerDetails.name
    
    // If not found in availableUsers, return a generic name
    // In a real app, you might want to fetch the manager details from the backend
    return 'Manager Assigned'
  }

  const getAppraiserName = () => {
    if (!user?.appraiser_id) return 'Not assigned'
    
    // First try to find in availableUsers
    const appraiser = availableUsers.find(u => u.id === user.appraiser_id)
    if (appraiser) return appraiser.name
    
    // If not found in availableUsers, try to use fetched details
    if (appraiserDetails) return appraiserDetails.name
    
    // If not found in availableUsers, return a generic name
    // In a real app, you might want to fetch the appraiser details from the backend
    return 'Appraiser Assigned'
  }

  const getManagerRole = () => {
    if (!user?.manager_id) return ''
    const manager = availableUsers.find(u => u.id === user.manager_id)
    return manager ? manager.role : ''
  }

  const getAppraiserRole = () => {
    if (!user?.appraiser_id) return ''
    const appraiser = availableUsers.find(u => u.id === user.appraiser_id)
    return appraiser ? appraiser.role : ''
  }

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold text-sm">👤</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Reviewer</h3>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <select
            value={formData.manager_id || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              manager_id: e.target.value ? parseInt(e.target.value) : null 
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">{loading ? 'Loading reviewers...' : 'Select Reviewer'}</option>
            {availableUsers
              .filter(u => u.role === 'manager' || u.role === 'admin')
              .map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
          </select>
          
          <div className="text-xs text-gray-500 mt-2">
            <p>• Reviews your goals and performance</p>
            <p>• Provides feedback and guidance</p>
            <p>• Approves goal completion</p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold text-sm">📋</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Appraiser</h3>
            </div>
          </div>
          
          <select
            value={formData.appraiser_id || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              appraiser_id: e.target.value ? parseInt(e.target.value) : null 
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">{loading ? 'Loading admins...' : 'Select Appraiser'}</option>
            {availableUsers
              .filter(u => u.role === 'admin' || u.role === 'manager')
              .map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
          </select>
          
          <div className="text-xs text-gray-500 mt-2">
            <p>• Final performance evaluation</p>
            <p>• Career development guidance</p>
            <p>• Promotion recommendations</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Reporting Structure</h2>
        <button
          onClick={handleEdit}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          Edit
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 font-bold text-sm">👤</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Reviewer</h3>
            <p className="text-sm text-gray-600">{getManagerName()}</p>
            {getManagerRole() && (
              <p className="text-xs text-gray-500 capitalize">{getManagerRole()}</p>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          <p>• Reviews your goals and performance</p>
          <p>• Provides feedback and guidance</p>
          <p>• Approves goal completion</p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-purple-600 font-bold text-sm">📋</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Appraiser</h3>
            <p className="text-sm text-gray-600">{getAppraiserName()}</p>
            {getAppraiserRole() && (
              <p className="text-xs text-gray-500 capitalize">{getAppraiserRole()}</p>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          <p>• Final performance evaluation</p>
          <p>• Career development guidance</p>
          <p>• Promotion recommendations</p>
        </div>
      </div>
    </div>
  )
}

export default EditableReportingStructure 