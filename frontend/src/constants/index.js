// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// User Roles
export const USER_ROLES = {
  EMPLOYEE: 'employee',
  REVIEWER: 'reviewer',
  ADMIN: 'admin'
}

// Goal Status
export const GOAL_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  IN_PROGRESS: 'in_progress'
}

// Review Status
export const REVIEW_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
}

// Skill Levels
export const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  EXPERT: 'expert'
}

// Skill Categories
export const SKILL_CATEGORIES = {
  TECHNICAL: 'technical',
  SOFT_SKILLS: 'soft_skills',
  LEADERSHIP: 'leadership',
  DOMAIN_KNOWLEDGE: 'domain_knowledge',
  TOOLS: 'tools'
}

// Notification Types
export const NOTIFICATION_TYPES = {
  GOAL_CREATED: 'goal_created',
  GOAL_UPDATED: 'goal_updated',
  GOAL_APPROVED: 'goal_approved',
  GOAL_REJECTED: 'goal_rejected',
  REVIEW_REQUESTED: 'review_requested',
  REVIEW_COMPLETED: 'review_completed',
  SYSTEM: 'system'
}

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif']

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language'
}

// Theme
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
}

// Routes
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  GOALS: '/goals',
  SKILLS: '/skills',
  REVIEWS: '/reviews',
  USERS: '/users',
  REPORTS: '/reports'
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An internal server error occurred.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  GOAL_CREATED: 'Goal created successfully!',
  GOAL_UPDATED: 'Goal updated successfully!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
  FILE_UPLOADED: 'File uploaded successfully!'
} 