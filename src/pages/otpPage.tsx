import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OtpPage = () => {
  const [otp,setOtp]=useState<number>();
  const navigate=useNavigate();
  const email=localStorage.getItem("email");

  const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    setOtp(Number(e.target.value))
  }

  const handleSubmitOTP=async()=>{
try{
  
  const otpData={
    otp,
    email
  }

    const res=await axios.post("http://localhost:3000/verify-otp",otpData);
  if(res.status===200){
    console.log(res.data.message);
    navigate("/reset-password")
  }

}catch(err){
  console.error(err)
}
  }
  const resendOtp=async()=>{
    const resendEmail={
      email
    }
try{
   const res=await axios.patch("http://localhost:3000/resend-otp",resendEmail);
    if(res.status===200){
      return console.log(res.data.message);
    }
}catch(err){
  console.log(err)
}
 

  }
  return (
    <div>
          <div className='w-full h-screen flex items-center justify-center'>
      <div className='w-[400px] min-h-[300px] bg-gray-200 rounded-lg flex flex-col items-center p-6'>
        <h1 className='text-2xl font-bold'>Enter OTP</h1>
        <p>OTP has been sent to your registered account</p>
        <div className='w-full mt-5'>
            <div className='mb-4 flex flex-col w-full'>
                <label htmlFor="otp" className='block mb-2'>Enter your OTP</label>
                <input
                onChange={handleChange}
                value={otp}
                type="number" placeholder='Enter your otp' className='w-full p-2 rounded-md mb-4' />
            </div>
            <button
              onClick={handleSubmitOTP}
             className='w-full bg-blue-500 text-white p-2 rounded-md'>Verify otp</button>
        </div>
        <div className='w-full mt-4 text-center'>
            <p className='mt-4'>Didn't get an OTP? <span  onClick={resendOtp} className='text-blue-500'>Resend</span></p>
        </div>
      </div>
    </div>
        
    </div>
  )
}

export default OtpPage;