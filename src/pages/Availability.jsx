import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Plus, Edit, Trash2, Save, X, Loader, AlertCircle } from 'lucide-react'
import { availabilityAPI, dentistsAPI } from '../services/api'
import { formatDateInClinicTimezone } from '../utils/timezone'

const dentists = [
  { id: 1, name: 'Dr. Sarah Johnson', specialization: 'General Dentistry' },
  { id: 2, name: 'Dr. Michael Chen', specialization: 'Orthodontics' },
  { id: 3, name: 'Dr. Emily Rodriguez', specialization: 'Oral Surgery' },
  { id: 4, name: 'Dr. James Wilson', specialization: 'Pediatric Dentistry' }
]

const availabilityData = [
  {
    id: 1,
    dentistId: 1,
    dentistName: 'Dr. Sarah Johnson',
    date: '2024-01-15',
    timeSlots: [
      { start: '09:00', end: '10:00', available: true },
      { start: '10:00', end: '11:00', available: true },
      { start: '11:00', end: '12:00', available: false },
      { start: '14:00', end: '15:00', available: true },
      { start: '15:00', end: '16:00', available: true },
      { start: '16:00', end: '17:00', available: true }
    ]
  },
  {
    id: 2,
    dentistId: 2,
    dentistName: 'Dr. Michael Chen',
    date: '2024-01-15',
    timeSlots: [
      { start: '08:00', end: '09:00', available: true },
      { start: '09:00', end: '10:00', available: true },
      { start: '10:00', end: '11:00', available: false },
      { start: '11:00', end: '12:00', available: true },
      { start: '13:00', end: '14:00', available: true },
      { start: '14:00', end: '15:00', available: true },
      { start: '15:00', end: '16:00', available: false }
    ]
  },
  {
    id: 3,
    dentistId: 1,
    dentistName: 'Dr. Sarah Johnson',
    date: '2024-01-16',
    timeSlots: [
      { start: '09:00', end: '10:00', available: true },
      { start: '10:00', end: '11:00', available: true },
      { start: '11:00', end: '12:00', available: true },
      { start: '14:00', end: '15:00', available: false },
      { start: '15:00', end: '16:00', available: true },
      { start: '16:00', end: '17:00', available: true }
    ]
  }
]

export default function Availability() {
  const [availabilityData, setAvailabilityData] = useState([])
  const [dentists, setDentists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDentist, setSelectedDentist] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAvailability, setEditingAvailability] = useState(null)
  const [editTimeSlots, setEditTimeSlots] = useState([])
  const [submitting, setSubmitting] = useState(false)
  
  // Form state for adding availability
  const [formDentistId, setFormDentistId] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formTimeSlots, setFormTimeSlots] = useState([])
  const [selectedDentistDetails, setSelectedDentistDetails] = useState(null)
  const [loadingDentistDetails, setLoadingDentistDetails] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [availabilityResponse, dentistsResponse] = await Promise.all([
        availabilityAPI.getAll(),
        dentistsAPI.getAll()
      ])
      
      // Normalize availability data to match UI expectations
      const availabilityData = Array.isArray(availabilityResponse?.data) ? availabilityResponse.data : 
                               Array.isArray(availabilityResponse) ? availabilityResponse : []
      
      const normalizedAvailability = availabilityData.map(availability => ({
        id: availability.id,
        dentistId: availability.dentist_id, // API uses 'dentist_id', UI expects 'dentistId'
        dentistName: availability.dentist_name, // API uses 'dentist_name', UI expects 'dentistName'
        date: availability.date,
        timeSlots: availability.time_slots || [], // API uses 'time_slots', UI expects 'timeSlots'
        createdAt: availability.created_at,
        updatedAt: availability.updated_at
      }))
      
      console.log('Normalized availability data:', normalizedAvailability)
      setAvailabilityData(normalizedAvailability)
      
      // Normalize dentist data to match UI expectations
      const dentistsData = Array.isArray(dentistsResponse?.data) ? dentistsResponse.data : 
                          Array.isArray(dentistsResponse) ? dentistsResponse : []
      
      const normalizedDentists = dentistsData.map(dentist => ({
        id: dentist.id,
        name: dentist.name,
        specialization: dentist.specialty // API uses 'specialty', UI expects 'specialization'
      }))
      
      setDentists(normalizedDentists)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAvailability = async (availabilityData) => {
    try {
      setSubmitting(true)
      const response = await availabilityAPI.create(availabilityData)
      
      console.log('Add availability API response:', response)
      
      // Handle API response - could be nested in data property
      const availability = response?.data || response
      
      // Find dentist name from dentists list if not provided by API
      const dentistId = availability.dentist_id || availability.dentistId
      const dentist = dentists.find(d => d.id === dentistId)
      const dentistName = availability.dentist_name || availability.dentistName || dentist?.name || `Dentist ${dentistId}`
      
      // Normalize the response data
      const normalizedResponse = {
        id: availability.id,
        dentistId: dentistId,
        dentistName: dentistName,
        date: availability.date,
        timeSlots: availability.time_slots || availability.timeSlots || [],
        createdAt: availability.created_at,
        updatedAt: availability.updated_at
      }
      
      console.log('Normalized availability response:', normalizedResponse)
      
      setAvailabilityData(prev => [...prev, normalizedResponse])
      setError('')
    } catch (error) {
      console.error('Error adding availability:', error)
      setError(error.message || 'Failed to add availability')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateAvailability = async (id, availabilityPayload, fallback = {}) => {
    try {
      const response = await availabilityAPI.update(id, availabilityPayload)
      
      // Handle API response - could be nested in data property
      const availability = response?.data || response || {}
      
      // Normalize the response data
      const normalizedResponse = {
        id: availability.id ?? fallback.id ?? id,
        dentistId: availability.dentist_id || availability.dentistId || fallback.dentistId,
        dentistName: availability.dentist_name || availability.dentistName || fallback.dentistName,
        date: availability.date || fallback.date,
        timeSlots: availability.time_slots || availability.timeSlots || fallback.timeSlots || [],
        createdAt: availability.created_at || fallback.createdAt,
        updatedAt: availability.updated_at || fallback.updatedAt
      }
      
      setAvailabilityData(prev => prev.map(avail => avail.id === id ? normalizedResponse : avail))
      setEditingAvailability(null)
      setEditTimeSlots([])
      setError('')
    } catch (error) {
      console.error('Error updating availability:', error)
      setError(error.message || 'Failed to update availability')
    }
  }

  const handleDeleteAvailability = async (id) => {
    try {
      await availabilityAPI.delete(id)
      setAvailabilityData(prev => prev.filter(avail => avail.id !== id))
    } catch (error) {
      setError(error.message)
    }
  }

  const handleAddFormSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate required fields
    if (!formDentistId || !formDate || formTimeSlots.length === 0) {
      setError('Please select a dentist, date, and add at least one time slot')
      return
    }
    
    const availabilityData = {
      dentist_id: parseInt(formDentistId),
      date: formDate,
      time_slots: formTimeSlots
    }
    
    console.log('Submitting availability data:', availabilityData)
    await handleAddAvailability(availabilityData)
    resetAddForm()
  }

  const handleEditFormSubmit = async (e) => {
    e.preventDefault()

    if (!editingAvailability) return

    if (!editTimeSlots.length) {
      setError('Please provide at least one time slot before saving.')
      return
    }

    const sanitizedSlots = editTimeSlots
      .filter(slot => slot.start && slot.end)
      .map(slot => ({
        start: slot.start,
        end: slot.end,
        available: Boolean(slot.available)
      }))

    if (!sanitizedSlots.length) {
      setError('Each time slot must have a start and end time.')
      return
    }

    const availabilityPayload = {
      time_slots: sanitizedSlots
    }

    await handleUpdateAvailability(
      editingAvailability.id,
      availabilityPayload,
      {
        ...editingAvailability,
        timeSlots: sanitizedSlots
      }
    )
  }

  const filteredAvailability = availabilityData.filter(avail => {
    const matchesDentist = selectedDentist === 'all' || avail.dentistId.toString() === selectedDentist
    const matchesDate = !selectedDate || avail.date === selectedDate
    return matchesDentist && matchesDate
  })

  const getAvailableSlots = (timeSlots) => {
    return timeSlots.filter(slot => slot.available).length
  }

  const getTotalSlots = (timeSlots) => {
    return timeSlots.length
  }

  // Get day of week from date (0 = Sunday, 1 = Monday, etc.)
  const getDayOfWeek = (dateString) => {
    // Parse date string (YYYY-MM-DD format) as local date to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month is 0-indexed in Date constructor
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[date.getDay()]
  }

  // Generate time slots from working hours
  const generateTimeSlotsFromWorkingHours = (workingHours, dayOfWeek) => {
    const dayHours = workingHours?.[dayOfWeek]
    if (!dayHours || !dayHours.start || !dayHours.end || dayHours.start === '00:00') {
      return []
    }

    const slots = []
    const start = dayHours.start
    const end = dayHours.end
    
    // Convert time strings to minutes for easier calculation
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return hours * 60 + minutes
    }

    const minutesToTime = (minutes) => {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
    }

    const startMinutes = timeToMinutes(start)
    const endMinutes = timeToMinutes(end)
    const slotDuration = 60 // 1 hour slots

    // Generate hourly slots
    for (let time = startMinutes; time + slotDuration <= endMinutes; time += slotDuration) {
      slots.push({
        start: minutesToTime(time),
        end: minutesToTime(time + slotDuration),
        available: true
      })
    }

    return slots
  }

  // Fetch dentist details
  const fetchDentistDetails = async (dentistId) => {
    if (!dentistId) {
      setSelectedDentistDetails(null)
      setFormTimeSlots([])
      return
    }

    try {
      setLoadingDentistDetails(true)
      const response = await dentistsAPI.getById(dentistId)
      const dentist = response?.data || response
      setSelectedDentistDetails(dentist)
      
      // If date is selected, generate slots from working hours
      if (formDate) {
        const dayOfWeek = getDayOfWeek(formDate)
        const slots = generateTimeSlotsFromWorkingHours(dentist.working_hours, dayOfWeek)
        setFormTimeSlots(slots)
      } else {
        // Clear slots if no date is selected
        setFormTimeSlots([])
      }
    } catch (error) {
      console.error('Error fetching dentist details:', error)
      setError('Failed to load dentist details')
    } finally {
      setLoadingDentistDetails(false)
    }
  }

  // Handle dentist change in form
  const handleFormDentistChange = (dentistId) => {
    setFormDentistId(dentistId)
    fetchDentistDetails(dentistId)
  }

  // Handle date change in form
  const handleFormDateChange = (date) => {
    setFormDate(date)
    
    // If dentist is selected, regenerate slots based on the day of week
    if (selectedDentistDetails && date) {
      const dayOfWeek = getDayOfWeek(date)
      const slots = generateTimeSlotsFromWorkingHours(selectedDentistDetails.working_hours, dayOfWeek)
      setFormTimeSlots(slots)
    }
  }

  // Add new time slot
  const handleAddTimeSlot = () => {
    setFormTimeSlots(prev => [...prev, { start: '09:00', end: '10:00', available: true }])
  }

  // Update time slot
  const handleUpdateTimeSlot = (index, field, value) => {
    setFormTimeSlots(prev => prev.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    ))
  }

  // Remove time slot
  const handleRemoveTimeSlot = (index) => {
    setFormTimeSlots(prev => prev.filter((_, i) => i !== index))
  }

  // Edit modal time slot helpers
  const handleAddEditTimeSlot = () => {
    setEditTimeSlots(prev => [
      ...prev,
      { start: '09:00', end: '10:00', available: true }
    ])
  }

  const handleUpdateEditTimeSlot = (index, field, value) => {
    setEditTimeSlots(prev =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot))
    )
  }

  const handleRemoveEditTimeSlot = (index) => {
    setEditTimeSlots(prev => prev.filter((_, i) => i !== index))
  }

  // Reset form
  const resetAddForm = () => {
    setFormDentistId('')
    setFormDate('')
    setFormTimeSlots([])
    setSelectedDentistDetails(null)
    setShowAddForm(false)
  }

  // Using timezone utility for consistent clinic timezone display

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading availability...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
          <p className="text-gray-600">Manage dentist availability and time slots</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true)
            setFormDentistId('')
            setFormDate('')
            setFormTimeSlots([])
            setSelectedDentistDetails(null)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Availability
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700 text-sm">{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dentist</label>
            <select
              value={selectedDentist}
              onChange={(e) => setSelectedDentist(e.target.value)}
              className="input-field"
            >
              <option value="all">All Dentists</option>
              {dentists.map(dentist => (
                <option key={dentist.id} value={dentist.id}>{dentist.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedDentist('all')
                setSelectedDate('')
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Availability List */}
      <div className="space-y-4">
        {filteredAvailability.map((availability) => (
          <div key={availability.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{availability.dentistName}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDateInClinicTimezone(availability.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {getAvailableSlots(availability.timeSlots)}/{getTotalSlots(availability.timeSlots)} slots available
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingAvailability(availability)
                    setEditTimeSlots(availability.timeSlots.map(slot => ({
                      start: slot.start,
                      end: slot.end,
                      available: slot.available
                    })))
                  }}
                  className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button className="text-red-600 hover:text-red-900 flex items-center gap-1">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>

            {/* Time Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {availability.timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg text-center text-sm font-medium ${
                    slot.available
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  <div>{slot.start} - {slot.end}</div>
                  <div className="text-xs">
                    {slot.available ? 'Available' : 'Booked'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Availability Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Availability</h3>
            <form className="space-y-4" onSubmit={handleAddFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dentist</label>
                  <select 
                    value={formDentistId}
                    onChange={(e) => handleFormDentistChange(e.target.value)}
                    className="input-field" 
                    required
                  >
                    <option value="">Select a dentist</option>
                    {dentists.map(dentist => (
                      <option key={dentist.id} value={dentist.id}>{dentist.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={formDate}
                    onChange={(e) => handleFormDateChange(e.target.value)}
                    className="input-field" 
                    required 
                  />
                </div>
              </div>

              {loadingDentistDetails && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader className="h-4 w-4 animate-spin" />
                  Loading dentist working hours...
                </div>
              )}

              {formDate && selectedDentistDetails && !loadingDentistDetails && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    Working hours for {getDayOfWeek(formDate)}: {(() => {
                      const dayHours = selectedDentistDetails.working_hours?.[getDayOfWeek(formDate)]
                      if (!dayHours || !dayHours.start || dayHours.start === '00:00') {
                        return 'No working hours on this day'
                      }
                      return `${dayHours.start} - ${dayHours.end}`
                    })()}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Time Slots</label>
                <div className="space-y-3">
                  {/* Add new time slot button */}
                  <button
                    type="button"
                    onClick={handleAddTimeSlot}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Time Slot
                  </button>
                  
                  {/* Dynamic time slots list */}
                  <div className="space-y-2">
                    {formTimeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => handleUpdateTimeSlot(index, 'start', e.target.value)}
                            className="input-field"
                            required
                          />
                          <span className="text-gray-400">to</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => handleUpdateTimeSlot(index, 'end', e.target.value)}
                            className="input-field"
                            required
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={slot.available}
                              onChange={(e) => handleUpdateTimeSlot(index, 'available', e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-gray-700">Available</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveTimeSlot(index)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {formTimeSlots.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {formDate && formDentistId 
                        ? 'No working hours for this day. Click "Add Time Slot" to create custom slots.'
                        : 'Select a dentist and date to see available time slots, or add custom slots.'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetAddForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Availability'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Availability Modal */}
      {editingAvailability && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Availability - {editingAvailability.dentistName}
            </h3>
            <form className="space-y-4" onSubmit={handleEditFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dentist</label>
                  <input
                    type="text"
                    value={editingAvailability.dentistName}
                    disabled
                    className="input-field bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    defaultValue={editingAvailability.date}
                    className="input-field" 
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Time Slots</label>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleAddEditTimeSlot}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Time Slot
                  </button>

                  <div className="space-y-2">
                    {editTimeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => handleUpdateEditTimeSlot(index, 'start', e.target.value)}
                            className="input-field"
                            required
                          />
                          <span className="text-gray-400">to</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => handleUpdateEditTimeSlot(index, 'end', e.target.value)}
                            className="input-field"
                            required
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={slot.available}
                              onChange={(e) => handleUpdateEditTimeSlot(index, 'available', e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-gray-700">Available</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveEditTimeSlot(index)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {editTimeSlots.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No time slots defined. Click &ldquo;Add Time Slot&rdquo; to create availability.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAvailability(null)
                    setEditTimeSlots([])
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
