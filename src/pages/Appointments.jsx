import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Calendar, Clock, User, Phone, AlertCircle, Loader } from 'lucide-react'
import { appointmentsAPI, dentistsAPI, availabilityAPI } from '../services/api'
import { formatDateInClinicTimezone } from '../utils/timezone'

const statusColors = {
  confirmed: 'bg-green-100 text-green-800',
  rescheduled: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  arrived: 'bg-indigo-100 text-indigo-800',
  no_show: 'bg-orange-100 text-orange-800'
}

const statusOptions = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'arrived', label: 'Arrived' },
  { value: 'completed', label: 'Completed' },
  { value: 'no_show', label: 'No-show' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rescheduled', label: 'Rescheduled' }
]

const getStatusLabel = (status) => {
  return statusOptions.find(option => option.value === status)?.label || status
}

const normalizeAppointment = (appointment, fallback = {}) => {
  if (!appointment && fallback) {
    return fallback
  }

  const source = appointment?.appointment || appointment || {}
  const fallbackSource = fallback?.appointment || fallback || {}

  const normalizeValue = (primary, secondary, defaultValue) => {
    if (primary !== undefined && primary !== null) return primary
    if (secondary !== undefined && secondary !== null) return secondary
    return defaultValue
  }

  return {
    id: normalizeValue(source.id, fallbackSource.id, undefined),
    patient: normalizeValue(source.patient, fallbackSource.patient ?? fallbackSource.patientName, ''),
    phone: normalizeValue(source.phone, fallbackSource.phone ?? fallbackSource.patientPhone, ''),
    dentistId: normalizeValue(
      source.dentist_id,
      fallbackSource.dentist_id ?? fallbackSource.dentistId,
      null
    ),
    dentistName: normalizeValue(
      source.dentist_name,
      fallbackSource.dentist_name ?? fallbackSource.dentistName,
      ''
    ),
    date: normalizeValue(
      source.appointment_date,
      fallbackSource.appointment_date ?? fallbackSource.date,
      ''
    ),
    time: normalizeValue(
      source.appointment_time,
      fallbackSource.appointment_time ?? fallbackSource.time,
      ''
    ),
    treatment: normalizeValue(source.treatment, fallbackSource.treatment, ''),
    status: normalizeValue(source.status, fallbackSource.status, ''),
    notes: normalizeValue(source.notes, fallbackSource.notes, ''),
    createdAt: normalizeValue(
      source.created_at,
      fallbackSource.created_at ?? fallbackSource.createdAt,
      null
    ),
    updatedAt: normalizeValue(
      source.updated_at,
      fallbackSource.updated_at ?? fallbackSource.updatedAt,
      null
    )
  }
}

const safeMatch = (value, comparator) => {
  return (value ?? '').toString().toLowerCase().includes(comparator)
}

const DEFAULT_PAGE_SIZE = 10

const getStatusRank = (status) => {
  if (!status) return 0
  return status === 'completed' ? 1 : 0
}

const getDateValue = (date, time) => {
  if (!date) return Number.MAX_SAFE_INTEGER
  const combined = time ? `${date}T${time}` : `${date}T00:00`
  const parsed = Date.parse(combined)
  if (Number.isNaN(parsed)) {
    const fallbackParsed = Date.parse(date)
    return Number.isNaN(fallbackParsed) ? Number.MAX_SAFE_INTEGER : fallbackParsed
  }
  return parsed
}

const extractAppointmentsPayload = (payload) => {
  if (!payload) {
    return {
      data: [],
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      total: 0,
      totalPages: 1
    }
  }

  if (Array.isArray(payload)) {
    return {
      data: payload,
      page: 1,
      pageSize: payload.length || DEFAULT_PAGE_SIZE,
      total: payload.length,
      totalPages: 1
    }
  }

  const meta = payload.meta || payload.pagination || {}

  const dataArray = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.results)
    ? payload.results
    : Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.records)
    ? payload.records
    : Array.isArray(payload.appointments)
    ? payload.appointments
    : []

  const page = payload.page ?? payload.current_page ?? meta.page ?? meta.current_page ?? 1
  const pageSize =
    payload.page_size ??
    payload.pageSize ??
    payload.per_page ??
    meta.page_size ??
    meta.pageSize ??
    meta.per_page ??
    (dataArray.length || DEFAULT_PAGE_SIZE)
  const total =
    payload.total ??
    payload.total_items ??
    payload.total_count ??
    payload.count ??
    meta.total ??
    meta.total_items ??
    meta.total_count ??
    dataArray.length
  const totalPages =
    payload.total_pages ??
    payload.totalPages ??
    meta.total_pages ??
    meta.totalPages ??
    (pageSize ? Math.ceil(total / pageSize) : 1)

  return {
    data: dataArray,
    page,
    pageSize,
    total,
    totalPages
  }
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [dentists, setDentists] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dentistFilter, setDentistFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedDentistId, setSelectedDentistId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    setCurrentPage(prev => (prev === 1 ? prev : 1))
  }, [searchTerm, statusFilter, dentistFilter])

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [dentistsResponse, availabilityResponse] = await Promise.all([
          dentistsAPI.getAll(),
          availabilityAPI.getAll()
        ])

        const dentistsData = Array.isArray(dentistsResponse?.data) ? dentistsResponse.data :
                            Array.isArray(dentistsResponse) ? dentistsResponse : []

        const normalizedDentists = dentistsData.map(dentist => ({
          id: dentist.id,
          name: dentist.name,
          specialization: dentist.specialty
        }))
        setDentists(normalizedDentists)

        const availabilityData = Array.isArray(availabilityResponse?.data) ? availabilityResponse.data :
                                Array.isArray(availabilityResponse) ? availabilityResponse : []

        const normalizedAvailability = availabilityData.map(avail => ({
          id: avail.id,
          dentistId: avail.dentist_id,
          dentistName: avail.dentist_name,
          date: avail.date,
          timeSlots: avail.time_slots || []
        }))

        setAvailability(normalizedAvailability)
      } catch (error) {
        setError(prev => prev || error.message)
      }
    }

    fetchReferenceData()
  }, [])

  useEffect(() => {
    let abort = false

    const fetchAppointments = async () => {
      try {
        setLoading(true)
        const searchQuery = searchTerm.trim()
        const params = {
          page: currentPage,
          page_size: pageSize
        }

        if (statusFilter !== 'all') {
          params.status = statusFilter
        }

        if (dentistFilter !== 'all') {
          params.dentist_id = Number(dentistFilter)
        }

        if (searchQuery) {
          params.patient = searchQuery
          params.treatment = searchQuery
        }

        const appointmentsResponse = await appointmentsAPI.getAll(params)
        if (abort) return

        const {
          data: appointmentsData,
          page,
          pageSize: serverPageSize,
          total,
          totalPages: serverTotalPages
        } = extractAppointmentsPayload(appointmentsResponse)

        const normalizedAppointments = appointmentsData.map(appointment => normalizeAppointment(appointment))
        setAppointments(normalizedAppointments)
        setTotalItems(total ?? normalizedAppointments.length)

        const safeTotalPages = Math.max(1, serverTotalPages || 1)
        setTotalPages(safeTotalPages)

        if (serverPageSize && serverPageSize !== pageSize) {
          setPageSize(serverPageSize)
        }

        if (page && page !== currentPage) {
          setCurrentPage(page)
        } else if (currentPage > safeTotalPages) {
          setCurrentPage(safeTotalPages)
        }

        setError('')
      } catch (error) {
        if (!abort) {
          setError(error.message)
          setAppointments([])
          setTotalItems(0)
          setTotalPages(1)
        }
      } finally {
        if (!abort) {
          setLoading(false)
        }
      }
    }

    fetchAppointments()

    return () => {
      abort = true
    }
  }, [currentPage, dentistFilter, pageSize, reloadToken, searchTerm, statusFilter])

  const handleAddAppointment = async (appointmentData) => {
    try {
      setSubmitting(true)
      const response = await appointmentsAPI.create(appointmentData)
      
      const selectedDentist = dentists.find(dentist => dentist.id === appointmentData.dentist_id)
      const fallbackAppointment = {
        patient: appointmentData.patient,
        phone: appointmentData.phone,
        dentist_id: appointmentData.dentist_id,
        dentist_name: selectedDentist?.name || '',
        appointment_date: appointmentData.appointment_date,
        appointment_time: appointmentData.appointment_time,
        treatment: appointmentData.treatment,
        status: appointmentData.status,
        notes: appointmentData.notes
      }

      // Normalize the response data
      const normalizedResponse = normalizeAppointment(response, fallbackAppointment)
      
      setAppointments(prev => [...prev, normalizedResponse])
      setShowAddForm(false)
      setError('')
      setReloadToken(prev => prev + 1)
    } catch (error) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateAppointment = async (id, appointmentData) => {
    try {
      const response = await appointmentsAPI.update(id, appointmentData)
      
      setAppointments(prev => prev.map(apt => {
        if (apt.id !== id) return apt
        const fallbackAppointment = {
          ...apt,
          appointment_date: appointmentData.appointment_date ?? appointmentData.date ?? apt.date,
          appointment_time: appointmentData.appointment_time ?? appointmentData.time ?? apt.time,
          treatment: appointmentData.treatment ?? apt.treatment,
          status: appointmentData.status ?? apt.status,
          notes: appointmentData.notes ?? apt.notes
        }
        return normalizeAppointment(response, fallbackAppointment)
      }))
      setReloadToken(prev => prev + 1)
    } catch (error) {
      setError(error.message)
    }
  }

  const handleDeleteAppointment = async (id) => {
    try {
      await appointmentsAPI.delete(id)
      setAppointments(prev => prev.filter(apt => apt.id !== id))
      setReloadToken(prev => prev + 1)
    } catch (error) {
      setError(error.message)
    }
  }

  const handleDentistChange = (dentistId) => {
    setSelectedDentistId(dentistId)
    setSelectedDate('')
    setAvailableTimeSlots([])
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    if (selectedDentistId && date) {
      loadAvailableTimeSlots(selectedDentistId, date)
    }
  }

  const loadAvailableTimeSlots = (dentistId, date) => {
    const dentistAvailability = availability.find(avail => 
      avail.dentistId === parseInt(dentistId) && avail.date === date
    )
    
    if (dentistAvailability) {
      const availableSlots = dentistAvailability.timeSlots.filter(slot => slot.available === true)
      setAvailableTimeSlots(availableSlots)
    } else {
      setAvailableTimeSlots([])
    }
  }

  const resetForm = () => {
    setSelectedDentistId('')
    setSelectedDate('')
    setAvailableTimeSlots([])
  }

  const handleStatusUpdate = async (id, status) => {
    if (!status) return
    setStatusUpdatingId(id)
    try {
      const response = await appointmentsAPI.updateStatus(id, status)
      setAppointments(prev => prev.map(apt => {
        if (apt.id !== id) return apt
        const normalizedResponse = response ? normalizeAppointment(response, { ...apt, status }) : null
        if (!normalizedResponse) {
          return { ...apt, status }
        }
        return normalizedResponse
      }))
      setError('')
      setReloadToken(prev => prev + 1)
    } catch (error) {
      setError(error.message)
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = normalizedSearchTerm.length === 0 ||
      safeMatch(appointment.patient, normalizedSearchTerm) ||
      safeMatch(appointment.treatment, normalizedSearchTerm) ||
      safeMatch(appointment.notes, normalizedSearchTerm)
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    const matchesDentist = dentistFilter === 'all' || (appointment.dentistId != null && appointment.dentistId.toString() === dentistFilter)
    return matchesSearch && matchesStatus && matchesDentist
  })

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const rankA = getStatusRank(a.status)
    const rankB = getStatusRank(b.status)
    if (rankA !== rankB) {
      return rankA - rankB
    }

    const dateA = getDateValue(a.date, a.time)
    const dateB = getDateValue(b.date, b.time)
    if (dateA !== dateB) {
      return dateA - dateB
    }

    return (a.patient || '').localeCompare(b.patient || '')
  })

  const visibleAppointments = sortedAppointments
  const safeTotalPages = Math.max(1, totalPages)
  const startItemIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItemIndex = totalItems === 0 ? 0 : Math.min(startItemIndex + visibleAppointments.length - 1, totalItems)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    )
  }

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
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
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
              {visibleAppointments.map((appointment) => (
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
                      {formatDateInClinicTimezone(appointment.date)}
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[appointment.status] || 'bg-gray-100 text-gray-800'}`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={appointment.status}
                        onChange={(e) => {
                          const nextStatus = e.target.value
                          if (nextStatus !== appointment.status) {
                            handleStatusUpdate(appointment.id, nextStatus)
                          }
                        }}
                        className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled={statusUpdatingId === appointment.id}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="text-gray-600 hover:text-gray-900"
                        disabled={statusUpdatingId === appointment.id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
          <p className="text-sm text-gray-600">
            Showing {totalItems === 0 ? '0' : `${startItemIndex}-${endItemIndex}`} of {totalItems} appointments
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="btn-secondary px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Page</span>
              <span className="text-sm font-medium text-gray-900">
                {currentPage} / {safeTotalPages}
              </span>
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(safeTotalPages, prev + 1))}
              disabled={currentPage >= safeTotalPages || totalItems === 0}
              className="btn-secondary px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Appointment</h3>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const appointmentData = {
                patient: formData.get('patientName'), // API expects 'patient'
                phone: formData.get('patientPhone'), // API expects 'phone'
                dentist_id: parseInt(formData.get('dentistId')), // API expects 'dentist_id'
                appointment_date: formData.get('date'), // API expects 'appointment_date'
                appointment_time: formData.get('time'), // API expects 'appointment_time'
                treatment: formData.get('treatment'),
                status: 'confirmed', // API expects 'confirmed' as default
                notes: formData.get('notes')
              }
              handleAddAppointment(appointmentData)
              resetForm()
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input type="text" name="patientName" required className="input-field" placeholder="Enter patient name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" name="patientPhone" required className="input-field" placeholder="Enter phone number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dentist</label>
                <select 
                  name="dentistId" 
                  required 
                  className="input-field"
                  value={selectedDentistId}
                  onChange={(e) => handleDentistChange(e.target.value)}
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
                  name="date" 
                  required 
                  className="input-field"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Time Slots</label>
                {availableTimeSlots.length > 0 ? (
                  <select name="time" required className="input-field">
                    <option value="">Select available time</option>
                    {availableTimeSlots.map((slot, index) => (
                      <option key={index} value={slot.start}>
                        {slot.start} - {slot.end}
                      </option>
                    ))}
                  </select>
                ) : selectedDentistId && selectedDate ? (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    No available time slots for this dentist on the selected date
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                    Please select a dentist and date to see available time slots
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
                <select name="treatment" required className="input-field">
                  <option value="">Select treatment</option>
                  <option value="Regular Cleaning">Regular Cleaning</option>
                  <option value="Dental Checkup">Dental Checkup</option>
                  <option value="Cavity Filling">Cavity Filling</option>
                  <option value="Tooth Extraction">Tooth Extraction</option>
                  <option value="Root Canal">Root Canal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea name="notes" className="input-field" rows="3" placeholder="Additional notes"></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    resetForm()
                  }}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Add Appointment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
