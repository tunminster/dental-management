import { useState, useEffect } from 'react'
import { Plus, Search, Filter, User, Phone, Mail, Calendar, Edit, Trash2, Clock, Award, Loader, AlertCircle } from 'lucide-react'
import { dentistsAPI } from '../services/api'

const dentists = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@dentalcare.com',
    phone: '(555) 123-4567',
    specialization: 'General Dentistry',
    licenseNumber: 'DENT123456',
    experience: '8 years',
    status: 'active',
    workingHours: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: { start: '09:00', end: '13:00' },
      sunday: { start: '00:00', end: '00:00' }
    }
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    email: 'michael.chen@dentalcare.com',
    phone: '(555) 234-5678',
    specialization: 'Orthodontics',
    licenseNumber: 'DENT234567',
    experience: '12 years',
    status: 'active',
    workingHours: {
      monday: { start: '08:00', end: '16:00' },
      tuesday: { start: '08:00', end: '16:00' },
      wednesday: { start: '08:00', end: '16:00' },
      thursday: { start: '08:00', end: '16:00' },
      friday: { start: '08:00', end: '16:00' },
      saturday: { start: '00:00', end: '00:00' },
      sunday: { start: '00:00', end: '00:00' }
    }
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@dentalcare.com',
    phone: '(555) 345-6789',
    specialization: 'Oral Surgery',
    licenseNumber: 'DENT345678',
    experience: '15 years',
    status: 'active',
    workingHours: {
      monday: { start: '10:00', end: '18:00' },
      tuesday: { start: '10:00', end: '18:00' },
      wednesday: { start: '10:00', end: '18:00' },
      thursday: { start: '10:00', end: '18:00' },
      friday: { start: '10:00', end: '18:00' },
      saturday: { start: '09:00', end: '15:00' },
      sunday: { start: '00:00', end: '00:00' }
    }
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    email: 'james.wilson@dentalcare.com',
    phone: '(555) 456-7890',
    specialization: 'Pediatric Dentistry',
    licenseNumber: 'DENT456789',
    experience: '6 years',
    status: 'inactive',
    workingHours: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: { start: '00:00', end: '00:00' },
      sunday: { start: '00:00', end: '00:00' }
    }
  }
]

const specializations = [
  'General Dentistry',
  'Orthodontics',
  'Oral Surgery',
  'Pediatric Dentistry',
  'Periodontics',
  'Endodontics',
  'Prosthodontics',
  'Oral Pathology'
]

export default function Dentists() {
  const [dentists, setDentists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [specializationFilter, setSpecializationFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDentist, setSelectedDentist] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadDentists()
  }, [])

  const loadDentists = async () => {
    try {
      setLoading(true)
      const response = await dentistsAPI.getAll()
      setDentists(response.data || response)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDentist = async (dentistData) => {
    try {
      setSubmitting(true)
      const response = await dentistsAPI.create(dentistData)
      setDentists(prev => [...prev, response])
      setShowAddForm(false)
      setError('')
    } catch (error) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateDentist = async (id, dentistData) => {
    try {
      const response = await dentistsAPI.update(id, dentistData)
      setDentists(prev => prev.map(dentist => dentist.id === id ? response : dentist))
      setSelectedDentist(null)
    } catch (error) {
      setError(error.message)
    }
  }

  const handleDeleteDentist = async (id) => {
    try {
      await dentistsAPI.delete(id)
      setDentists(prev => prev.filter(dentist => dentist.id !== id))
    } catch (error) {
      setError(error.message)
    }
  }

  const filteredDentists = dentists.filter(dentist => {
    const matchesSearch = dentist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dentist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dentist.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || dentist.status === statusFilter
    const matchesSpecialization = specializationFilter === 'all' || dentist.specialization === specializationFilter
    return matchesSearch && matchesStatus && matchesSpecialization
  })

  const getWorkingDays = (workingHours) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    return days.filter(day => workingHours[day].start !== '00:00').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dentists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dentists</h1>
          <p className="text-gray-600">Manage dentist profiles and specializations</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Dentist
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
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search dentists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
            <button className="btn-secondary flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Dentists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDentists.map((dentist) => (
          <div key={dentist.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">{dentist.name}</h3>
                  <p className="text-sm text-gray-500">{dentist.specialization}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                dentist.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {dentist.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {dentist.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {dentist.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Award className="h-4 w-4 mr-2" />
                License: {dentist.licenseNumber}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {dentist.experience} experience
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {getWorkingDays(dentist.workingHours)} days/week
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedDentist(dentist)}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button className="flex-1 text-red-600 hover:text-red-900 flex items-center justify-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Dentist Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Dentist</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" className="input-field" placeholder="Dr. John Smith" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="input-field" placeholder="john.smith@dentalcare.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" className="input-field" placeholder="(555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input type="text" className="input-field" placeholder="DENT123456" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <select className="input-field">
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <input type="text" className="input-field" placeholder="5 years" />
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Working Hours</h4>
                <div className="space-y-3">
                  {Object.keys(dentists[0].workingHours).map(day => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium text-gray-700 capitalize">
                        {day}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          className="input-field w-32"
                          placeholder="Start time"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="time"
                          className="input-field w-32"
                          placeholder="End time"
                        />
                      </div>
                    </div>
                  ))}
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
                  Add Dentist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dentist Modal */}
      {selectedDentist && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Dentist</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" defaultValue={selectedDentist.name} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" defaultValue={selectedDentist.email} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" defaultValue={selectedDentist.phone} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input type="text" defaultValue={selectedDentist.licenseNumber} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <select className="input-field" defaultValue={selectedDentist.specialization}>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <input type="text" defaultValue={selectedDentist.experience} className="input-field" />
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Working Hours</h4>
                <div className="space-y-3">
                  {Object.entries(selectedDentist.workingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium text-gray-700 capitalize">
                        {day}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          defaultValue={hours.start}
                          className="input-field w-32"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="time"
                          defaultValue={hours.end}
                          className="input-field w-32"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDentist(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
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
