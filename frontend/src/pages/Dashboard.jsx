import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { getApiUrl } from '../services/api'
import GoalCard from '../components/cards/GoalCard'
import EditableReportingStructure from '../components/EditableReportingStructure'
import PendingRegistrations from '../components/PendingRegistrations'

const Dashboard = () => {
  const { user, logout, token, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedCycle, setSelectedCycle] = useState('2024-2025')
  const [goals, setGoals] = useState([])
  const [loadingGoals, setLoadingGoals] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleCycleChange = (cycle) => {
    setSelectedCycle(cycle)
    // In a real app, this would fetch goals for the selected cycle
    console.log('Selected cycle:', cycle)
  }

  const handleUserUpdate = () => {
    console.log('🔍 handleUserUpdate called')
    // Refetch user profile after update
    if (token) {
      console.log('🔍 Fetching updated user profile...')
      fetch(`${getApiUrl()}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log('✅ Updated user data:', data)
          setCurrentUser(data)
          updateUser(data) // Also update the auth store
        })
        .catch(err => console.error('❌ Failed to fetch user profile:', err))
    }
  }

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Fetch current user profile
  useEffect(() => {
    if (token) {
      fetch(`${getApiUrl()}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          setCurrentUser(data)
          updateUser(data) // Also update the auth store
        })
        .catch(err => console.error('Failed to fetch user profile:', err))
    }
  }, [token, updateUser])

  // Fetch real goals for employee
  useEffect(() => {
    if (user?.role === 'employee' && token) {
      setLoadingGoals(true)
      fetch(`${getApiUrl()}/goals/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          setGoals(data)
          setLoadingGoals(false)
        })
        .catch(() => setLoadingGoals(false))
    }
  }, [user, token])

  // Mock data - in real app, this would come from API
  const mockData = {
    employee: {
      goals: [
        { id: 1, title: 'Complete React Training', progress: 75, status: 'In Progress' },
        { id: 2, title: 'Improve Code Quality', progress: 45, status: 'In Progress' },
        { id: 3, title: 'Learn TypeScript', progress: 20, status: 'Not Started' }
      ],
      skills: [
        { name: 'JavaScript', level: 'Expert' },
        { name: 'React', level: 'Intermediate' },
        { name: 'Node.js', level: 'Beginner' }
      ],
      recentFeedback: [
        { id: 1, type: 'Self Assessment', rating: 4, date: '2024-01-10' },
        { id: 2, type: 'Manager Review', rating: 4, date: '2024-01-08' }
      ]
    },
    reviewer: {
      teamMembers: [
        { 
          id: 1, 
          name: 'John Doe', 
          role: 'Developer', 
          goals: 3, 
          completed: 1,
          department: 'Engineering',
          email: 'john.doe@company.com',
          avatar: '👨‍💻',
          lastActive: '2 hours ago',
          performance: 4.2
        },
        { 
          id: 2, 
          name: 'Jane Smith', 
          role: 'Designer', 
          goals: 2, 
          completed: 2,
          department: 'Design',
          email: 'jane.smith@company.com',
          avatar: '👩‍🎨',
          lastActive: '1 hour ago',
          performance: 4.8
        },
        { 
          id: 3, 
          name: 'Mike Johnson', 
          role: 'QA', 
          goals: 4, 
          completed: 2,
          department: 'Engineering',
          email: 'mike.johnson@company.com',
          avatar: '👨‍🔬',
          lastActive: '30 minutes ago',
          performance: 3.9
        },
        { 
          id: 4, 
          name: 'Sarah Wilson', 
          role: 'Frontend Developer', 
          goals: 3, 
          completed: 2,
          department: 'Engineering',
          email: 'sarah.wilson@company.com',
          avatar: '👩‍💻',
          lastActive: '4 hours ago',
          performance: 4.5
        },
        { 
          id: 5, 
          name: 'Alex Chen', 
          role: 'UX Designer', 
          goals: 2, 
          completed: 1,
          department: 'Design',
          email: 'alex.chen@company.com',
          avatar: '👨‍🎨',
          lastActive: '1 day ago',
          performance: 4.1
        }
      ],
      pendingReviews: [
        { 
          id: 1, 
          employee: 'John Doe', 
          goal: 'Complete React Training', 
          dueDate: '2024-01-20',
          priority: 'High',
          status: 'Submitted',
          employeeId: 1,
          goalId: 1,
          submittedDate: '2024-01-15'
        },
        { 
          id: 2, 
          employee: 'Jane Smith', 
          goal: 'UI/UX Design System', 
          dueDate: '2024-01-22',
          priority: 'Medium',
          status: 'Submitted',
          employeeId: 2,
          goalId: 3,
          submittedDate: '2024-01-16'
        },
        { 
          id: 3, 
          employee: 'Mike Johnson', 
          goal: 'Automated Testing Framework', 
          dueDate: '2024-01-25',
          priority: 'Low',
          status: 'Submitted',
          employeeId: 3,
          goalId: 5,
          submittedDate: '2024-01-17'
        }
      ],
      teamPerformance: {
        averageRating: 4.2,
        goalsCompleted: 5,
        totalGoals: 9,
        teamSize: 5,
        activeMembers: 5,
        departmentBreakdown: {
          'Engineering': { members: 3, avgRating: 4.2 },
          'Design': { members: 2, avgRating: 4.4 }
        },
        recentAchievements: [
          'Jane Smith completed all goals for Q4',
          'Team achieved 95% goal completion rate',
          '3 team members received promotions'
        ]
      },
      recentActivity: [
        { id: 1, action: 'Goal submitted for review', user: 'John Doe', time: '2 hours ago', type: 'goal_submission' },
        { id: 2, action: 'Performance review completed', user: 'Jane Smith', time: '4 hours ago', type: 'review_completed' },
        { id: 3, action: 'New goal created', user: 'Mike Johnson', time: '1 day ago', type: 'goal_created' },
        { id: 4, action: 'Progress update', user: 'Sarah Wilson', time: '2 days ago', type: 'progress_update' }
      ],
      upcomingReviews: [
        { id: 1, employee: 'Alex Chen', date: '2024-01-23', type: 'Quarterly Review' },
        { id: 2, employee: 'Sarah Wilson', date: '2024-01-25', type: 'Goal Review' }
      ]
    },
    admin: {
      systemStats: {
        totalUsers: 45,
        activeUsers: 38,
        totalGoals: 156,
        completedGoals: 89
      },
      recentActivity: [
        { id: 1, action: 'New user registered', user: 'john@company.com', time: '2 hours ago' },
        { id: 2, action: 'Goal completed', user: 'jane@company.com', time: '4 hours ago' },
        { id: 3, action: 'Performance review submitted', user: 'mike@company.com', time: '6 hours ago' }
      ],
      departmentStats: [
        { name: 'Engineering', users: 15, avgRating: 4.3 },
        { name: 'Design', users: 8, avgRating: 4.1 },
        { name: 'Marketing', users: 12, avgRating: 4.0 },
        { name: 'Sales', users: 10, avgRating: 4.2 }
      ]
    }
  }

  const getRoleData = () => {
    const role = user?.role || 'employee'
    console.log('User role:', role, 'User data:', user)
    const data = mockData[role] || mockData.employee
    console.log('Role data:', data)
    return data
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const renderEmployeeDashboard = () => {
    const data = getRoleData()
    const showRealGoals = user?.role === 'employee'
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">{getGreeting()}, {user?.name || 'Employee'}!</h1>
          <p className="text-blue-100">Here's your performance overview for {selectedCycle} cycle</p>
          <p className="text-sm text-blue-200 mt-2">{currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Side - Skills and Feedback */}
          <div className="lg:col-span-1 space-y-6">
            {/* Skills Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">My Skills</h2>
              <div className="space-y-3">
                {data.skills?.map((skill, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <h3 className="font-medium text-gray-900 mb-2">{skill.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      skill.level === 'Expert' ? 'bg-green-100 text-green-800' :
                      skill.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                )) || <p className="text-gray-500 text-sm">No skills found</p>}
              </div>
            </div>

            {/* Recent Feedback */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Feedback</h2>
              <div className="space-y-3">
                {data.recentFeedback?.map(feedback => (
                  <div key={feedback.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-900 text-sm">{feedback.type}</p>
                      <span className="text-sm font-semibold text-blue-600">{feedback.rating}/5</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{feedback.date}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-xs ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                )) || <p className="text-gray-500 text-sm">No feedback found</p>}
              </div>
            </div>
          </div>

          {/* Center - Goals Section */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">My Goals</h2>
            <div className="space-y-4">
              {loadingGoals ? (
                <div className="text-gray-500">Loading goals...</div>
              ) : showRealGoals ? (
                goals.length > 0 ? (
                  goals.map(goal => (
                    <div key={goal.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/goals?goalId=${goal.id}`)}>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-gray-900 text-sm">{goal.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          goal.status === 'approved' ? 'bg-green-100 text-green-800' :
                          goal.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          goal.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {goal.status === 'approved' ? 'Completed' :
                           goal.status === 'submitted' ? 'In Progress' :
                           goal.status === 'draft' ? 'Not Started' :
                           goal.status}
                        </span>
                      </div>
                      <div className="mb-2">
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
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Yet</h3>
                    <p className="text-gray-600 mb-6">Start your performance journey by creating your first goal</p>
                    <button 
                      onClick={() => navigate('/goals')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                    >
                      Create Your First Goal
                    </button>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Yet</h3>
                  <p className="text-gray-600 mb-6">Start your performance journey by creating your first goal</p>
                  <button 
                    onClick={() => navigate('/goals')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Create Your First Goal
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Reporting Structure */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
            <EditableReportingStructure 
              user={currentUser} 
              onUpdate={handleUserUpdate}
            />
            
            {/* Performance Cycle Section */}
            <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold text-sm">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Performance Cycle</h3>
                  </div>
                </div>
                {selectedCycle === '2024-2025' && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    Current
                  </span>
                )}
              </div>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedCycle}
                onChange={(e) => handleCycleChange(e.target.value)}
              >
                <option value="2024-2025">2024-2025 (Current)</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
                <option value="2021-2022">2021-2022</option>
              </select>
              <div className="mt-2 text-xs text-gray-500">
                <p>• View performance across different cycles</p>
                <p>• Compare goals and achievements</p>
                <p>• Track career progression</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderManagerDashboard = () => {
    const data = getRoleData()
    
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">{getGreeting()}, {user?.name || 'Manager'}!</h1>
          <p className="text-green-100">Manage your team's performance and reviews for 2024-2025 cycle</p>
          <p className="text-sm text-green-200 mt-2">{currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        {/* Team Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Team Rating</h3>
            <p className="text-3xl font-bold text-green-600">{data.teamPerformance?.averageRating || 'N/A'}</p>
            <p className="text-sm text-gray-600">Average performance rating</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Goals Completed</h3>
            <p className="text-3xl font-bold text-blue-600">{data.teamPerformance?.goalsCompleted || 0}</p>
            <p className="text-sm text-gray-600">of {data.teamPerformance?.totalGoals || 0} total goals</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Pending Reviews</h3>
            <p className="text-3xl font-bold text-orange-600">{data.pendingReviews?.length || 0}</p>
            <p className="text-sm text-gray-600">Reviews awaiting your input</p>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Team Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.teamMembers?.map(member => (
              <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{member.avatar}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                    <p className="text-xs text-gray-500">{member.department}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Goals: {member.completed}/{member.goals}</span>
                    <span className="text-green-600 font-medium">
                      {Math.round((member.completed / member.goals) * 100)}% complete
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Performance</span>
                    <span className="text-blue-600 font-medium">{member.performance}/5.0</span>
                  </div>
                  <div className="text-xs text-gray-500">Last active: {member.lastActive}</div>
                </div>
              </div>
            )) || <p className="text-gray-500">No team members found</p>}
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Pending Reviews</h2>
          <div className="space-y-3">
            {data.pendingReviews?.map(review => (
              <div key={review.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <p className="font-medium text-gray-900">{review.employee}</p>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      review.priority === 'High' ? 'bg-red-100 text-red-800' :
                      review.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {review.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{review.goal}</p>
                  <p className="text-xs text-gray-500">Submitted: {review.submittedDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Due: {review.dueDate}</p>
                  <button 
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    onClick={() => navigate(`/goals/review?goalId=${review.goalId}&employeeId=${review.employeeId}`)}
                  >
                    Review
                  </button>
                </div>
              </div>
            )) || <p className="text-gray-500">No pending reviews</p>}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h2>
          <div className="space-y-3">
            {data.recentActivity?.map(activity => (
              <div key={activity.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  activity.type === 'goal_submission' ? 'bg-blue-500' :
                  activity.type === 'review_completed' ? 'bg-green-500' :
                  activity.type === 'goal_created' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600">{activity.user} • {activity.time}</p>
                </div>
              </div>
            )) || <p className="text-gray-500">No recent activity</p>}
          </div>
        </div>

        {/* Upcoming Reviews */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Upcoming Reviews</h2>
          <div className="space-y-3">
            {data.upcomingReviews?.map(review => (
              <div key={review.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{review.employee}</p>
                  <p className="text-sm text-gray-600">{review.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{review.date}</p>
                  <button className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">
                    Schedule
                  </button>
                </div>
              </div>
            )) || <p className="text-gray-500">No upcoming reviews</p>}
          </div>
        </div>

        {/* Department Performance */}
        {data.teamPerformance?.departmentBreakdown && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Department Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.teamPerformance.departmentBreakdown).map(([dept, stats]) => (
                <div key={dept} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{dept}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Members</span>
                      <span className="font-medium">{stats.members}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg Rating</span>
                      <span className="font-medium text-blue-600">{stats.avgRating}/5.0</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Achievements */}
        {data.teamPerformance?.recentAchievements && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Achievements</h2>
            <div className="space-y-3">
              {data.teamPerformance.recentAchievements.map((achievement, index) => (
                <div key={index} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-600 mr-3">🏆</span>
                  <p className="text-sm text-green-800">{achievement}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderAdminDashboard = () => {
    const data = getRoleData()
    
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">{getGreeting()}, {user?.name || 'Admin'}!</h1>
          <p className="text-purple-100">System overview and administration for 2024-2025 cycle</p>
          <p className="text-sm text-purple-200 mt-2">{currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{data.systemStats?.totalUsers || 0}</p>
            <p className="text-sm text-gray-600">{data.systemStats?.activeUsers || 0} active</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Goals</h3>
            <p className="text-3xl font-bold text-green-600">{data.systemStats?.totalGoals || 0}</p>
            <p className="text-sm text-gray-600">{data.systemStats?.completedGoals || 0} completed</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-purple-600">
              {data.systemStats ? Math.round((data.systemStats.completedGoals / data.systemStats.totalGoals) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600">Goal completion rate</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">System Health</h3>
            <p className="text-3xl font-bold text-green-600">98%</p>
            <p className="text-sm text-gray-600">Uptime this month</p>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Department Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.departmentStats?.map(dept => (
              <div key={dept.name} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{dept.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-1">{dept.users}</p>
                <p className="text-sm text-gray-600 mb-2">users</p>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">Avg Rating:</span>
                  <span className="text-sm text-green-600 font-bold">{dept.avgRating}</span>
                </div>
              </div>
            )) || <p className="text-gray-500">No department data found</p>}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/register')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">+</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Register New User</h3>
                  <p className="text-sm text-gray-600">Create a new user account</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold">📊</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">View Reports</h3>
                  <p className="text-sm text-gray-600">Access system analytics</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent System Activity</h2>
          <div className="space-y-3">
            {data.recentActivity?.map(activity => (
              <div key={activity.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.user}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            )) || <p className="text-gray-500">No recent activity</p>}
          </div>
        </div>

        {/* Pending Registrations */}
        <PendingRegistrations />
      </div>
    )
  }

  const renderDashboard = () => {
    const role = user?.role || 'employee'
    console.log('Rendering dashboard for role:', role)
    
    try {
      switch (role) {
        case 'admin':
          return renderAdminDashboard()
        case 'manager':
        case 'reviewer':
          return renderManagerDashboard()
        default:
          return renderEmployeeDashboard()
      }
    } catch (error) {
      console.error('Error rendering dashboard:', error)
      return (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-red-800 mb-2">Dashboard Error</h1>
            <p className="text-red-700">There was an error loading your dashboard. Please try refreshing the page.</p>
            <p className="text-sm text-red-600 mt-2">Error: {error.message}</p>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </div>
    </div>
  )
}

export default Dashboard 