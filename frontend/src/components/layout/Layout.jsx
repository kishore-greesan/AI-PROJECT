import React, { useState, useEffect } from 'react'
import { useLocation, Link, Outlet, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import NotificationBell from '../NotificationBell'

const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

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
      { label: 'Profile', path: '/profile' },
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
        {/* Right: Time, Notifications, User Info and Actions */}
        <div className="flex items-center gap-x-4">
          <span className="text-sm text-gray-600">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          <NotificationBell />
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">{user?.name || 'User'}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              user?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
              user?.role === 'reviewer' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {user?.role || 'employee'}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Logout
          </button>
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