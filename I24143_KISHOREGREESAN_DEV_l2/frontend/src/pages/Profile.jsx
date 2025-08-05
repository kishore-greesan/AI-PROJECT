import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { getApiUrl } from '../services/api'
import axios from 'axios'

const Profile = () => {
  const { user, token, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [profileData, setProfileData] = useState(null)
  const [orgHierarchy, setOrgHierarchy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const [profileResponse, hierarchyResponse] = await Promise.all([
        axios.get(`${getApiUrl()}/profile/user-profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${getApiUrl()}/profile/org-hierarchy`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      
      setProfileData(profileResponse.data)
      setOrgHierarchy(hierarchyResponse.data)
      setEditForm(profileResponse.data)
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      // In a real app, you'd have an update endpoint
      console.log('Saving profile:', editForm)
      setIsEditing(false)
      // Refresh data
      await fetchProfileData()
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'reviewer': return 'bg-green-100 text-green-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 1: return 'bg-gray-100 text-gray-800'
      case 2: return 'bg-blue-100 text-blue-800'
      case 3: return 'bg-green-100 text-green-800'
      case 4: return 'bg-yellow-100 text-yellow-800'
      case 5: return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your professional information and view organizational structure</p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profileData?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{profileData?.name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(profileData?.role)}`}>
                  {profileData?.role}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Email:</span> {profileData?.email}
                </div>
                <div>
                  <span className="font-medium">Department:</span> {profileData?.department_info?.name || 'Not assigned'}
                </div>
                <div>
                  <span className="font-medium">Team:</span> {profileData?.team_info?.name || 'Not assigned'}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', label: 'Overview', icon: '👤' },
                { id: 'org-hierarchy', label: 'Organization', icon: '🏢' },
                { id: 'team', label: 'Team', icon: '👥' },
                { id: 'settings', label: 'Settings', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <div className="text-2xl font-bold">{profileData?.total_experience_years || 0}</div>
                    <div className="text-blue-100">Years Experience</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <div className="text-2xl font-bold">{profileData?.company_experience_years || 0}</div>
                    <div className="text-green-100">Company Years</div>
        </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="text-2xl font-bold">{profileData?.direct_reports?.length || 0}</div>
                    <div className="text-purple-100">Direct Reports</div>
                      </div>
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                    <div className="text-2xl font-bold">{profileData?.goals?.length || 0}</div>
                    <div className="text-orange-100">Active Goals</div>
                  </div>
                  </div>
                  
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Title:</span>
                        <span className="font-medium">{profileData?.title || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{profileData?.phone || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Manager:</span>
                        <span className="font-medium">{profileData?.manager?.name || 'Not assigned'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Department Information</h3>
                  <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium">{profileData?.department_info?.name || 'Not assigned'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Team:</span>
                        <span className="font-medium">{profileData?.team_info?.name || 'Not assigned'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Description:</span>
                        <span className="font-medium text-sm">{profileData?.department_info?.description || 'No description'}</span>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Organization Hierarchy Tab */}
            {activeTab === 'org-hierarchy' && orgHierarchy && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Organizational Structure</h3>
                  <p className="text-gray-600">View the complete organizational hierarchy and your position within it.</p>
            </div>

                <div className="space-y-6">
                  {orgHierarchy.org_structure.map((dept) => (
                    <div key={dept.id} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{dept.name}</h4>
                        <span className="text-sm text-gray-500">{dept.description}</span>
          </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dept.teams.map((team) => (
                          <div 
                            key={team.id} 
                            className={`bg-white rounded-lg p-4 border-2 ${
                              team.id === orgHierarchy.user_info.team_id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{team.name}</h5>
                              {team.id === orgHierarchy.user_info.team_id && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  Your Team
                  </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{team.description}</p>
                            <div className="text-xs text-gray-500">
                              Team Lead: {team.team_lead_id ? `User ${team.team_lead_id}` : 'Not assigned'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Your Team</h3>
                  <p className="text-gray-600">View your direct reports and team members.</p>
                  </div>

                {profileData?.direct_reports?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profileData.direct_reports.map((report) => (
                      <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                            {report.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{report.name}</h4>
                            <p className="text-sm text-gray-600">{report.email}</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(report.role)}`}>
                              {report.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">👥</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Direct Reports</h3>
                    <p className="text-gray-600">You don't have any direct reports assigned to you.</p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Profile Settings</h3>
                  <p className="text-gray-600">Update your personal information and preferences.</p>
                  </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                  </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                          type="tel"
                          value={editForm.phone || ''}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
              </form>
            </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile 