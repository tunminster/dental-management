import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, User, Loader, AlertCircle } from 'lucide-react'
import { calendarAPI } from '../services/api'

const currentDate = new Date()
const currentMonth = currentDate.getMonth()
const currentYear = currentDate.getFullYear()

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const appointments = [
  { id: 1, patient: 'John Smith', time: '09:00', treatment: 'Cleaning', date: '2025-10-25' },
  { id: 2, patient: 'Sarah Johnson', time: '10:30', treatment: 'Checkup', date: '2024-01-15' },
  { id: 3, patient: 'Mike Davis', time: '14:00', treatment: 'Filling', date: '2024-01-15' },
  { id: 4, patient: 'Emily Wilson', time: '09:30', treatment: 'Extraction', date: '2024-01-16' },
  { id: 5, patient: 'Robert Brown', time: '11:00', treatment: 'Root Canal', date: '2024-01-16' },
]

export default function Calendar() {
  const [appointments, setAppointments] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedDate, setSelectedDate] = useState(null)
  const [showAvailability, setShowAvailability] = useState(true)

  useEffect(() => {
    loadCalendarData()
  }, [selectedMonth, selectedYear])

  const loadCalendarData = async () => {
    try {
      setLoading(true)
      
      // Calculate beginning and end of month dates
      const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1)
      const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0)
      
      // Format dates as YYYY-MM-DD
      const dateFrom = firstDayOfMonth.toISOString().split('T')[0]
      const dateTo = lastDayOfMonth.toISOString().split('T')[0]
      
      const params = {
        date_from: dateFrom,
        date_to: dateTo
      }
      
      console.log('Calendar API params:', params)
      
      // Load both appointments and availability in parallel
      const [appointmentsResponse, availabilityResponse] = await Promise.all([
        calendarAPI.getAppointments(params),
        calendarAPI.getAvailability(params)
      ])
      
      // Normalize appointment data to match UI expectations
      const appointmentsData = Array.isArray(appointmentsResponse?.data) ? appointmentsResponse.data : 
                             Array.isArray(appointmentsResponse) ? appointmentsResponse : []
      
      const normalizedAppointments = appointmentsData.map(appointment => ({
        id: appointment.id,
        patient: appointment.patient,
        phone: appointment.phone,
        dentistId: appointment.dentist_id,
        dentistName: appointment.dentist_name,
        date: appointment.appointment_date, // API uses 'appointment_date', UI expects 'date'
        time: appointment.appointment_time, // API uses 'appointment_time', UI expects 'time'
        treatment: appointment.treatment,
        status: appointment.status,
        notes: appointment.notes,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at
      }))
      
      // Normalize availability data
      const availabilityData = Array.isArray(availabilityResponse?.data) ? availabilityResponse.data : 
                             Array.isArray(availabilityResponse) ? availabilityResponse : []
      
      const normalizedAvailability = availabilityData.map(avail => ({
        id: avail.id,
        dentistId: avail.dentist_id,
        dentistName: avail.dentist_name,
        date: avail.date,
        timeSlots: avail.time_slots || [],
        createdAt: avail.created_at,
        updatedAt: avail.updated_at
      }))
      
      console.log('Normalized calendar appointments:', normalizedAppointments)
      console.log('Normalized availability:', normalizedAvailability)
      
      setAppointments(normalizedAppointments)
      setAvailability(normalizedAvailability)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay()
  }

  const getAppointmentsForDate = (date) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    return appointments.filter(apt => apt.date === dateStr)
  }

  const getAvailabilityForDate = (date) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    return availability.filter(avail => {
      // Only include dentists who have at least one available time slot
      if (avail.date !== dateStr) return false
      
      // Check if any time slot is available
      const hasAvailableSlot = avail.timeSlots && avail.timeSlots.some(slot => slot.available === true)
      return hasAvailableSlot
    })
  }

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11)
        setSelectedYear(selectedYear - 1)
      } else {
        setSelectedMonth(selectedMonth - 1)
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0)
        setSelectedYear(selectedYear + 1)
      } else {
        setSelectedMonth(selectedMonth + 1)
      }
    }
  }

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear)
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">View and manage your appointment schedule</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAvailability(!showAvailability)}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              showAvailability 
                ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            {showAvailability ? 'Hide Availability' : 'Show Availability'}
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Appointment
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700 text-sm">{error}</span>
          <button
            onClick={loadAppointments}
            className="ml-auto btn-primary"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[selectedMonth]} {selectedYear}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2"></div>
                }

                const dayAppointments = getAppointmentsForDate(day)
                const dayAvailability = getAvailabilityForDate(day)
                const isToday = day === currentDate.getDate() && 
                               selectedMonth === currentMonth && 
                               selectedYear === currentYear

                return (
                  <div
                    key={day}
                    className={`p-2 min-h-[80px] border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                      isToday ? 'bg-primary-50 border-primary-200' : ''
                    }`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={`text-sm font-medium ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                      {day}
                    </div>
                    <div className="mt-1 space-y-1">
                      {/* Show appointments */}
                      {dayAppointments.slice(0, 2).map(appointment => (
                        <div
                          key={appointment.id}
                          className="text-xs bg-primary-100 text-primary-800 px-1 py-0.5 rounded truncate"
                        >
                          {appointment.time} - {appointment.patient}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayAppointments.length - 2} more appointments
                        </div>
                      )}
                      
                      {/* Show availability when enabled */}
                      {showAvailability && dayAvailability.length > 0 && (
                        <div className="text-xs text-green-600 font-medium">
                          {dayAvailability.length} dentist{dayAvailability.length > 1 ? 's' : ''} available
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedDate ? 
                `${monthNames[selectedMonth]} ${selectedDate}, ${selectedYear}` : 
                'Select a date'
              }
            </h3>
            
            {selectedDate && (
              <div className="space-y-4">
                {/* Appointments Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Appointments</h4>
                  {getAppointmentsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-2">
                      {getAppointmentsForDate(selectedDate).map(appointment => (
                        <div key={appointment.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{appointment.patient}</span>
                          </div>
                          <div className="text-sm text-gray-600">{appointment.treatment}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 border border-gray-200 rounded-lg">
                      <div className="text-gray-400 mb-1">No appointments</div>
                      <div className="text-xs text-gray-500">This day is free</div>
                    </div>
                  )}
                </div>

                {/* Availability Section */}
                {showAvailability && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Dentist Availability</h4>
                    {getAvailabilityForDate(selectedDate).length > 0 ? (
                      <div className="space-y-2">
                        {getAvailabilityForDate(selectedDate).map(avail => {
                          // Filter to only show available time slots
                          const availableSlots = avail.timeSlots.filter(slot => slot.available === true)
                          
                          return (
                            <div key={avail.id} className="border border-green-200 rounded-lg p-3 bg-green-50">
                              <div className="text-sm font-medium text-green-800 mb-2">
                                {avail.dentistName}
                              </div>
                              <div className="space-y-1">
                                {availableSlots.length > 0 ? (
                                  availableSlots.map((slot, index) => (
                                    <div key={index} className="text-xs text-green-700">
                                      {slot.start} - {slot.end} 
                                      <span className="ml-2 px-1 py-0.5 rounded text-xs bg-green-100 text-green-800">
                                        Available
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-xs text-gray-500">No available slots</div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 border border-gray-200 rounded-lg">
                        <div className="text-gray-400 mb-1">No dentists available</div>
                        <div className="text-xs text-gray-500">All dentists are fully booked</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
