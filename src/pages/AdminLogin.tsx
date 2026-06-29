import { useState, useEffect, useContext } from 'react'
import type { ChangeEvent } from 'react'
import { UserDataContext } from '../context/userContext';
// import Alert from '../components/Alert'
import type { AlertData } from '../components/Alert';
import { BsEye,BsEyeSlash } from 'react-icons/bs';
import axios from "axios"
import { useNavigate } from 'react-router-dom';


interface AdminData {
    email: string;
    password: string;
}

interface ZodIssue {
    path: string[];
    message: string;
}

const AdminLogin = ({setAlert}:{ setAlert: React.Dispatch<React.SetStateAction<AlertData | null>> }) => {
//   const [alert, setAlert] = useState<AlertData | null>(null)
const [adminData, setAdminData] = useState<AdminData>({
    email: "",
    password: ""
})  
const [showPassword,setShowPassword]=useState<boolean>(false);
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

const navigate=useNavigate();

const context=useContext(UserDataContext);

useEffect(()=>{
   if (!context) return;  
    const { loading, user } = context;
    
    if(!loading && user.role){
        if (user.role === "admin") {
            navigate("/admin/dashboard", { replace: true })
        } else if (user.role === "sudoadmin") {
            navigate("/sudoadmin/dashboard", { replace: true })
        } else if (user.role === "user") {
            navigate("/login", { replace: true })
        }
    }
},[context, navigate])

if(!context){
    return null
}

const {setUser}=context;

const handleChange=(e:ChangeEvent<HTMLInputElement>)=>{
    setAdminData({
        ...adminData,
        [e.target.name]: e.target.value
    })

    if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: "" })
        }
}

const handleSubmit =async ()=>{
        setFieldErrors({})
    try{
        const res=await axios.post(`${import.meta.env.VITE_BACKEND_API}/login`,adminData,{
            withCredentials:true
        });
        const role = res.data.user.role;
        if (role !== "admin" && role !== "sudoadmin") {
            await axios.post(`${import.meta.env.VITE_BACKEND_API}/logout`, {}, {
                withCredentials: true
            });
            setAlert({
                type: "error",
                title: "Access Denied",
                message: "Only admin or sudoadmin can log in here. Please use the user login page."
            });
            navigate("/admin/login", { replace: true });
            return;
        }
        setUser(res.data.user);
        if (role === "admin") {
            navigate("/admin/dashboard", { replace: true })
        } else if (role === "sudoadmin") {
            navigate("/sudoadmin/dashboard", { replace: true })
        }else{
            navigate("/admin/login")
        }
        console.log(res.data.user)
    }catch(err){
             if (axios.isAxiosError(err)) {
                const data = err.response?.data

                if (data?.errors) {
                    const mapped: Record<string, string> = {}
                    data.errors.forEach((e: ZodIssue) => {
                        if (e.path?.[0]) {
                            mapped[e.path[0]] = e.message
                        }
                    })
                    setFieldErrors(mapped)

                } else if (data?.message) {
                    
                    setAlert({ type: 'error', title: 'Login failed', message: data.message })
                }

            } else {
                setAlert({ type: 'error', title: 'Login failed', message: "Login failed." })
            }
    }
}
  return (
    <>
    <div className='w-full h-screen flex items-center justify-center'>
      <div className='w-[400px] min-h-[400px] bg-gray-200 rounded-lg flex flex-col items-center p-6'>
        
        <h1 className='text-2xl font-bold'>Admin Login Page</h1>
        <div className='w-full mt-4'>
            <div className='mb-2 flex flex-col w-full'>
                <label htmlFor="email" className='block mb-2'>Email</label>
            <input
             onChange={handleChange}
             name='email'
             value={adminData.email}

            type="email" placeholder='Email' className={`${fieldErrors.email?"border border-red-400": ""} w-full p-2 rounded-md`} />
            <div className='h-4'>
            {fieldErrors.email && (
             <p className='text-red-500 text-xs mt-1'>{fieldErrors.email}</p>
            )}
            </div>
            </div>
            <div className='mb-2 flex flex-col'> 
                <label htmlFor="password" className='block mb-2'>Password</label>
                <div className='flex items-center gap-2'>
                <input
                onChange={handleChange}
                name="password"
                value={adminData.password}
                type={showPassword?"text":"password"} placeholder='Password'
                 className={`${fieldErrors.password?"border border-red-400": ""} w-full p-2 rounded-md`}/>
                 <span
                 className='flex items-center h-'
                 onClick={()=>{
                 setShowPassword(!showPassword)
                  }}>{showPassword ? <BsEye />:<BsEyeSlash />}</span>
                 
                </div>
                <div className='h-4'>
                 {fieldErrors.password && (
                <p className='text-red-500 text-xs mt-1'>{fieldErrors.password}</p>
                )}
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

export default AdminLogin