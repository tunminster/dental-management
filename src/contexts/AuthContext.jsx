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
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('dental_user')
    const savedToken = localStorage.getItem('authToken')
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
      // Verify token is still valid
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async () => {
    try {
      const profile = await authAPI.getProfile()
      setUser(profile)
      localStorage.setItem('dental_user', JSON.stringify(profile))
    } catch (error) {
      // Token is invalid, clear everything
      localStorage.removeItem('authToken')
      localStorage.removeItem('dental_user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    setLoading(true)
    
    try {
      const response = await authAPI.login({ username, password })
      const { token, user: userData } = response
      
      // Store token and user data
      localStorage.setItem('authToken', token)
      localStorage.setItem('dental_user', JSON.stringify(userData))
      
      setUser(userData)
      setLoading(false)
      return { success: true, user: userData }
    } catch (error) {
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
