import { useState, useEffect } from 'react'
import { Calendar, Users, Clock, TrendingUp, Loader, AlertCircle } from 'lucide-react'
import { dashboardAPI } from '../services/api'

const stats = [
  { name: 'Today\'s Appointments', value: '12', icon: Calendar, change: '+2', changeType: 'positive' },
  { name: 'Total Patients', value: '1,234', icon: Users, change: '+5.4%', changeType: 'positive' },
  { name: 'Pending Appointments', value: '8', icon: Clock, change: '-12%', changeType: 'negative' },
  { name: 'Revenue This Month', value: '$12,450', icon: TrendingUp, change: '+8.2%', changeType: 'positive' },
]

const recentAppointments = [
  { id: 1, patient: 'John Smith', time: '9:00 AM', treatment: 'Cleaning', status: 'confirmed' },
  { id: 2, patient: 'Sarah Johnson', time: '10:30 AM', treatment: 'Checkup', status: 'confirmed' },
  { id: 3, patient: 'Mike Davis', time: '2:00 PM', treatment: 'Filling', status: 'pending' },
  { id: 4, patient: 'Emily Wilson', time: '3:30 PM', treatment: 'Extraction', status: 'confirmed' },
]

// Helper function to map stat names to icons
const getIconForStat = (statName) => {
  const iconMap = {
    "Today's Appointments": Calendar,
    "Total Patients": Users,
    "Pending Appointments": Clock,
    "Revenue This Month": TrendingUp,
  }
  return iconMap[statName] || Calendar // Default to Calendar icon
}

export default function Dashboard() {
  const [stats, setStats] = useState([])
  const [recentAppointments, setRecentAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsResponse, appointmentsResponse] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getTodayAppointments()
      ])
      
      console.log('Dashboard API responses:', {
        statsResponse,
        appointmentsResponse,
        statsType: typeof statsResponse,
        appointmentsType: typeof appointmentsResponse
      })
      
      // Process stats data from API response
      let statsData = stats // Default to mock data
      
      if (statsResponse?.stats && Array.isArray(statsResponse.stats)) {
        // API returns { stats: [...] } format
        statsData = statsResponse.stats.map(stat => ({
          ...stat,
          icon: getIconForStat(stat.name) // Add missing icon property
        }))
      } else if (Array.isArray(statsResponse?.data)) {
        // API returns { data: [...] } format
        statsData = statsResponse.data.map(stat => ({
          ...stat,
          icon: getIconForStat(stat.name) // Add missing icon property
        }))
      } else if (Array.isArray(statsResponse)) {
        // API returns [...] format directly
        statsData = statsResponse.map(stat => ({
          ...stat,
          icon: getIconForStat(stat.name) // Add missing icon property
        }))
      }
      
      const appointmentsData = Array.isArray(appointmentsResponse?.data) ? appointmentsResponse.data : 
                              Array.isArray(appointmentsResponse) ? appointmentsResponse : recentAppointments
      
      // Normalize appointment data to match UI expectations
      const normalizedAppointments = Array.isArray(appointmentsData) ? appointmentsData.map(appointment => ({
        id: appointment.id,
        patient: appointment.patient,
        patientName: appointment.patient, // UI expects 'patientName' for display
        phone: appointment.phone,
        dentistId: appointment.dentist_id || appointment.dentistId,
        dentistName: appointment.dentist_name || appointment.dentistName,
        date: appointment.date,
        time: appointment.time,
        treatment: appointment.treatment,
        status: appointment.status,
        notes: appointment.notes,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at
      })) : recentAppointments
      
      console.log('Processed data:', {
        statsData: Array.isArray(statsData) ? `${statsData.length} items` : 'Not array',
        statsDataSample: Array.isArray(statsData) && statsData.length > 0 ? statsData[0] : 'No data',
        appointmentsData: Array.isArray(appointmentsData) ? `${appointmentsData.length} items` : 'Not array'
      })
      
      setStats(statsData)
      setRecentAppointments(normalizedAppointments)
    } catch (error) {
      console.error('Dashboard API error:', error)
      // Use mock data as fallback
      setStats(stats)
      setRecentAppointments(recentAppointments)
      setError('Failed to load dashboard data. Showing sample data.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening at your dental practice.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700 text-sm">{error}</span>
          <button
            onClick={loadDashboardData}
            className="ml-auto btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at your dental practice.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.isArray(stats) && stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Appointments</h3>
        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {Array.isArray(recentAppointments) && recentAppointments.map((appointment) => (
              <li key={appointment.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {appointment.patientName?.split(' ').map(n => n[0]).join('') || 'P'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{appointment.patientName}</p>
                    <p className="text-sm text-gray-500">{appointment.treatment}</p>
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-500">{appointment.time}</div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {!Array.isArray(recentAppointments) || recentAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No appointments scheduled for today.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
