// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation
export const validatePassword = (password) => {
  const errors = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one digit')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Required field validation
export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`
  }
  return null
}

// Number validation
export const validateNumber = (value, fieldName, min = null, max = null) => {
  const num = Number(value)
  
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`
  }
  
  if (min !== null && num < min) {
    return `${fieldName} must be at least ${min}`
  }
  
  if (max !== null && num > max) {
    return `${fieldName} must be at most ${max}`
  }
  
  return null
}

// Date validation
export const validateDate = (date, fieldName) => {
  if (!date) {
    return `${fieldName} is required`
  }
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return `${fieldName} must be a valid date`
  }
  
  return null
}

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {}
  
  Object.keys(validationRules).forEach(field => {
    const value = formData[field]
    const rules = validationRules[field]
    
    for (const rule of rules) {
      const error = rule(value, field)
      if (error) {
        errors[field] = error
        break
      }
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
} 