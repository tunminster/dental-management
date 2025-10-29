/**
 * Timezone utility for dental management system
 * Handles clinic timezone configuration and date formatting
 */

// Default clinic timezone - you can change this to your clinic's timezone
const CLINIC_TIMEZONE = 'America/Los_Angeles' // Change to your clinic's timezone

// Common timezone options for dental clinics
export const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKST)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'UTC', label: 'UTC' }
]

/**
 * Get the current clinic timezone
 * Can be overridden by environment variable or settings
 */
export const getClinicTimezone = () => {
  // Check environment variable first
  const envTimezone = import.meta.env.VITE_CLINIC_TIMEZONE
  if (envTimezone) {
    return envTimezone
  }
  
  // Check localStorage for user setting
  const savedTimezone = localStorage.getItem('clinic_timezone')
  if (savedTimezone) {
    return savedTimezone
  }
  
  // Default to configured timezone
  return CLINIC_TIMEZONE
}

/**
 * Format a date string in clinic timezone
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDateInClinicTimezone = (dateString, options = {}) => {
  if (!dateString) return 'N/A'
  
  try {
    // Parse the date string correctly
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    
    // Format in clinic timezone
    const clinicTimezone = getClinicTimezone()
    
    const defaultOptions = {
      timeZone: clinicTimezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    }
    
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

/**
 * Format a datetime string in clinic timezone
 * @param {string} datetimeString - ISO datetime string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted datetime string
 */
export const formatDateTimeInClinicTimezone = (datetimeString, options = {}) => {
  if (!datetimeString) return 'N/A'
  
  try {
    const date = new Date(datetimeString)
    const clinicTimezone = getClinicTimezone()
    
    const defaultOptions = {
      timeZone: clinicTimezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    }
    
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date)
  } catch (error) {
    console.error('Error formatting datetime:', error)
    return datetimeString
  }
}

/**
 * Format time in clinic timezone
 * @param {string} timeString - Time string in HH:MM format
 * @returns {string} Formatted time string
 */
export const formatTimeInClinicTimezone = (timeString) => {
  if (!timeString) return 'N/A'
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    
    const clinicTimezone = getClinicTimezone()
    
    return new Intl.DateTimeFormat('en-US', {
      timeZone: clinicTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  } catch (error) {
    console.error('Error formatting time:', error)
    return timeString
  }
}

/**
 * Get current time in clinic timezone
 * @returns {Date} Current date/time in clinic timezone
 */
export const getCurrentClinicTime = () => {
  const clinicTimezone = getClinicTimezone()
  const now = new Date()
  
  // Convert to clinic timezone
  return new Date(now.toLocaleString('en-US', { timeZone: clinicTimezone }))
}

/**
 * Set clinic timezone preference
 * @param {string} timezone - Timezone string (e.g., 'America/New_York')
 */
export const setClinicTimezone = (timezone) => {
  localStorage.setItem('clinic_timezone', timezone)
}

/**
 * Get timezone offset for clinic
 * @returns {string} Timezone offset string (e.g., 'UTC-5')
 */
export const getClinicTimezoneOffset = () => {
  try {
    const clinicTimezone = getClinicTimezone()
    const now = new Date()
    
    const offset = new Intl.DateTimeFormat('en-US', {
      timeZone: clinicTimezone,
      timeZoneName: 'longOffset'
    }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value
    
    return offset || 'Unknown'
  } catch (error) {
    console.error('Error getting timezone offset:', error)
    return 'Unknown'
  }
}

/**
 * Get user-friendly timezone display for clinic
 * @returns {string} Display string (e.g., 'Pacific Time (PT)')
 */
export const getClinicTimezoneDisplay = () => {
  try {
    const clinicTimezone = getClinicTimezone()
    
    // Find the display name from our predefined options
    const timezoneOption = TIMEZONE_OPTIONS.find(option => option.value === clinicTimezone)
    if (timezoneOption) {
      return timezoneOption.label
    }
    
    // Fallback: format the timezone name nicely
    const parts = clinicTimezone.split('/')
    const city = parts[parts.length - 1].replace(/_/g, ' ')
    return `${city} Time`
  } catch (error) {
    console.error('Error getting timezone display:', error)
    return 'Unknown Timezone'
  }
}

/**
 * Get current time in clinic timezone for display
 * @returns {string} Current time string (e.g., '2:30 PM')
 */
export const getCurrentClinicTimeDisplay = () => {
  try {
    const clinicTimezone = getClinicTimezone()
    const now = new Date()
    
    return new Intl.DateTimeFormat('en-US', {
      timeZone: clinicTimezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(now)
  } catch (error) {
    console.error('Error getting current clinic time:', error)
    return 'Unknown'
  }
}
