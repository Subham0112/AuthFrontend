import React,{useContext, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import {UserDataContext} from '../context/userContext'
import axios from 'axios'

const UserDashboard = () => {
  const navigate = useNavigate()
  const [file,setFile]=useState<File | null >(null);
  // const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

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
        user_name:"",
        media:[]
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
        user_name:"",
        media:[]
    })
    navigate("/login")
  }catch(err){
    console.error("Error logging out",err)
  }
  }

  const handleUpload=async ()=>{
    try{
  if (!file) return;

    const formData=new FormData();
    formData.append("file",file);
    formData.append("userId",String(user.id))
    const res = await axios.post("http://localhost:3000/upload-file",formData);
    setUser({
      ...user,
       media: [...(user.media || []), {
                id:res.data.id,
                filename: res.data.file.filename,
                file_url: res.data.file.file_url
            }]

    })
    setFile(null)
    console.log(res.data)
    }catch(err){
      console.log(err)
    }
    
  }
  const handleFileDelete=async (id:number)=>{
    try{
      const res= await axios.delete(`http://localhost:3000/delete-file/${id}`);
      console.log(res.data.message);
      setUser({
        ...user,
        media:user.media?.filter((item)=>{
          return item.id!==id
        })
      })

    }catch(err){
      console.log(err)
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
        <div className="bg-white rounded-lg shadow-lg p-8 flex">
          <div className='min-w-[60%]'>
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
          <div className='flex flex-col gap-4' >
            <div className='flex flex-col gap-3'>
            <label htmlFor="file" className='border w-[100px]  p-2 bg-gray-400 mr-2'> 
              Select File
            </label>
          <input onChange={(e)=>{
            if(e.target.files){
              setFile(e.target.files[0])
            }
          }} id="file" className='p-2' type="file" hidden />
          <span
          className='border p-2 bg-zinc-200 mr-2'
          >{file?file.name:"No file selected"}</span>
          </div>
          <button
          onClick={handleUpload}
          className='p-2 border bg-green-500 rounded-md max-w-[150px] '>Upload File</button>

<div className='mt-4 max-w- grid grid-cols-2 gap-2'>
         {user.media && user.media?.map((item,index)=>{
            return (
              <div key={index} className=' flex flex-col gap-2' >
              <img
              
               src={item.file_url}
                alt="uploaded"
                className="h-36 object-cover rounded-md" />
                <button
                onClick={()=>{
                  handleFileDelete(item.id)
                }}
                className='p-2 bg-red-500 rounded-md w-[80px]'>Delete</button>
                </div>
              )
            })}
            </div>
          </div>
         
        </div>
      </div>
    </div>
  )
}

export default UserDashboard