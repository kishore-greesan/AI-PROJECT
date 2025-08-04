import React, { useState, useEffect } from 'react'
import { useLocation, Link, Outlet, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import NotificationBell from '../NotificationBell'

const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfileDropdown])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Role-based navigation links
  const getNavLinks = () => {
    const baseLinks = [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'My Goals', path: '/goals' },
      { label: 'Skills', path: '/skills' },
    ]

    // Add admin-specific links
    if (user?.role === 'admin') {
      baseLinks.push(
        { label: 'Goal Review', path: '/goal-review' },
        { label: 'Users', path: '/users' },
        { label: 'Reports', path: '/reports' }
      )
    }

    // Add reviewer-specific links
    if (user?.role === 'reviewer') {
      baseLinks.push(
        { label: 'Goal Review', path: '/goal-review' },
        { label: 'Reviews', path: '/reviews' }
      )
    }

    return baseLinks
  }

  const navLinks = getNavLinks()

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      {/* Single Top Header Bar */}
      <header className="w-full bg-white shadow px-8 py-4 flex items-center justify-between z-40">
        {/* Left: Logo and Nav */}
        <div className="flex items-center gap-x-8">
          <span className="text-2xl font-bold text-blue-700 tracking-wide">EPMS</span>
          <nav className="flex items-center gap-x-6">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-base font-medium transition-colors rounded-lg px-2 py-1
                  ${location.pathname === item.path
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        {/* Right: Time, Notifications, and Profile Dropdown */}
        <div className="flex items-center gap-x-4">
          <span className="text-sm text-gray-600">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          <NotificationBell />
          
          {/* Profile Dropdown */}
          <div className="relative profile-dropdown">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                user?.role === 'reviewer' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {user?.role || 'employee'}
              </span>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="font-medium text-gray-900">{user?.name || 'User'}</div>
                  <div className="text-sm text-gray-600">{user?.email}</div>
                </div>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setShowProfileDropdown(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 px-8 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout 