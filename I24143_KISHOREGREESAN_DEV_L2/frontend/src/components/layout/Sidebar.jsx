import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const Sidebar = () => {
  const { user } = useAuthStore()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  // Role-based menu configuration
  const getMenuConfig = () => {
    const baseMenu = [
      { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
      { label: 'My Goals', path: '/goals', icon: '🎯' },
      { label: 'Skills', path: '/skills', icon: '🛠️' },
      { label: 'Profile', path: '/profile', icon: '👤' },
    ]

    // Add role-specific menu items
    if (user?.role === 'admin') {
      baseMenu.push(
        { label: 'User Management', path: '/users', icon: '👥' },
        { label: 'Reports', path: '/reports', icon: '📊' }
      )
    }

    if (user?.role === 'reviewer' || user?.role === 'admin') {
      baseMenu.push(
        { label: 'Reviews', path: '/reviews', icon: '📝' }
      )
    }

    return baseMenu
  }

  const menuConfig = getMenuConfig()

  return (
    <aside
      className={
        `mt-8 ml-8
        ${collapsed ? 'w-16' : 'w-64'}
        bg-gradient-to-b from-blue-100 to-blue-50
        shadow-lg z-30
        h-[calc(100vh-6rem)] flex flex-col
        transition-all duration-300`
      }
    >
      {/* Collapse/Expand Button */}
      <button
        className="p-2 m-2 rounded hover:bg-blue-200 transition-colors self-end"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <span className="text-lg">{collapsed ? '→' : '←'}</span>
      </button>
      <nav className="flex-1 py-6 px-2 space-y-2">
        {menuConfig.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={
              `flex items-center gap-3 px-2 py-3 rounded-lg font-medium transition-colors
              ${location.pathname === item.path
                ? 'bg-blue-100 text-blue-700 shadow'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
              ${collapsed ? 'justify-center' : ''}`
            }
          >
            <span className="w-6 h-6 flex items-center justify-center text-xl">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
      <div className={`p-4 border-t ${collapsed ? 'text-center' : ''}`}>
        <span className="text-xs text-gray-400 block">Logged in as:</span>
        <div className="font-semibold text-gray-700">{user?.name || 'User'}</div>
        <div className="text-xs text-blue-600 capitalize">{user?.role || 'employee'}</div>
      </div>
    </aside>
  )
}

export default Sidebar 