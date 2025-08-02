import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { getApiUrl } from '../services/api'

const Profile = () => {
  const { user, token, logout } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    phone: '',
    department: '',
    employee_id: '',
    total_experience_years: '',
    company_experience_years: ''
  })
  const [profilePicture, setProfilePicture] = useState(null)
  const [uploadingPicture, setUploadingPicture] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${getApiUrl()}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setProfile(data)
      setProfilePicture(data.profile_picture)
      setFormData({
        name: data.name || '',
        email: data.email || '',
        title: data.title || '',
        phone: data.phone || '',
        department: data.department || '',
        employee_id: data.employee_id || '',
        total_experience_years: data.total_experience_years || '',
        company_experience_years: data.company_experience_years || ''
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch(`${getApiUrl()}/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setIsEditing(false)
      setError(null)
      toast.success('Profile updated successfully!')
    } catch (err) {
      setError(err.message)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    try {
      setUploadingPicture(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${getApiUrl()}/upload/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload profile picture')
      }

      const data = await response.json()
      setProfilePicture(data.profile_picture)
      setError(null)
      toast.success('Profile picture updated successfully!')
      
      // Refresh profile data
      await fetchProfile()
    } catch (err) {
      setError(err.message)
      toast.error('Failed to upload profile picture')
    } finally {
      setUploadingPicture(false)
    }
  }

  const handleDeleteProfilePicture = async () => {
    try {
      setUploadingPicture(true)
      const response = await fetch(`${getApiUrl()}/upload/profile-picture`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete profile picture')
      }

      setProfilePicture(null)
      setError(null)
      toast.success('Profile picture removed successfully!')
      
      // Refresh profile data
      await fetchProfile()
    } catch (err) {
      setError(err.message)
      toast.error('Failed to delete profile picture')
    } finally {
      setUploadingPicture(false)
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'reviewer': return 'bg-green-100 text-green-800'
      case 'employee': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👑'
      case 'reviewer': return '👨‍💼'
      case 'employee': return '👤'
      default: return '👤'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchProfile}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600 text-lg">Manage your personal information and preferences</p>
            </div>
            <div className="mt-4 sm:mt-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>✏️</span>
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center">
                {/* Profile Picture */}
                <div className="relative inline-block mb-6">
                  <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 mx-auto mb-4 border-4 border-white shadow-lg">
                    {profilePicture ? (
                      <img
                        src={`${getApiUrl()}${profilePicture}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    {(!profilePicture || profilePicture === null) && (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                        👤
                      </div>
                    )}
                  </div>
                  
                  {/* Upload/Delete Buttons */}
                  {isEditing && (
                    <div className="space-y-3">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          className="hidden"
                          disabled={uploadingPicture}
                        />
                        <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-all duration-200">
                          {uploadingPicture ? '📤 Uploading...' : '📷 Upload Photo'}
                        </span>
                      </label>
                      {profilePicture && (
                        <button
                          onClick={handleDeleteProfilePicture}
                          disabled={uploadingPicture}
                          className="block w-full bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm hover:bg-red-200 transition-all duration-200 disabled:opacity-50"
                        >
                          {uploadingPicture ? '🗑️ Deleting...' : '🗑️ Remove Photo'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile?.name}</h2>
                <p className="text-gray-600 text-lg mb-3">{profile?.title || 'No title set'}</p>
                <p className="text-gray-500 mb-4">{profile?.department || 'No department set'}</p>
                
                {/* Role Badge */}
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getRoleColor(profile?.role)} mb-4`}>
                  <span className="mr-2">{getRoleIcon(profile?.role)}</span>
                  {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}
                </div>
                
                {/* Employee ID */}
                {profile?.employee_id && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-6">
                    <p className="text-sm text-blue-600 font-medium mb-1">Employee ID</p>
                    <p className="text-xl font-bold text-blue-800">{profile.employee_id}</p>
                  </div>
                )}

                {/* Experience Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Experience Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Total Experience:</span>
                      <span className="font-semibold text-gray-800">
                        {profile?.total_experience_years ? `${profile.total_experience_years} years` : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Company Experience:</span>
                      <span className="font-semibold text-gray-800">
                        {profile?.company_experience_years ? `${profile.company_experience_years} years` : 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${profile?.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm text-gray-600">
                    {profile?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                      placeholder="e.g., EMP001"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                      placeholder="e.g., Senior Developer"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                      placeholder="e.g., Engineering"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Total Experience (Years)
                    </label>
                    <input
                      type="number"
                      name="total_experience_years"
                      value={formData.total_experience_years}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      min="0"
                      max="50"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Company Experience (Years)
                    </label>
                    <input
                      type="number"
                      name="company_experience_years"
                      value={formData.company_experience_years}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      min="0"
                      max="50"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Account Status & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Account Status */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Account Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-600 font-medium">Role:</span>
                <span className="font-semibold text-gray-800 capitalize">{profile?.role}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-600 font-medium">Status:</span>
                <span className={`font-semibold ${profile?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {profile?.is_active ? '🟢 Active' : '🔴 Inactive'}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-600 font-medium">Member Since:</span>
                <span className="font-semibold text-gray-800">
                  {new Date(profile?.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-600 font-medium">Last Updated:</span>
                <span className="font-semibold text-gray-800">
                  {new Date(profile?.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <button className="w-full text-left p-4 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 flex items-center space-x-3">
                <span className="text-xl">🎯</span>
                <span className="font-medium">View My Goals</span>
              </button>
              <button className="w-full text-left p-4 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 flex items-center space-x-3">
                <span className="text-xl">🛠️</span>
                <span className="font-medium">Update Skills</span>
              </button>
              <button className="w-full text-left p-4 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200 flex items-center space-x-3">
                <span className="text-xl">📊</span>
                <span className="font-medium">Performance Reviews</span>
              </button>
              <button className="w-full text-left p-4 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-200 flex items-center space-x-3">
                <span className="text-xl">📥</span>
                <span className="font-medium">Download Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile 