import React, { useState } from 'react'
import { BsEye,BsEyeSlash } from 'react-icons/bs';
import axios from "axios"

interface RegisterData{
    name:string;
    email:string;
    password:string;
    role:string;
}
const Register = () => {

    const [userRegisterData,setRegisterData]=useState<RegisterData>({
        name:"",
        email: "",
        password: "",
        role:"user"
    })
    const [showPassword,setShowPassword]=useState<boolean>(false)

    const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        setRegisterData({
            ...userRegisterData,
            [e.target.name]:e.target.value
        })
    }

    const handleSubmit=async ()=>{

        try{
            const registerUser=await axios.post("http://localhost:3000/register",userRegisterData);
            console.log("Successfully registered users:",registerUser.data)
            setRegisterData({
                name:"",
                email: "",
                password: "",
                role:"user"
            })
        }catch(err){
            console.error("Error:",err)
        }
        console.log(userRegisterData)
    }
  return (
    <div>
        <div className='w-full h-screen flex items-center justify-center'>
        <div className='w-[450px] min-h-[400px] bg-gray-200 rounded-lg flex flex-col items-center p-6'>
        <h1 className='text-2xl font-bold'>Register Page</h1>
        <div className="w-full mt-4">
            <div className='mb-4 flex flex-col w-full'>
            <label htmlFor="name" className="block mb-2">Name</label>
            <input
            onChange={handleChange}
            value={userRegisterData.name}
            name='name'
            type="text" placeholder='Enter Name' className='w-full p-2 rounded-md mb-4' />
            </div>
            <div className='mb-4 flex flex-col w-full'>
            <label htmlFor="email" className="block mb-2">Email</label>
            <input
            onChange={handleChange}
            value={userRegisterData.email}
            name='email'
            type="email" placeholder='Enter Email' className='w-full p-2 rounded-md mb-4' />
            </div>
            <div className='mb-4 flex flex-col w-full'>
            <label htmlFor="password" className="block mb-2">Password</label>
           <div className="flex items-center gap-2">
            <input
            onChange={handleChange}
            value={userRegisterData.password}
            name='password'
            type={showPassword?"text":"password"} placeholder="Enter Password" className='w-full p-2 rounded-md ' />
            <span onClick={()=>{
                setShowPassword(!showPassword)
             }}>{showPassword ? <BsEye />:<BsEyeSlash />}</span>
            </div>
            </div>
            <button
            onClick={handleSubmit}
             className='w-full bg-blue-500 text-white p-2 rounded-md'>Register</button>
        </div>
        <div className='w-full mt-8 text-center'>
            <p>Already have an Account? <a href='/login' className='text-blue-500'>Login</a></p>
        </div>
        </div>
    </div>
    </div>
  )
}

export default Register