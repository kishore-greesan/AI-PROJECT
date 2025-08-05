import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import useAuthStore from '../store/authStore'
import api from '../services/api'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

const Reports = () => {
  const { user } = useAuthStore()
  const [adminData, setAdminData] = useState(null)
  const [managerData, setManagerData] = useState(null)
  const [trendsData, setTrendsData] = useState(null)
  const [competencyMatrix, setCompetencyMatrix] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user?.role) {
      fetchReportsData()
    }
  }, [user])

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      
      if (user?.role === 'admin') {
        // Fetch admin data
        const [overviewRes, deptRes, trendsRes, matrixRes] = await Promise.all([
          api.get('/reports/admin/overview'),
          api.get('/reports/admin/department-stats'),
          api.get('/reports/trends/goal-progress'),
          api.get('/reports/skills/competency-matrix')
        ])
        
        setAdminData({
          overview: overviewRes.data,
          department: deptRes.data
        })
        setTrendsData(trendsRes.data)
        setCompetencyMatrix(matrixRes.data)
      } else if (user?.role === 'reviewer') {
        // Fetch manager data
        const [teamRes, membersRes, trendsRes, matrixRes] = await Promise.all([
          api.get('/reports/manager/team-overview'),
          api.get('/reports/manager/team-members'),
          api.get('/reports/trends/goal-progress'),
          api.get('/reports/skills/competency-matrix')
        ])
        
        setManagerData({
          team: teamRes.data,
          members: membersRes.data
        })
        setTrendsData(trendsRes.data)
        setCompetencyMatrix(matrixRes.data)
      }
    } catch (error) {
      console.error('Error fetching reports data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderAdminReports = () => {
    return (
      <div className="space-y-6">
        {/* Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">
              {adminData?.overview?.users_by_role?.reduce((sum, item) => sum + item.count, 0) || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Goals</h3>
            <p className="text-3xl font-bold text-green-600">
              {adminData?.overview?.goals_by_status?.reduce((sum, item) => sum + item.count, 0) || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Avg Progress</h3>
            <p className="text-3xl font-bold text-purple-600">
              {adminData?.overview?.average_goal_progress?.toFixed(1) || 0}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Recent Registrations</h3>
            <p className="text-3xl font-bold text-orange-600">
              {adminData?.overview?.recent_registrations || 0}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users by Role */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Users by Role</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={adminData?.overview?.users_by_role || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, percent }) => `${role} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="role"
                >
                  {adminData?.overview?.users_by_role?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Goals by Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Goals by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={adminData?.overview?.goals_by_status || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skills by Category */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Skills by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={adminData?.overview?.skills_by_category || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Reviews by Rating */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Reviews by Rating</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={adminData?.overview?.reviews_by_rating || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Department Statistics</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Users by Department */}
            <div>
              <h4 className="font-medium text-gray-600 mb-2">Users by Department</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={adminData?.department?.users_by_department || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Progress by Department */}
            <div>
              <h4 className="font-medium text-gray-600 mb-2">Average Progress by Department</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={adminData?.department?.progress_by_department || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avg_progress" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Skills by Department */}
            <div>
              <h4 className="font-medium text-gray-600 mb-2">Skills by Department</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={adminData?.department?.skills_by_department || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="skill_count" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderManagerReports = () => (
    <div className="space-y-6">
      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Team Size</h3>
          <p className="text-3xl font-bold text-blue-600">
            {managerData?.team?.team_size || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Team Goals</h3>
          <p className="text-3xl font-bold text-green-600">
            {managerData?.team?.team_goals_by_status?.reduce((sum, item) => sum + item.count, 0) || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Team Avg Progress</h3>
          <p className="text-3xl font-bold text-purple-600">
            {managerData?.team?.team_average_progress?.toFixed(1) || 0}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Skills</h3>
          <p className="text-3xl font-bold text-orange-600">
            {managerData?.team?.team_skills_by_level?.reduce((sum, item) => sum + item.count, 0) || 0}
          </p>
        </div>
      </div>

      {/* Team Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Goals by Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Team Goals by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={managerData?.team?.team_goals_by_status || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="status"
              >
                {managerData?.team?.team_goals_by_status?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Team Skills by Level */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Team Skills by Level</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={managerData?.team?.team_skills_by_level || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team Reviews by Rating */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Team Reviews by Rating</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={managerData?.team?.team_reviews_by_rating || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team Members Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Team Members Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={managerData?.members?.team_members || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="average_progress" fill="#8884d8" name="Progress %" />
              <Bar dataKey="average_rating" fill="#82ca9d" name="Rating" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Team Members Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goals</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Rating</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {managerData?.members?.team_members?.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.goal_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.average_progress.toFixed(1)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.skill_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.average_rating.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderTrendsChart = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Goal Progress Trends (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={trendsData?.trend_data || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="avg_progress" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )

  const renderCompetencyMatrix = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Skills Competency Matrix</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beginner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intermediate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expert</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {competencyMatrix?.competency_matrix && Object.entries(competencyMatrix.competency_matrix).map(([category, levels]) => (
              <tr key={category}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{levels.beginner || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{levels.intermediate || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{levels.expert || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  </div>
)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trends'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Trends
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'skills'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Skills Matrix
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div>
              {user?.role === 'admin' ? renderAdminReports() : renderManagerReports()}
            </div>
          )}
          
          {activeTab === 'trends' && (
            <div>
              {renderTrendsChart()}
            </div>
          )}
          
          {activeTab === 'skills' && (
            <div>
              {renderCompetencyMatrix()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports 