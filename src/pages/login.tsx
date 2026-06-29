import { useState, useEffect, useContext } from 'react'
import type { ChangeEvent } from 'react'
import { UserDataContext } from '../context/userContext';
// import Alert from '../components/Alert'
import type { AlertData } from '../components/Alert';
import { BsEye, BsEyeSlash, BsEnvelope, BsLock } from 'react-icons/bs';
import axios from "axios"
import { useNavigate } from 'react-router-dom';


interface UserData {
    email: string;
    password: string;
}

interface ZodIssue {
    path: string[];
    message: string;
}

const Login = ({setAlert}:{ setAlert: React.Dispatch<React.SetStateAction<AlertData | null>> }) => {

const [usersData, setUsersData] = useState<UserData>({
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
        if (user.role === "user") {
            navigate("/dashboard", { replace: true })
        } else if (user.role === "admin") {
            navigate("/admin/dashboard", { replace: true })
        } else if (user.role === "sudoadmin") {
            navigate("/sudoadmin/dashboard", { replace: true })
        }
    }
},[context, navigate])

if(!context){
    return null
}


const handleChange=(e:ChangeEvent<HTMLInputElement>)=>{
    setUsersData({
        ...usersData,
        [e.target.name]: e.target.value
    })

    if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: "" })
        }
}

const handleSubmit =async ()=>{
        setFieldErrors({})
    try{
        const res=await axios.post(`${import.meta.env.VITE_BACKEND_API}/login`,usersData,{
            withCredentials:true
        });
        const role = res.data.user.role;
        if (role !== "user") {
            await axios.post(`${import.meta.env.VITE_BACKEND_API}/logout`, {}, {
                withCredentials: true
            });
            setAlert({
                type: 'error',
                title: 'Invalid Credentials',
                message: 'Please Enter Correct Email and Password'
            });
            navigate("/login", { replace: true });
            return;
        }
        await context?.refreshUser();
        console.log("logged in successfully");
        navigate("/dashboard", { replace: true });
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
    <div className='min-h-screen bg-gradient-to-br from-slate-200  to-blue-250 flex items-center justify-center px-4 py-10'>
      <div className='w-full max-w-sm bg-white border border-slate-100 shadow-xl shadow-slate-200/60 rounded-2xl p-8 sm:p-9'>

        <div className='mb-8 text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white font-semibold text-lg'>
            M
          </div>
          <h1 className='text-xl font-semibold text-slate-900'>Welcome back</h1>
          <p className='mt-1 text-sm text-slate-500'>Log in to MySocialApp to continue</p>
        </div>

        <div className='space-y-4'>
          <div className='space-y-1.5'>
            <label htmlFor="email" className='block text-sm font-medium text-slate-700'>Email</label>
            <div className={`flex items-center gap-2 rounded-xl border bg-slate-50 px-3.5 py-2.5 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 ${fieldErrors.email ? 'border-red-300' : 'border-slate-200 focus-within:border-blue-400'}`}>
              <BsEnvelope className='text-slate-400 shrink-0' />
              <input
                id="email"
                onChange={handleChange}
                name='email'
                value={usersData.email}
                type="email"
                placeholder='you@example.com'
                className='w-full bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400'
              />
            </div>
            {fieldErrors.email && (
              <p className='text-red-500 text-xs'>{fieldErrors.email}</p>
            )}
          </div>

          <div className='space-y-1.5'>
            <label htmlFor="password" className='block text-sm font-medium text-slate-700'>Password</label>
            <div className={`flex items-center gap-2 rounded-xl border bg-slate-50 px-3.5 py-2.5 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 ${fieldErrors.password ? 'border-red-300' : 'border-slate-200 focus-within:border-blue-400'}`}>
              <BsLock className='text-slate-400 shrink-0' />
              <input
                id="password"
                onChange={handleChange}
                name="password"
                value={usersData.password}
                type={showPassword ? "text" : "password"}
                placeholder='••••••••'
                className='w-full bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='text-slate-400 hover:text-slate-700 transition focus:outline-none shrink-0'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <BsEye /> : <BsEyeSlash />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className='text-red-500 text-xs'>{fieldErrors.password}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className='w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800'>
            Log in
          </button>
        </div>

        <div className='mt-6 flex items-center gap-3 text-xs text-slate-400'>
          <div className='h-px flex-1 bg-slate-100' />
          <span>or</span>
          <div className='h-px flex-1 bg-slate-100' />
        </div>

        <div className='mt-6 text-center text-sm text-slate-500'>
          <p>Don't have an account? <a href="/register" className='font-medium text-blue-600 hover:text-blue-700'>Register</a></p>
          <p className='mt-2'><a href="/forgot-password" className='text-slate-500 hover:text-slate-700'>Forgot password?</a></p>
        </div>
      </div>
    </div>
  )
}

export default Login