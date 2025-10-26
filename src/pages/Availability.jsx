import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Plus, Edit, Trash2, Save, X, Loader, AlertCircle } from 'lucide-react'
import { availabilityAPI, dentistsAPI } from '../services/api'

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
  const [submitting, setSubmitting] = useState(false)

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
      
      setAvailabilityData(availabilityResponse.data || availabilityResponse)
      setDentists(dentistsResponse.data || dentistsResponse)
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
      setAvailabilityData(prev => [...prev, response])
      setShowAddForm(false)
      setError('')
    } catch (error) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateAvailability = async (id, availabilityData) => {
    try {
      const response = await availabilityAPI.update(id, availabilityData)
      setAvailabilityData(prev => prev.map(avail => avail.id === id ? response : avail))
      setEditingAvailability(null)
    } catch (error) {
      setError(error.message)
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
          onClick={() => setShowAddForm(true)}
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
                      {new Date(availability.date).toLocaleDateString()}
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
                  onClick={() => setEditingAvailability(availability)}
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
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dentist</label>
                  <select className="input-field">
                    {dentists.map(dentist => (
                      <option key={dentist.id} value={dentist.id}>{dentist.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Time Slots</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input type="time" className="input-field" placeholder="Start time" />
                    </div>
                    <span className="text-gray-400">to</span>
                    <div className="flex-1">
                      <input type="time" className="input-field" placeholder="End time" />
                    </div>
                    <button type="button" className="btn-secondary">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Sample time slots */}
                  <div className="grid grid-cols-2 gap-2">
                    {['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'].map((slot, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm">{slot}</span>
                        <button type="button" className="text-red-600 hover:text-red-900">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Availability
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
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    defaultValue={editingAvailability.date}
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="input-field">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Time Slots</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {editingAvailability.timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          defaultChecked={slot.available}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">{slot.start} - {slot.end}</span>
                      </div>
                      <button type="button" className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAvailability(null)}
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
