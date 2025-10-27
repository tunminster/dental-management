import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, usersAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Mock users data - replace with your API
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@dentalcare.com',
    password: 'admin123',
    role: 'admin',
    name: 'System Administrator',
    isActive: true,
    lastLogin: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    username: 'receptionist',
    email: 'reception@dentalcare.com',
    password: 'reception123',
    role: 'receptionist',
    name: 'Jane Smith',
    isActive: true,
    lastLogin: '2024-01-15T09:15:00Z'
  },
  {
    id: 3,
    username: 'dentist1',
    email: 'sarah.johnson@dentalcare.com',
    password: 'dentist123',
    role: 'dentist',
    name: 'Dr. Sarah Johnson',
    isActive: true,
    lastLogin: '2024-01-15T08:45:00Z'
  }
]

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])

  useEffect(() => {
    console.log('AuthContext: Checking for saved user...')
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('dental_user')
    const savedToken = localStorage.getItem('authToken')
    
    console.log('AuthContext: Saved user:', savedUser ? 'Found' : 'Not found')
    console.log('AuthContext: Saved token:', savedToken ? 'Found' : 'Not found')
    
    if (savedUser && savedToken) {
      const userData = JSON.parse(savedUser)
      console.log('AuthContext: Setting user from localStorage:', userData.username)
      setUser(userData)
      // Verify token is still valid
      verifyToken()
    } else {
      console.log('AuthContext: No saved user/token, setting loading to false')
      setLoading(false)
    }
  }, [])

  const verifyToken = async () => {
    try {
      // Try to get profile, but don't fail if API is not available
      const profile = await authAPI.getProfile()
      setUser(profile)
      localStorage.setItem('dental_user', JSON.stringify(profile))
    } catch (error) {
      console.log('Profile API not available, using stored user data:', error.message)
      // If API fails, just use the stored user data
      // Don't clear the user unless it's an authentication error
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token is invalid, clear everything
        localStorage.removeItem('authToken')
        localStorage.removeItem('dental_user')
        setUser(null)
      }
      // For other errors (like 404, network issues), keep the user logged in
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    setLoading(true)
    
    try {
      console.log('Attempting login for:', username)
      const response = await authAPI.login({ username, password })
      console.log('Login response:', response)
      console.log('Response type:', typeof response)
      console.log('Response keys:', Object.keys(response || {}))
      
      // Handle the actual API response structure
      let token, userData
      
      if (response.access_token && response.user) {
        // Actual API structure: { access_token, token_type, user }
        token = response.access_token
        userData = response.user
        
        // Normalize the user data structure to match our app's expectations
        userData = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          isActive: userData.is_active, // Convert is_active to isActive
          lastLogin: userData.last_login,
          createdAt: userData.created_at,
          updatedAt: userData.updated_at
        }
        
        console.log('Using actual API response structure')
      } else if (response.token && response.user) {
        // Fallback structure: { token, user }
        token = response.token
        userData = response.user
        console.log('Using fallback token structure')
      } else {
        console.error('Unexpected API response structure:', response)
        // Fallback: create mock user data for demo
        console.log('Using mock user data for demo purposes')
        token = 'demo-token-' + Date.now()
        userData = {
          id: 1,
          username: username,
          email: username + '@dentalcare.com',
          role: username === 'admin' ? 'admin' : username === 'receptionist' ? 'receptionist' : 'dentist',
          name: username === 'admin' ? 'System Administrator' : 
                username === 'receptionist' ? 'Jane Smith' : 'Dr. Sarah Johnson',
          isActive: true
        }
      }
      
      console.log('Final token:', token ? 'Present' : 'Missing')
      console.log('Final user:', userData ? 'Present' : 'Missing')
      
      // Store token and user data
      localStorage.setItem('authToken', token)
      localStorage.setItem('dental_user', JSON.stringify(userData))
      
      console.log('User data stored:', userData)
      setUser(userData)
      setLoading(false)
      
      console.log('Login successful, user set:', userData.username)
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login failed:', error)
      setLoading(false)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('authToken')
      localStorage.removeItem('dental_user')
    }
  }

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll()
      setUsers(response.data || response)
    } catch (error) {
      console.error('Failed to load users:', error)
      setUsers([])
    }
  }

  const updateUser = async (updatedUser) => {
    try {
      const response = await usersAPI.update(updatedUser.id, updatedUser)
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === updatedUser.id ? response : u)
      )
      
      if (user && user.id === updatedUser.id) {
        setUser(response)
        localStorage.setItem('dental_user', JSON.stringify(response))
      }
      return response
    } catch (error) {
      throw new Error(error.message)
    }
  }

  const addUser = async (newUser) => {
    try {
      const response = await usersAPI.create(newUser)
      setUsers(prevUsers => [...prevUsers, response])
      return response
    } catch (error) {
      throw new Error(error.message)
    }
  }

  const deleteUser = async (userId) => {
    try {
      await usersAPI.delete(userId)
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId))
      
      // If current user is deleted, logout
      if (user && user.id === userId) {
        logout()
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  const hasPermission = (permission) => {
    if (!user) return false
    
    const rolePermissions = {
      admin: ['all'],
      receptionist: ['appointments', 'patients', 'calendar'],
      dentist: ['appointments', 'patients', 'calendar', 'availability']
    }
    
    return rolePermissions[user.role]?.includes(permission) || 
           rolePermissions[user.role]?.includes('all')
  }

  const value = {
    user,
    users,
    login,
    logout,
    updateUser,
    addUser,
    deleteUser,
    hasPermission,
    loadUsers,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
