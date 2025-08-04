import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// import { useForm } from 'react-hook-form'
// import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
// import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { getApiUrl } from '../services/api'
// import { authService } from '../services/auth'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    department: '',
    title: '',
    phone: ''
  })
  const [errors, setErrors] = useState({})
  const { login, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    
    try {
      const apiUrl = getApiUrl()
      console.log('Using API URL:', apiUrl)
      console.log('Login attempt with:', { email, password })
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Login error response:', errorData)
        throw new Error(errorData.detail || 'Login failed')
      }
      
      const data = await response.json()
      console.log('Login response:', data)
      
      // Get user profile to get the actual role from backend
      const userResponse = await fetch(`${apiUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!userResponse.ok) {
        throw new Error('Failed to get user profile')
      }
      
      const userProfile = await userResponse.json()
      console.log('User profile:', userProfile)
      
      // Create user data with actual role from backend
      const userData = { 
        email: userProfile.email, 
        name: userProfile.name,
        role: userProfile.role 
      }
      
      console.log('Calling login with userData:', userData)
      login(userData, data.access_token, data.refresh_token)
      
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        console.log('Navigating to dashboard...')
        alert('Login successful!')
        navigate('/dashboard')
      }, 100)
      
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ login: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validate registration data
    const newErrors = {}
    if (!registrationData.name.trim()) newErrors.name = 'Name is required'
    if (!registrationData.email.trim()) newErrors.email = 'Email is required'
    if (!registrationData.password) newErrors.password = 'Password is required'
    if (registrationData.password !== registrationData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (!registrationData.department.trim()) newErrors.department = 'Department is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const apiUrl = getApiUrl()
      console.log('Sending registration data:', {
        name: registrationData.name.trim(),
        email: registrationData.email.trim(),
        password: registrationData.password,
        role: registrationData.role,
        department: registrationData.department.trim(),
        title: registrationData.title.trim() || null,
        phone: registrationData.phone.trim() || null
      })
      
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registrationData.name.trim(),
          email: registrationData.email.trim(),
          password: registrationData.password,
          role: registrationData.role,
          department: registrationData.department.trim(),
          title: registrationData.title.trim() || null,
          phone: registrationData.phone.trim() || null
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Registration error response:', errorData)
        
        // Handle validation errors
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const validationErrors = {}
          errorData.detail.forEach(error => {
            if (error.loc && error.loc.length > 1) {
              const field = error.loc[1]
              validationErrors[field] = error.msg
            }
          })
          setErrors(validationErrors)
          return
        }
        
        throw new Error(errorData.detail || 'Registration failed')
      }

      const userData = await response.json()
      console.log('Registration successful:', userData)
      
      alert('Registration successful! Your account is pending approval. You will be notified once approved.')
      setIsRegistering(false)
      setRegistrationData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee',
        department: '',
        title: '',
        phone: ''
      })
      
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ registration: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegistrationChange = (e) => {
    const { name, value } = e.target
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '288px',
        height: '288px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '384px',
        height: '384px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '320px',
        height: '320px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }}></div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '448px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>i</span>
              </div>
            </div>
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '8px',
            margin: 0
          }}>
            Welcome to EPMS!
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px',
            lineHeight: '1.6',
            margin: 0
          }}>
            Manage your performance goals, track progress, and get feedback from your managers. 
            Everything you need for professional growth in one place.
          </p>
        </div>

        {/* Toggle Buttons */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => setIsRegistering(false)}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: isRegistering ? 'transparent' : 'white',
              color: isRegistering ? 'white' : '#667eea',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsRegistering(true)}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: isRegistering ? 'white' : 'transparent',
              color: isRegistering ? '#667eea' : 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Register
          </button>
        </div>

        {/* Form Container */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '32px'
        }}>
          {!isRegistering ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {errors.login && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#DC2626',
                  fontSize: '14px'
                }}>
                  {errors.login}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '12px',
                    transform: 'translateY(-50%)',
                    color: '#9CA3AF',
                    fontSize: '20px'
                  }}>
                    📧
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 44px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    placeholder="Enter your email"
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '12px',
                    transform: 'translateY(-50%)',
                    color: '#9CA3AF',
                    fontSize: '20px'
                  }}>
                    🔒
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 44px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    placeholder="Enter your password"
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Forgot Password Link */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: '600',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.39)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 20px 0 rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 14px 0 rgba(102, 126, 234, 0.39)';
                  }
                }}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '8px'
                    }}></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Divider */}
              <div style={{ position: 'relative', margin: '16px 0' }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: '#E5E7EB'
                }}></div>
                <div style={{
                  position: 'relative',
                  textAlign: 'center'
                }}>
                  <span style={{
                    background: 'white',
                    padding: '0 12px',
                    color: '#6B7280',
                    fontSize: '14px'
                  }}>OR</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                style={{
                  width: '100%',
                  background: 'white',
                  border: '1px solid #D1D5DB',
                  color: '#374151',
                  fontWeight: '500',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'linear-gradient(135deg, #EA4335 0%, #FBBC05 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>G</span>
                </div>
                <span>Sign in with Google</span>
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegistrationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {errors.registration && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#DC2626',
                  fontSize: '14px'
                }}>
                  {errors.registration}
                </div>
              )}

              {/* Name Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={registrationData.name}
                  onChange={handleRegistrationChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.name ? '1px solid #FCA5A5' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  placeholder="Enter your full name"
                  required
                />
                {errors.name && (
                  <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={registrationData.email}
                  onChange={handleRegistrationChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.email ? '1px solid #FCA5A5' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  placeholder="Enter your email address"
                  required
                />
                {errors.email && (
                  <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={registrationData.password}
                  onChange={handleRegistrationChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.password ? '1px solid #FCA5A5' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  placeholder="Enter password"
                  required
                />
                {errors.password && (
                  <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={registrationData.confirmPassword}
                  onChange={handleRegistrationChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.confirmPassword ? '1px solid #FCA5A5' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  placeholder="Confirm password"
                  required
                />
                {errors.confirmPassword && (
                  <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{errors.confirmPassword}</p>
                )}
              </div>

              {/* Role Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Role *
                </label>
                <select
                  name="role"
                  value={registrationData.role}
                  onChange={handleRegistrationChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <option value="employee">Employee</option>
                  <option value="reviewer">Reviewer/Manager</option>
                </select>
              </div>

              {/* Department Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  value={registrationData.department}
                  onChange={handleRegistrationChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.department ? '1px solid #FCA5A5' : '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  placeholder="Enter your department"
                  required
                />
                {errors.department && (
                  <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{errors.department}</p>
                )}
              </div>

              {/* Title Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Job Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={registrationData.title}
                  onChange={handleRegistrationChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  placeholder="Enter your job title"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={registrationData.phone}
                  onChange={handleRegistrationChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: '600',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.39)'
                }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '14px',
            margin: 0
          }}>
            {!isRegistering ? (
              <>
                Don't have an account?{' '}
                <button 
                  onClick={() => setIsRegistering(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Register here
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button 
                  onClick={() => setIsRegistering(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Sign in here
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Login 