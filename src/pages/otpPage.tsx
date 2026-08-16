import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { AlertData } from '../components/Alert';
import AuthLayout from '../components/AuthLayout';
import { BsKeyFill } from 'react-icons/bs';


const OtpPage = ({setAlert}:{ setAlert: React.Dispatch<React.SetStateAction<AlertData | null>> }) => {
  const [otp,setOtp]=useState<string>("");
  const navigate=useNavigate();
  const email=localStorage.getItem("email");


  const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    setOtp(e.target.value)
  }

  const handleSubmitOTP=async()=>{
try{
  
  const otpData={
    otp,
    email
  }

    const res=await axios.post(`${import.meta.env.VITE_BACKEND_API}/verify-otp`,otpData);
  if(res.status===200){
    setAlert({ type: 'success', title: 'OTP verified', message: res.data.message })
    navigate("/reset-password")
  }

}catch(err){
  if(axios.isAxiosError(err)){
      const data = err.response?.data
      if(data?.message){
        setAlert({
          type:"error",
          title:"Error Verifying OTP",
          message:data.message
        })
        console.error("OTP Verification failed",data.message)
      }
  }else{
    setAlert({
      type:"error",
      title:"Error Verifying OTP",
      message:"OTP Verification Failed"
    })
  }
  console.error(err)
}
  }
  const resendOtp=async()=>{
    const resendEmail={
      email
    }
try{
   const res=await axios.patch(`${import.meta.env.VITE_BACKEND_API}/resend-otp`,resendEmail);
    if(res.status===200){
      setAlert({ type: 'info', title: 'OTP resent', message: res.data.message || 'A new OTP has been sent.' })
      return
    }
}catch(err){
  const errorMessage = axios.isAxiosError(err) ? err.response?.data?.message || err.message : "Unable to resend OTP."
  setAlert({ type: 'error', title: 'Resend failed', message: errorMessage })
  console.log(err)
}
 

  }
  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Enter your OTP"
      subtitle={
        <>
          We've sent a one-time code to{" "}
          <span className="font-semibold text-ink-700">{email || "your email"}</span>.
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-100 text-sage-700">
            <BsKeyFill size={22} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="otp" className="label-luxe text-center">One-time code</label>
          <input
            id="otp"
            onChange={handleChange}
            value={otp}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            className="input-luxe py-3 text-center font-display text-xl tracking-[0.5em]"
          />
        </div>

        <button
          onClick={handleSubmitOTP}
          disabled={otp.trim().length < 4}
          className="btn-primary w-full py-3 text-[13.5px]"
        >
          Verify and continue
        </button>
      </div>

      <div className="mt-6 text-center text-[13px] text-ink-400">
        Didn't receive it?{" "}
        <button
          onClick={resendOtp}
          className="font-semibold text-sage-700 transition-colors hover:text-sage-600 hover:underline"
        >
          Resend code
        </button>
      </div>
    </AuthLayout>
  )
}

export default OtpPage