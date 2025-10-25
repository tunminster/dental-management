import { useState } from 'react'
import { Plus, Search, Filter, Calendar, Clock, User, Phone } from 'lucide-react'

const dentists = [
  { id: 1, name: 'Dr. Sarah Johnson', specialization: 'General Dentistry' },
  { id: 2, name: 'Dr. Michael Chen', specialization: 'Orthodontics' },
  { id: 3, name: 'Dr. Emily Rodriguez', specialization: 'Oral Surgery' },
  { id: 4, name: 'Dr. James Wilson', specialization: 'Pediatric Dentistry' }
]

const appointments = [
  {
    id: 1,
    patient: 'John Smith',
    phone: '(555) 123-4567',
    dentistId: 1,
    dentistName: 'Dr. Sarah Johnson',
    date: '2025-10-25',
    time: '09:00',
    treatment: 'Regular Cleaning',
    status: 'confirmed',
    notes: 'Regular checkup and cleaning'
  },
  {
    id: 2,
    patient: 'Sarah Johnson',
    phone: '(555) 234-5678',
    dentistId: 2,
    dentistName: 'Dr. Michael Chen',
    date: '2024-01-15',
    time: '10:30',
    treatment: 'Dental Checkup',
    status: 'confirmed',
    notes: 'Annual checkup'
  },
  {
    id: 3,
    patient: 'Mike Davis',
    phone: '(555) 345-6789',
    dentistId: 1,
    dentistName: 'Dr. Sarah Johnson',
    date: '2024-01-15',
    time: '14:00',
    treatment: 'Cavity Filling',
    status: 'pending',
    notes: 'Tooth #14 needs filling'
  },
  {
    id: 4,
    patient: 'Emily Wilson',
    phone: '(555) 456-7890',
    dentistId: 3,
    dentistName: 'Dr. Emily Rodriguez',
    date: '2024-01-16',
    time: '09:30',
    treatment: 'Tooth Extraction',
    status: 'confirmed',
    notes: 'Wisdom tooth removal'
  },
  {
    id: 5,
    patient: 'Robert Brown',
    phone: '(555) 567-8901',
    dentistId: 3,
    dentistName: 'Dr. Emily Rodriguez',
    date: '2024-01-16',
    time: '11:00',
    treatment: 'Root Canal',
    status: 'pending',
    notes: 'Emergency root canal treatment'
  }
]

const statusColors = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
}

export default function Appointments() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dentistFilter, setDentistFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.dentistName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    const matchesDentist = dentistFilter === 'all' || appointment.dentistId.toString() === dentistFilter
    return matchesSearch && matchesStatus && matchesDentist
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage patient appointments and schedules</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search appointments..."
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
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={dentistFilter}
              onChange={(e) => setDentistFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Dentists</option>
              {dentists.map(dentist => (
                <option key={dentist.id} value={dentist.id}>{dentist.name}</option>
              ))}
            </select>
            <button className="btn-secondary flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dentist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Treatment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{appointment.patient}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {appointment.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{appointment.dentistName}</div>
                    <div className="text-sm text-gray-500">{appointment.dentistId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(appointment.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {appointment.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{appointment.treatment}</div>
                    <div className="text-sm text-gray-500">{appointment.notes}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="text-primary-600 hover:text-primary-900">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Appointment</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input type="text" className="input-field" placeholder="Enter patient name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" className="input-field" placeholder="Enter phone number" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dentist</label>
                <select className="input-field">
                  {dentists.map(dentist => (
                    <option key={dentist.id} value={dentist.id}>{dentist.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
                <select className="input-field">
                  <option>Regular Cleaning</option>
                  <option>Dental Checkup</option>
                  <option>Cavity Filling</option>
                  <option>Tooth Extraction</option>
                  <option>Root Canal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea className="input-field" rows="3" placeholder="Additional notes"></textarea>
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
                  Add Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
