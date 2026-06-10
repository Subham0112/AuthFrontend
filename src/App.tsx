import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login'
import Register from './pages/register'
import ProtectectedRoute from './components/ProtectedRoute'
import SuperAdminDashboard from './pages/SudoDashboard'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ForgotPassword from './pages/forgotPassword'
import ResetPassword from './pages/ResetPassword'
import OTPPage from './pages/otpPage'
import ChangePasswordPage from './pages/ChangePassword'

const App = () => {
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/sudoadmin/dashboard" element={
          <ProtectectedRoute allowedRoles={["sudoadmin"]}>
            <SuperAdminDashboard />
          </ProtectectedRoute>
        } />
         <Route path="/admin/dashboard" element={
          <ProtectectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectectedRoute>
        } />
         <Route path="/dashboard" element={
          <ProtectectedRoute allowedRoles={["user"]}>
            <UserDashboard />
          </ProtectectedRoute>
        } />
        <Route path="/change-password" element={
          <ProtectectedRoute allowedRoles={["user","admin","sudoadmin"]}>
            <ChangePasswordPage />
          </ProtectectedRoute>
        } />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-page" element={<OTPPage />} />
        <Route path='/reset-password' element={<ResetPassword />} />
      </Routes>
  )
}

export default App