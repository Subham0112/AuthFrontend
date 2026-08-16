import { useState } from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import type { AlertData } from '../components/Alert';
import AuthLayout from '../components/AuthLayout';
import { BsEnvelope } from 'react-icons/bs';




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
    <AuthLayout
      eyebrow="Account recovery"
      title="Forgot your password?"
      subtitle="Enter the email you registered with — we'll send you a one-time code."
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="label-luxe">Email</label>
          <div className="flex items-center gap-2.5 rounded-xl border border-ivory-300 bg-ivory-100 px-3.5 py-2.5 transition-all duration-150 focus-within:border-sage-600 focus-within:bg-white focus-within:ring-[3px] focus-within:ring-sage-200/70">
            <BsEnvelope className="text-ink-300 shrink-0" />
            <input
              id="email"
              onChange={handleChange}
              value={email}
              type="email"
              placeholder="you@example.com"
              className="w-full bg-transparent text-[13.5px] text-ink-900 outline-none placeholder:text-ink-300"
            />
          </div>
        </div>

        <button
          onClick={handleForgotClick}
          disabled={!email.trim()}
          className="btn-primary w-full py-3 text-[13.5px]"
        >
          Send me an OTP
        </button>
      </div>

      <div className="mt-7 text-center text-[13px] text-ink-400">
        Remembered it after all?{" "}
        <a href="/login" className="font-semibold text-sage-700 transition-colors hover:text-sage-600 hover:underline">
          Back to log in
        </a>
      </div>
    </AuthLayout>
  )
}

export default ForgotPassword