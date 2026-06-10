import React,{useContext} from 'react'
import { useNavigate } from 'react-router-dom'
import {UserDataContext} from '../context/userContext'
import axios from 'axios'

const UserDashboard = () => {
  const navigate = useNavigate()
  const context =useContext(UserDataContext);
  if(!context) return null;

   const { user,setUser } = context ;

  const handleLogout = async () => {
     try{
    const res =await axios.post("http://localhost:3000/logout",{},{
      withCredentials:true
    })
    console.log(res.data.message)
    setUser({
         id:0,
        email:"",
        role:null,
        user_name:""
    })
    navigate("/login")
  }catch(err){
    console.error("Error logging out",err)
  }
  }
    const handleLogoutFromAll = async () => {
     try{
    const res =await axios.patch("http://localhost:3000/logout-from-all",{},{
      withCredentials:true
    })
    console.log(res.data.message)
    setUser({
         id:0,
        email:"",
        role:null,
        user_name:""
    })
    navigate("/login")
  }catch(err){
    console.error("Error logging out",err)
  }
  }

  return (
    <div className="p-8 w-full min-h-screen bg-gray-200">
        <div className='w-full flex justify-between'>
        <div>
      <h1 className="text-2xl font-bold">{user.user_name} Dashboard</h1>
      <p>Welcome, {user.user_name}! Only {user.role} can see this page.</p>
      </div>
      <div>
      <button
      onClick={handleLogout}
      className='p-2 bg-red-600 text-white border rounded-md'>Logout</button>
       <button
      onClick={handleLogoutFromAll}
      className='p-2 bg-red-600 text-white border rounded-md'>Logout from all devices</button>
      <button
      onClick={()=>{
        navigate("/change-password")
      }}
      className='p-2 bg-blue-400 text-white border rounded-md'>Change Password</button>
      
      </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome, {user?.user_name || 'User'}!
            </h2>
            <p className="text-gray-600">
              This is your personal dashboard. Manage your account and settings here.
            </p>
          </div>

          {user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                  Account Information
                </h3>
                <p className="text-gray-700">
                  <strong>Name:</strong> {user.user_name}
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> {user.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard