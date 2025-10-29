# Timezone Configuration Guide

## Overview
The dental management system now uses **clinic timezone** instead of user's system timezone for consistent date/time display across all staff members.

## Configuration Options

### 1. Environment Variable (Recommended for Production)
Set the clinic timezone in your `.env.local` file:

```bash
# .env.local
VITE_CLINIC_TIMEZONE=America/New_York
```

### 2. Code Configuration (Default)
Edit `src/utils/timezone.js` and change the `CLINIC_TIMEZONE` constant:

```javascript
// Default clinic timezone - change this to your clinic's timezone
const CLINIC_TIMEZONE = 'America/New_York' // Change to your clinic's timezone
```

### 3. Runtime Configuration (User Setting)
Users can set their preferred timezone in localStorage (this will override the default):

```javascript
import { setClinicTimezone } from '../utils/timezone'

// Set timezone programmatically
setClinicTimezone('America/Chicago')
```

## Available Timezones

The system supports all standard timezone identifiers. Common options for US dental clinics:

| Timezone | Display Name | Example |
|----------|--------------|---------|
| `America/New_York` | Eastern Time (ET) | New York, Miami |
| `America/Chicago` | Central Time (CT) | Chicago, Dallas |
| `America/Denver` | Mountain Time (MT) | Denver, Phoenix |
| `America/Los_Angeles` | Pacific Time (PT) | Los Angeles, Seattle |
| `America/Phoenix` | Arizona Time (MST) | Phoenix (no DST) |
| `America/Anchorage` | Alaska Time (AKST) | Anchorage |
| `Pacific/Honolulu` | Hawaii Time (HST) | Honolulu |

## How It Works

### Priority Order:
1. **Environment Variable** (`VITE_CLINIC_TIMEZONE`) - Highest priority
2. **User Setting** (localStorage) - Medium priority  
3. **Default Configuration** (`CLINIC_TIMEZONE`) - Fallback

### Date Display:
- **Before**: `new Date("2026-01-15").toLocaleDateString()` → Could show wrong date due to timezone
- **After**: `formatDateInClinicTimezone("2026-01-15")` → Always shows correct clinic date

## Benefits

✅ **Consistency**: All staff see the same dates regardless of their location  
✅ **Accuracy**: No more "off by one day" issues  
✅ **Professional**: Medical systems standard  
✅ **Flexible**: Easy to configure for different clinics  
✅ **Future-proof**: Supports multi-location practices  

## Implementation

The timezone utility is now integrated into:
- ✅ **Availability.jsx** - Dentist availability dates
- ✅ **Appointments.jsx** - Appointment dates  
- ✅ **Patients.jsx** - Patient DOB, last visit, next appointment

## Testing

To test different timezones:

1. **Set environment variable**:
   ```bash
   VITE_CLINIC_TIMEZONE=America/Los_Angeles npm run dev
   ```

2. **Or set in browser console**:
   ```javascript
   localStorage.setItem('clinic_timezone', 'America/Chicago')
   location.reload()
   ```

## Troubleshooting

**Issue**: Dates still showing wrong timezone  
**Solution**: Check priority order - environment variable overrides localStorage

**Issue**: Timezone not recognized  
**Solution**: Use standard timezone identifiers (see list above)

**Issue**: Dates showing as "Invalid Date"  
**Solution**: Check API response format - should be "YYYY-MM-DD"
