import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { getClinicTimezoneDisplay } from '../utils/timezone'

export default function TimezoneIndicator() {
  const [timezoneDisplay, setTimezoneDisplay] = useState('')

  useEffect(() => {
    setTimezoneDisplay(getClinicTimezoneDisplay())
  }, [])

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-200">
      <Clock className="h-4 w-4 text-gray-500" />
      <div className="text-sm text-gray-700 font-medium">
        {timezoneDisplay}
      </div>
    </div>
  )
}
