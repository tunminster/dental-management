import { useAuth } from '../contexts/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'
import { Shield, Loader } from 'lucide-react'

export default function ProtectedRoute({ children, permission }) {
  const { user, hasPermission, loading } = useAuth()
  const location = useLocation()

  // Debug logging
  console.log('ProtectedRoute Debug:', {
    user: user ? { id: user.id, username: user.username, role: user.role } : null,
    loading,
    permission,
    hasPermission: permission ? hasPermission(permission) : 'N/A',
    currentPath: location.pathname
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('No user found, redirecting to login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (permission && !hasPermission(permission)) {
    console.log('Permission denied for:', permission)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mb-4">Required permission: {permission}</p>
          <p className="text-sm text-gray-500 mb-4">Your role: {user.role}</p>
          <button
            onClick={() => window.history.back()}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  console.log('Access granted, rendering children')
  return children
}
