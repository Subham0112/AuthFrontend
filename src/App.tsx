import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login'
import Register from './pages/register'
import ProtectectedRoute from './components/ProtectedRoute'
import SuperAdminDashboard from './pages/SudoDashboard'
import AdminRegister from "./pages/AdminRegister"
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import ForgotPassword from './pages/forgotPassword'
import ResetPassword from './pages/ResetPassword'
import Alert from './components/Alert'
import type { AlertData } from './components/Alert'
import OTPPage from './pages/otpPage'
import ChangePasswordPage from './pages/ChangePassword'
import { useState } from 'react'


const App = () => {
  const [alert,setAlert]=useState<AlertData | null>(null)
  
  return (
    <>
 {alert && <Alert {...alert} onClose={()=>{
    setAlert(null)
 }} />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login setAlert={setAlert} />} />
        <Route path="/register" element={<Register setAlert={setAlert} />} />
        <Route path="/admin/register" element={<AdminRegister setAlert={setAlert} />} />
        <Route path="/admin/login" element={<AdminLogin  setAlert={setAlert}/>} />
        <Route path="/sudoadmin/dashboard" element={
          <ProtectectedRoute allowedRoles={["sudoadmin"]} redirectTo="/admin/login">
            <SuperAdminDashboard setAlert={setAlert} />
          </ProtectectedRoute>
        } />
         <Route path="/admin/dashboard" element={
          <ProtectectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
            <AdminDashboard setAlert={setAlert} />
          </ProtectectedRoute>
        } />
         <Route path="/dashboard" element={
          <ProtectectedRoute allowedRoles={["user"]} redirectTo="/login">
            <UserDashboard setAlert={setAlert} />
          </ProtectectedRoute>
        } />
        <Route path="/change-password" element={
          <ProtectectedRoute allowedRoles={["user","admin","sudoadmin"]} redirectTo="/login">
            <ChangePasswordPage setAlert={setAlert} />
          </ProtectectedRoute>
        } />

        <Route path="/forgot-password" element={<ForgotPassword setAlert={setAlert} />} />
        <Route path="/otp-page" element={<OTPPage setAlert={setAlert}  />} />
        <Route path='/reset-password' element={<ResetPassword setAlert={setAlert}/>} />
      </Routes>

      </>
  )
}

export default App