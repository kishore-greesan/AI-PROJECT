import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
import Profile from './pages/Profile'
import { Layout } from './components'
import Goals from './pages/Goals'
import Skills from './pages/Skills'
import Reviews from './pages/Reviews'
import GoalReview from './pages/GoalReview'
import Users from './pages/Users'
import Reports from './pages/Reports'

function App() {
  const { isAuthenticated } = useAuthStore()
  
  console.log('App component - isAuthenticated:', isAuthenticated)

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="register" element={<Register />} />
        <Route path="goals" element={<Goals />} />
        <Route path="skills" element={<Skills />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="goal-review" element={<GoalReview />} />
        <Route path="users" element={<Users />} />
        <Route path="reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default App 