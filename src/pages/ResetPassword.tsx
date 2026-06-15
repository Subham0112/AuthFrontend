import { useState } from 'react';
import axios from 'axios';
import { BsEye,BsEyeSlash } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
// import Alert from '../components/Alert'
import type { AlertData } from '../components/Alert';


const ResetPassword = ({setAlert}:{ setAlert: React.Dispatch<React.SetStateAction<AlertData | null>> }) => {

    const [newPassword,setNewPassword]=useState<string>('');
    const [confirmPassword,setConfirmPassword]=useState<string>('')
    const [showPassword,setShowPassword]=useState<boolean>(false);
    const [showConfirmPassword,setShowConfirmPassword]=useState<boolean>(false);

    const navigate=useNavigate();
    

    const handleSubmit=async()=>{
      const email=localStorage.getItem("email")
      const resetData={
        newPassword,
        email
      }
      try{
        if(newPassword!==confirmPassword){
          setAlert({ type: 'error', title: 'Password mismatch', message: 'New password and confirmation must match.' })
          return
        }
        const res = await axios.patch("http://localhost:3000/reset-password",resetData)
        setAlert({ type: 'success', title: 'Password reset', message: res.data.message })
        navigate("/login")
      }catch(err){
          if(axios.isAxiosError(err)){
      const data = err.response?.data
      if(data?.message){
        setAlert({
          type:"error",
          title:"Error Resetting Password",
          message:data.message
        })
        console.error("Failed to Reset Password",data.message)
      }
  }else{
    setAlert({
      type:"error",
      title:"Error Resetting Password",
      message:"Failed to Reset Password"
    })
  }
      }
    }

  return (
    <div> 
      <div className='w-full h-screen flex items-center justify-center'>
      <div className='w-[400px] min-h-[300px] bg-gray-200 rounded-lg flex flex-col items-center p-6'>
        <h1 className='text-2xl font-bold'>Reset Password</h1>
        <div className='w-full mt-4'>
            <div className='mb-4 flex flex-col w-full'>
                <label className='block mb-2'>New Password</label>
                <div className='flex items-center gap-2'>
            <input
             onChange={(e)=>{
                setNewPassword(e.target.value)
             }}
             name='newPassword'
             value={newPassword}

            type={showPassword?"text":"password" } placeholder='Enter New Password' className='w-full p-2 rounded-md ' />
            <span onClick={()=>{
              setShowPassword(!showPassword)
            }}>{showPassword ? <BsEye />:<BsEyeSlash />}</span>
            </div>
            </div>
            <div className='mb-4 flex flex-col'> 
                <label className='block mb-2'>Password</label>
                <div className='flex items-center gap-2'>
                <input
                onChange={(e)=>{
                    setConfirmPassword(e.target.value)
                }}
                name="confirmPassword"
                value={confirmPassword}
                type={showConfirmPassword?"text":"password" } placeholder='Confirm Password' className='w-full p-2 rounded-md ' />
                <span
                className='flex items-center h-'
                 onClick={()=>{
              setShowConfirmPassword(!showConfirmPassword)
            }}>{showConfirmPassword ? <BsEye />:<BsEyeSlash />}</span>
            </div>
            </div>
            <div className='flex flex-col w-full gap-2'>
            <button
            onClick={handleSubmit}
             className='w-full bg-blue-500 text-white p-2 rounded-md'>Reset Password</button>
            <button
            onClick={()=>{
              navigate("/login")
            }}
             className='w-full bg-red-500 text-white p-2 rounded-md'>Cancel</button>
             </div>
         </div>
       </div>
     </div>
        </div>
  )
}

export default ResetPassword