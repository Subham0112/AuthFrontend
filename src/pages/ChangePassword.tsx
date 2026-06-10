import React, { useState } from 'react'
import { BsEye,BsEyeSlash } from 'react-icons/bs';
import axios from "axios"

interface ChangePassword{
    email:string;
    password:string;
    changePassword:string;
}
const ChangePasswordPage = () => {

    const [changeData,setChangeData]=useState<ChangePassword>({
        email:"",
        password: "",
        changePassword: ""
    })
    const [showPassword,setShowPassword]=useState<boolean>(false)
    const [showChangePassword,setShowChangePassword]=useState<boolean>(false)

    const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        setChangeData({
            ...changeData,
            [e.target.name]:e.target.value
        })
    }

    const handleChangePassword=async ()=>{
        try{
            const changePassword=await axios.patch("http://localhost:3000/change-password",changeData,{
                withCredentials:true
            });
            console.log("Successfully Password Changed users:",changePassword.data)
            setChangeData({
                email: "",
                password: "",
                changePassword: ""

            })
        }catch(err){
            console.error("Error:",err)
        }
    }
  return (
    <div>
        <div className='w-full h-screen flex items-center justify-center'>
        <div className='w-[450px] min-h-[400px] bg-gray-200 rounded-lg flex flex-col items-center p-6'>
        <h1 className='text-2xl font-bold'>Change Password</h1>
        <div className="w-full mt-4">
            <div className='mb-4 flex flex-col w-full'>
            <label className="block mb-2">Email</label>
            <input
            onChange={handleChange}
            value={changeData.email}
            name='email'
            type="text" placeholder='Enter Email' className='w-full p-2 rounded-md mb-4' />
            </div>


            <div className='mb-4 flex flex-col w-full'>
            <label className="block mb-2">Password</label>
            <div className="flex items-center gap-2">
            <input
            onChange={handleChange}
            value={changeData.password}
            name='password'
            type={showPassword?"text":"password"} placeholder='Enter old password' className='w-full p-2 rounded-md mb-4' />
            <span onClick={()=>{
                setShowPassword(!showPassword)
             }}>{showPassword ? <BsEye />:<BsEyeSlash />}</span>
             </div>
            </div>


            <div className='mb-4 flex flex-col w-full'>
            <label className="block mb-2">New Password</label>
           <div className="flex items-center gap-2">
            <input
            onChange={handleChange}
            value={changeData.changePassword}
            name='changePassword'
            type={showChangePassword?"text":"password"} placeholder="Enter New Password" className='w-full p-2 rounded-md ' />
            <span onClick={()=>{
                setShowChangePassword(!showChangePassword)
             }}>{showPassword ? <BsEye />:<BsEyeSlash />}</span>
            </div>
            </div>
            <button
            onClick={handleChangePassword}
             className='w-full bg-blue-500 text-white p-2 rounded-md'>Change Password</button>
        </div>
        <div className='w-full mt-8 text-center'>
            <p>Back to <a href='/login' className='text-blue-500'>Login</a></p>
        </div>
        </div>
    </div>
    </div>
  )
}

export default ChangePasswordPage