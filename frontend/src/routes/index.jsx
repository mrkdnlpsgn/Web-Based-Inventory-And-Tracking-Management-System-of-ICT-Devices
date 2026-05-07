import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login      from '../pages/Auth/Login'
import Dashboard  from '../pages/Dashboard'
import Inventory  from '../pages/Inventory'
import Tracking   from '../pages/Tracking'
import Reports    from '../pages/Reports'
import QRScanner  from '../pages/QRScanner'

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"       element={<PublicRoute><Login      /></PublicRoute>} />

      <Route path="/dashboard"   element={<ProtectedRoute><Dashboard  /></ProtectedRoute>} />
      <Route path="/inventory"   element={<ProtectedRoute><Inventory  /></ProtectedRoute>} />
      <Route path="/tracking"    element={<ProtectedRoute><Tracking   /></ProtectedRoute>} />
      <Route path="/reports"     element={<ProtectedRoute><Reports    /></ProtectedRoute>} />
      <Route path="/qr-scanner"  element={<ProtectedRoute><QRScanner  /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRoutes
