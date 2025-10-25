import { createContext, useContext, useState, useEffect } from 'react'

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
  const [users, setUsers] = useState(mockUsers)

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('dental_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    setLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Find user in mock data
    const foundUser = users.find(u => 
      (u.username === username || u.email === username) && 
      u.password === password && 
      u.isActive
    )
    
    if (foundUser) {
      const userData = { ...foundUser }
      delete userData.password // Don't store password in state
      
      setUser(userData)
      localStorage.setItem('dental_user', JSON.stringify(userData))
      setLoading(false)
      return { success: true, user: userData }
    } else {
      setLoading(false)
      return { success: false, error: 'Invalid credentials' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('dental_user')
  }

  const updateUser = (updatedUser) => {
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
    )
    
    if (user && user.id === updatedUser.id) {
      const userData = { ...updatedUser }
      delete userData.password
      setUser(userData)
      localStorage.setItem('dental_user', JSON.stringify(userData))
    }
  }

  const addUser = (newUser) => {
    const userWithId = {
      ...newUser,
      id: Math.max(...users.map(u => u.id)) + 1,
      isActive: true,
      lastLogin: null
    }
    setUsers(prevUsers => [...prevUsers, userWithId])
    return userWithId
  }

  const deleteUser = (userId) => {
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId))
    
    // If current user is deleted, logout
    if (user && user.id === userId) {
      logout()
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
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
