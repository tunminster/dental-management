import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Patients from './pages/Patients'
import Dentists from './pages/Dentists'
import Availability from './pages/Availability'
import Calendar from './pages/Calendar'
import Users from './pages/Users'
import Settings from './pages/Settings'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="appointments" element={<ProtectedRoute permission="appointments"><Appointments /></ProtectedRoute>} />
            <Route path="patients" element={<ProtectedRoute permission="patients"><Patients /></ProtectedRoute>} />
            <Route path="dentists" element={<ProtectedRoute permission="dentists"><Dentists /></ProtectedRoute>} />
            <Route path="availability" element={<ProtectedRoute permission="availability"><Availability /></ProtectedRoute>} />
            <Route path="calendar" element={<ProtectedRoute permission="calendar"><Calendar /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute permission="all"><Users /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Route>
          {/* Catch-all route for debugging */}
          <Route path="*" element={
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
              <h1>404 - Page Not Found</h1>
              <p>Current URL: {window.location.pathname}</p>
              <p>This might be a routing issue. Check the browser console for errors.</p>
              <a href="/" style={{ color: 'blue' }}>Go to Dashboard</a>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
