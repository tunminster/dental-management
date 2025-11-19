import { useState, useEffect } from 'react'
import { Save, User, Bell, Shield, Database, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { settingsAPI } from '../services/api'

// Day order for sorting
const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const defaultSettings = {
  practiceName: '',
  address: '',
  phone: '',
  email: '',
  workingHours: {
    monday: { start: '09:00', end: '17:00', closed: false },
    tuesday: { start: '09:00', end: '17:00', closed: false },
    wednesday: { start: '09:00', end: '17:00', closed: false },
    thursday: { start: '09:00', end: '17:00', closed: false },
    friday: { start: '09:00', end: '17:00', closed: false },
    saturday: { start: '09:00', end: '13:00', closed: false },
    sunday: { start: '09:00', end: '17:00', closed: true }
  },
  notifications: {
    emailReminders: true,
    smsReminders: true,
    appointmentConfirmations: true,
    newPatientAlerts: true
  }
}

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [settingsId, setSettingsId] = useState(null)
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', name: 'General', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'backup', name: 'Backup', icon: Database }
  ]

  // Normalize API response (snake_case to camelCase)
  const normalizeSettings = (apiSettings) => {
    if (!apiSettings) return defaultSettings

    // Normalize working_hours
    let workingHours = {}
    if (apiSettings.working_hours && Object.keys(apiSettings.working_hours).length > 0) {
      Object.entries(apiSettings.working_hours).forEach(([day, hours]) => {
        workingHours[day.toLowerCase()] = {
          start: hours.start || '09:00',
          end: hours.end || '17:00',
          closed: hours.closed !== undefined ? hours.closed : false
        }
      })
    } else {
      workingHours = { ...defaultSettings.workingHours }
    }

    return {
      practiceName: apiSettings.practice_name || '',
      address: apiSettings.address || '',
      phone: apiSettings.phone || '',
      email: apiSettings.email || '',
      workingHours: workingHours,
      notifications: apiSettings.notifications || defaultSettings.notifications
    }
  }

  // Convert to API format (camelCase to snake_case)
  const toApiFormat = (settingsData) => {
    const workingHours = {}
    Object.entries(settingsData.workingHours).forEach(([day, hours]) => {
      workingHours[day.toLowerCase()] = {
        start: hours.start || '09:00',
        end: hours.end || '17:00',
        closed: hours.closed !== undefined ? hours.closed : false
      }
    })

    return {
      practice_name: settingsData.practiceName,
      address: settingsData.address,
      phone: settingsData.phone,
      email: settingsData.email,
      working_hours: workingHours,
      notifications: settingsData.notifications
    }
  }

  // Sort working days
  const getSortedWorkingDays = (workingHours) => {
    return dayOrder.filter(day => workingHours.hasOwnProperty(day))
      .map(day => [day, workingHours[day]])
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await settingsAPI.get()
      console.log('Settings loaded:', response)
      
      if (response) {
        setSettingsId(response.id)
        setSettings(normalizeSettings(response))
      } else {
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      // If settings don't exist (404), use defaults
      if (error.response?.status === 404) {
        setSettings(defaultSettings)
      } else {
        setError(error.message || 'Failed to load settings')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      
      const apiPayload = toApiFormat(settings)
      console.log('Saving settings:', apiPayload)

      let response
      if (settingsId) {
        // Update existing settings
        response = await settingsAPI.update(apiPayload)
      } else {
        // Create new settings
        response = await settingsAPI.create(apiPayload)
      }

      if (response) {
        setSettingsId(response.id)
        setSettings(normalizeSettings(response))
        setSuccess('Settings saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setError(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your practice settings and preferences</p>
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

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-700 text-sm">{success}</span>
          <button
            onClick={() => setSuccess('')}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="card">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="card">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Practice Name</label>
                    <input
                      type="text"
                      value={settings.practiceName}
                      onChange={(e) => setSettings({...settings, practiceName: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => setSettings({...settings, phone: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => setSettings({...settings, address: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({...settings, email: e.target.value})}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Working Hours</h4>
                  <div className="space-y-3">
                    {getSortedWorkingDays(settings.workingHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                          {day}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!hours.closed}
                            onChange={(e) => setSettings({
                              ...settings,
                              workingHours: {
                                ...settings.workingHours,
                                [day]: { ...hours, closed: !e.target.checked }
                              }
                            })}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-600">Open</span>
                        </div>
                        {!hours.closed && (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={hours.start}
                              onChange={(e) => setSettings({
                                ...settings,
                                workingHours: {
                                  ...settings.workingHours,
                                  [day]: { ...hours, start: e.target.value }
                                }
                              })}
                              className="input-field w-32"
                            />
                            <span className="text-gray-400">to</span>
                            <input
                              type="time"
                              value={hours.end}
                              onChange={(e) => setSettings({
                                ...settings,
                                workingHours: {
                                  ...settings.workingHours,
                                  [day]: { ...hours, end: e.target.value }
                                }
                              })}
                              className="input-field w-32"
                            />
                          </div>
                        )}
                        {hours.closed && (
                          <span className="text-sm text-gray-400 italic">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
                
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {key === 'emailReminders' && 'Send email reminders for appointments'}
                          {key === 'smsReminders' && 'Send SMS reminders for appointments'}
                          {key === 'appointmentConfirmations' && 'Send appointment confirmation emails'}
                          {key === 'newPatientAlerts' && 'Get notified when new patients register'}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              [key]: e.target.checked
                            }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input type="password" className="input-field" placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" className="input-field" placeholder="Enter new password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" className="input-field" placeholder="Confirm new password" />
                  </div>
                  <button className="btn-primary">Change Password</button>
                </div>
              </div>
            )}

            {activeTab === 'backup' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Backup & Data</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Last Backup</div>
                      <div className="text-sm text-gray-500">January 15, 2024 at 2:30 AM</div>
                    </div>
                    <button className="btn-secondary">Download Backup</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Database Size</div>
                      <div className="text-sm text-gray-500">2.4 GB</div>
                    </div>
                    <button className="btn-secondary">Optimize Database</button>
                  </div>
                  
                  <button className="btn-primary">Create New Backup</button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
