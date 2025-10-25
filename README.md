# Dental Management Dashboard

A modern React-based admin dashboard for dental practice management with appointment scheduling, patient records, and calendar views.

## Features

- 📊 **Dashboard Overview** - Key metrics and today's appointments
- 📅 **Appointment Management** - Create, edit, and manage appointments
- 👥 **Patient Records** - Comprehensive patient information management
- 📆 **Calendar View** - Visual appointment scheduling
- ⚙️ **Settings** - Practice configuration and preferences

## Tech Stack

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **Vite** - Fast build tool and dev server

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   └── DashboardLayout.jsx    # Main layout with sidebar
├── pages/
│   ├── Dashboard.jsx          # Dashboard overview
│   ├── Appointments.jsx       # Appointment management
│   ├── Patients.jsx          # Patient records
│   ├── Calendar.jsx          # Calendar view
│   └── Settings.jsx          # Settings page
├── App.jsx                   # Main app component
├── main.jsx                  # Entry point
└── index.css                 # Global styles
```

## API Integration

The dashboard is designed to work with your existing APIs. You'll need to:

1. Replace the mock data in each component with actual API calls
2. Add authentication/authorization as needed
3. Implement error handling and loading states
4. Add form validation

### Example API Integration

```javascript
// Example: Fetching appointments
const fetchAppointments = async () => {
  try {
    const response = await fetch('/api/appointments')
    const data = await response.json()
    setAppointments(data)
  } catch (error) {
    console.error('Error fetching appointments:', error)
  }
}
```

## Customization

### Colors
The color scheme can be customized in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your primary color palette
      },
      dental: {
        // Dental-specific colors
      }
    }
  }
}
```

### Components
All components are modular and can be easily customized or extended.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your dental practice!