import React,{useState} from 'react'
import type {ChangeEvent} from 'react'
import { useContext } from 'react';
import { UserDataContext } from '../context/userContext';
import { BsEye,BsEyeSlash } from 'react-icons/bs';
import axios from "axios"
import { useNavigate } from 'react-router-dom';


interface UserData {
    email: string;
    password: string;
}
const Login = () => {

const [usersData, setUsersData] = useState<UserData>({
    email: "",
    password: ""
})  
const [showPassword,setShowPassword]=useState<boolean>(false);

const navigate=useNavigate();

const context=useContext(UserDataContext);
if(!context){
    return null
}
const {setUser}= context;


const handleChange=(e:ChangeEvent<HTMLInputElement>)=>{
    setUsersData({
        ...usersData,
        [e.target.name]: e.target.value
    })
}

const handleSubmit =async ()=>{
    try{
        const res=await axios.post("http://localhost:3000/login",usersData,{
            withCredentials:true
        });
        console.log("logged in successfully");
        setUser(res.data.user);
        const userRole=res.data.user.role;
        if (userRole === "sudoadmin") {
            navigate("/sudoadmin/dashboard")
        }else if(userRole==="admin"){
            navigate("/admin/dashboard")
        }else{
             navigate("/dashboard")
        }
 
        console.log(res.data.user)
    }catch(err){
        console.log("Error:",err)
    }
}
  return (
    <>
    <div className='w-full h-screen flex items-center justify-center'>
      <div className='w-[400px] min-h-[400px] bg-gray-200 rounded-lg flex flex-col items-center p-6'>
        <h1 className='text-2xl font-bold'>Login Page</h1>
        <div className='w-full mt-4'>
            <div className='mb-4 flex flex-col w-full'>
                <label htmlFor="email" className='block mb-2'>Email</label>
                
            <input
             onChange={handleChange}
             name='email'
             value={usersData.email}

            type="email" placeholder='Email' className='w-full p-2 rounded-md mb-4' />
            </div>
            <div className='mb-4 flex flex-col'> 
                <label htmlFor="password" className='block mb-2'>Password</label>
                <div className='flex items-center gap-2'>
                <input
                onChange={handleChange}
                name="password"
                value={usersData.password}
                type={showPassword?"text":"password"} placeholder='Password' className='w-full p-2 rounded-md ' />
                 <span
                 className='flex items-center h-'
                 onClick={()=>{
                 setShowPassword(!showPassword)
                  }}>{showPassword ? <BsEye />:<BsEyeSlash />}</span>
                </div>
            </div>
            <button
            onClick={handleSubmit}
             className='w-full bg-blue-500 text-white p-2 rounded-md'>Login</button>
        </div>
        <div className='w-full mt-4 text-center'>
            <p className='mt-4'>Don't have an account? <a href="/register" className='text-blue-500'>Register</a></p>
            <p className='mt-2'><a href="/forgot-password" className='text-blue-500'>Forgot Password?</a></p>
        </div>
      </div>
    </div>
        
    </>
  )
}

export default Login