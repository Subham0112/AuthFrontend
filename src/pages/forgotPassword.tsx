import { useState } from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'
// import Alert from '../components/Alert'
import type { AlertData } from '../components/Alert';




const ForgotPassword = ({setAlert}:{ setAlert: React.Dispatch<React.SetStateAction<AlertData | null>> }) => {
    const [email,setEmail]=useState<string>("");


    const navigate=useNavigate();

    const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        setEmail(e.target.value)

    }

const handleForgotClick=async ()=>{
    
    try{
       const res= await axios.post(`${import.meta.env.VITE_BACKEND_API}/forget-password`,{email})
        localStorage.setItem("email",email)
        
        setAlert({ type: 'success', title: 'OTP Sent', message: res.data.message })
        navigate('/otp-page')
    }catch(err){
        if(axios.isAxiosError(err)){
      const data = err.response?.data
      if(data?.message){
        setAlert({
          type:"error",
          title:"Error Sending OTP ",
          message:data.message
        })
        console.error("Error sending Otp on email",data.message)
      }
  }else{
    setAlert({
      type:"error",
      title:"Error Sending OTP",
      message:"Error Sending OTP in your email"
    })
  }
        console.error(err)
    }
}

  return (
    <div>
          <div className='w-full h-screen flex items-center justify-center'>
      <div className='w-[400px] min-h-[200px] bg-gray-200 rounded-lg flex flex-col items-center p-6'>
        <h1 className='text-2xl font-bold'>Forget Password?</h1>
        <p className='text-sm text-gray-500 font-light '>Enter your registered email for OTP</p>
        <div className='w-full mt-4'>
            <div className='mb-4 flex flex-col w-full'>
                <label htmlFor="email" className='block mb-2'>Email</label>
                <input 
                onChange={handleChange}
                value={email}
                type="email" placeholder='Email' className='w-full p-2 rounded-md mb-4' />
            </div>
            <button
             onClick={handleForgotClick}
             className='w-full bg-blue-500 text-white p-2 rounded-md'>Send Otp</button>
        </div>
      </div>
    </div>
    </div>
  )
}

export default ForgotPassword