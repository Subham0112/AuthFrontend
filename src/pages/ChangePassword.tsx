import { useContext, useState } from 'react'
import { BsEye,BsEyeSlash } from 'react-icons/bs';
import axios from "axios"
// import Alert from '../components/Alert'
import type { AlertData } from '../components/Alert';
import {UserDataContext} from "../context/userContext";

interface ChangePassword{
    password:string;
    changePassword:string;
}
const ChangePasswordPage = ({setAlert}:{ setAlert: React.Dispatch<React.SetStateAction<AlertData | null>> }) => {


    const [changeData,setChangeData]=useState<ChangePassword>({
        password: "",
        changePassword: ""
    })
    const [showPassword,setShowPassword]=useState<boolean>(false)
    const [showChangePassword,setShowChangePassword]=useState<boolean>(false)
    const context=useContext(UserDataContext);
    if(!context) return null
    const {user} = context

    const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        setChangeData({
            ...changeData,
            [e.target.name]:e.target.value
        })
    }

    const handleChangePassword=async ()=>{
        try{
            const updateData={
                email:user.email,
                password:changeData.password,
                changePassword:changeData.changePassword
            }
            await axios.patch("http://localhost:3000/change-password",updateData,{
                withCredentials:true
            });
            setAlert({ type: 'success', title: 'Password changed', message: 'Your password was updated successfully.' })
            setChangeData({
                password: "",
                changePassword: ""

            })
        }catch(err){
    if(axios.isAxiosError(err)){
      const data = err.response?.data
      if(data?.message){
        setAlert({
          type:"error",
          title:"Error Password Change",
          message:data.message
        })
        console.error("Error Changing Password:",data.message)
      }
  }else{
    setAlert({
      type:"error",
      title:"Error Changing Password",
      message:"Error Changing Password"
    })
  }
        }
    }
  return (
    <div>
        <div className='w-full h-screen flex items-center justify-center'>
        <div className='w-[450px] min-h-[400px] bg-gray-200 rounded-lg flex flex-col items-center p-6'>
        <h1 className='text-2xl font-bold'>Change Password</h1>
        <div className="w-full mt-4">
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
             }}>{showChangePassword ? <BsEye />:<BsEyeSlash />}</span>
            </div>
            </div>
            <button
            onClick={handleChangePassword}
             className='w-full bg-blue-500 text-white p-2 rounded-md'>Change Password</button>
        </div>
        </div>
    </div>
    </div>
  )
}

export default ChangePasswordPage