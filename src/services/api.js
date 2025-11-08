import axios from 'axios'

// API Configuration - using import.meta.env for Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000
const API_RETRY_ATTEMPTS = parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3


console.log('API Base URL:', API_BASE_URL)
// Log environment configuration for debugging
console.log('API Configuration:', {
  API_BASE_URL,
  API_TIMEOUT,
  API_RETRY_ATTEMPTS,
  NODE_ENV: import.meta.env.MODE
})

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken')
      localStorage.removeItem('dental_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/me')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get profile')
    }
  },

  refreshToken: async () => {
    try {
      const response = await apiClient.post('/auth/refresh')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token refresh failed')
    }
  }
}

// Appointments API
export const appointmentsAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/appointments', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments')
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/api/appointments/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointment')
    }
  },

  create: async (appointmentData) => {
    try {
      const response = await apiClient.post('/api/appointments', appointmentData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create appointment')
    }
  },

  update: async (id, appointmentData) => {
    try {
      const response = await apiClient.put(`/api/appointments/${id}`, appointmentData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update appointment')
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/api/appointments/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete appointment')
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await apiClient.put(`/api/appointments/${id}/status`, null, {
        params: { status }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update appointment status')
    }
  }
}

// Patients API
export const patientsAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/patients', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch patients')
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/api/patients/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch patient')
    }
  },

  create: async (patientData) => {
    try {
      const response = await apiClient.post('/api/patients', patientData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create patient')
    }
  },

  update: async (id, patientData) => {
    try {
      const response = await apiClient.put(`/api/patients/${id}`, patientData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update patient')
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/api/patients/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete patient')
    }
  },

  getAppointments: async (patientId) => {
    try {
      const response = await apiClient.get(`/api/patients/${patientId}/appointments`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch patient appointments')
    }
  }
}

// Dentists API
export const dentistsAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/dentists', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dentists')
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/api/dentists/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dentist')
    }
  },

  create: async (dentistData) => {
    try {
      const response = await apiClient.post('/api/dentists', dentistData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create dentist')
    }
  },

  update: async (id, dentistData) => {
    try {
      const response = await apiClient.put(`/api/dentists/${id}`, dentistData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update dentist')
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/api/dentists/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete dentist')
    }
  },

  getAppointments: async (dentistId, params = {}) => {
    try {
      const response = await apiClient.get(`/api/dentists/${dentistId}/appointments`, { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dentist appointments')
    }
  }
}

// Availability API
export const availabilityAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/availability', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch availability')
    }
  },

  getByDentist: async (dentistId, params = {}) => {
    try {
      const response = await apiClient.get(`/api/availability/dentist/${dentistId}`, { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dentist availability')
    }
  },

  create: async (availabilityData) => {
    try {
      const response = await apiClient.post('/api/availability', availabilityData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create availability')
    }
  },

  update: async (id, availabilityData) => {
    try {
      const response = await apiClient.put(`/api/availability/${id}`, availabilityData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update availability')
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/api/availability/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete availability')
    }
  },

  updateTimeSlot: async (id, slotData) => {
    try {
      const response = await apiClient.patch(`/api/availability/${id}/slot`, slotData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update time slot')
    }
  }
}

// Users API
export const usersAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/users', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users')
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/api/users/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user')
    }
  },

  create: async (userData) => {
    try {
      const response = await apiClient.post('/api/users', userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create user')
    }
  },

  update: async (id, userData) => {
    try {
      const response = await apiClient.put(`/api/users/${id}`, userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user')
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/api/users/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user')
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/api/users/${id}/status`, { isActive: status })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user status')
    }
  }
}

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/stats')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats')
    }
  },

  getTodayAppointments: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/appointments/today')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch today\'s appointments')
    }
  },

  getRecentActivity: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/activity')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recent activity')
    }
  }
}

// Calendar API
export const calendarAPI = {
  getAppointments: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/appointments', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch calendar appointments')
    }
  },

  getAvailability: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/availability', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch calendar availability')
    }
  }
}

// Settings API
export const settingsAPI = {
  get: async () => {
    try {
      const response = await apiClient.get('/api/settings')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch settings')
    }
  },

  update: async (settingsData) => {
    try {
      const response = await apiClient.put('/api/settings', settingsData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update settings')
    }
  },

  updatePassword: async (passwordData) => {
    try {
      const response = await apiClient.put('/api/settings/password', passwordData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update password')
    }
  }
}

export default apiClient
