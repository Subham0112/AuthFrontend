import React,{useState,useEffect,useContext} from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { UsersDatas } from '../UserData';
import {UserDataContext} from "../context/userContext";
// import Alert from '../components/Alert'
import type { AlertData } from '../components/Alert';



const SuperAdminDashboard = ({setAlert}:{ setAlert: React.Dispatch<React.SetStateAction<AlertData | null>> }) => {
  
  const [users,setUsers]=useState<UsersDatas[]>([]);
  const context = useContext(UserDataContext);
  const navigate=useNavigate();

useEffect(()=>{
  try{
    const FetchAllUsers=async ()=>{
       const response=await axios.get(`${import.meta.env.VITE_BACKEND_API}/getAllUsers`,{
        withCredentials:true
       });
       setUsers(response.data)
    }
    FetchAllUsers();
  }catch(err){
    console.log("error fetching users",err)
  }
},[])

if (!context) return null;
const { user, setUser } = context ;

const handleDelete=async (id:number)=>{
  try{
  const deleteUser=await axios.delete(`${import.meta.env.VITE_BACKEND_API}/deleteUser/${id}`,{
     withCredentials:true
  });
  if(deleteUser.status===200){
    setAlert({
      type:"success",
      title:"User Deleted",
      message:deleteUser.data.message
    })
  }
  console.log(deleteUser.data.message)
  setUsers(users.filter((user)=>{
    return user.id!==id;
  }))
  }catch(err){
   if(axios.isAxiosError(err)){
      const data = err.response?.data
      if(data?.message){
        setAlert({
          type:"error",
          title:"Error Deleting Users",
          message:data.message
        })
        console.error("Error deleting user:",data.message)
      }
  }else{
    setAlert({
      type:"error",
      title:"Error Deleting Users",
      message:"Error Deleting Users"
    })
  }
  }


}

const handleLogout=async ()=>{
  try{
    const res =await axios.post(`${import.meta.env.VITE_BACKEND_API}/logout`,{},{
      withCredentials:true
    })
    console.log(res.data.message)
    setUser({
         id:0,
        email:"",
        role:null,
        user_name:""
    })
    navigate("/admin/login")
  }catch(err){
    console.error("Error logging out",err)
  }

}
 const handleLogoutFromAll = async () => {
     try{
    const res =await axios.patch(`${import.meta.env.VITE_BACKEND_API}/logout-from-all`,{},{
      withCredentials:true
    })
    console.log(res.data.message)
    setUser({
         id:0,
        email:"",
        role:null,
        user_name:""
    })
    navigate("/admin/login")
  }catch(err){
    console.error("Error logging out",err)
  }
  }


  return (
    <div className="p-8 w-full min-h-screen bg-gray-200">
      <div className='w-full flex justify-between'>
      <div>
      <h1 className="text-2xl font-bold">{user.user_name} Dashboard</h1>
      <p>Welcome, Sudoadmin! Only {user.role} can see this page.</p>
      </div>
      <div>
      <button
      onClick={handleLogout}
      className='p-2 bg-red-600 text-white'>Logout</button>
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
      <div className='w-full '>
      <div className='w-full overflow-x-auto mt-6'>
      <table className='w-full border-collapse'>
      <thead>
      <tr >
        <th className='border border-gray-400 px-4 py-2 text-left'>ID</th>
        <th className='border border-gray-400 px-4 py-2 text-left'>Name</th>
        <th className='border border-gray-400 px-4 py-2 text-left'>Email</th>
        <th className='border border-gray-400 px-4 py-2 text-left'>Role</th>
        <th className='border border-gray-400 px-4 py-2 text-left'>Action</th>
       </tr>
       </thead>
       <tbody>
      {users.map((user) => (
        <tr key={user.id}>
          <td className='border border-gray-300 px-4 py-2'>{user.id}</td>
          <td className='border border-gray-300 px-4 py-2'>{user.user_name}</td>
          <td className='border border-gray-300 px-4 py-2'>{user.email}</td>
          <td className='border border-gray-300 px-4 py-2'>{user.role}</td>
          <td className='border border-gray-300 px-4 py-2'>
            <button
            onClick={()=>{
              handleDelete(user.id)
            }}
            className='p-2 bg-red-500 rounded-md'>Delete
            </button></td>
        </tr>
         ))}
        </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard
