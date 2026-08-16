import { useState, useEffect, useContext } from 'react'
import type { ChangeEvent } from 'react'
import { UserDataContext } from '../context/userContext';
import type { AlertData } from '../components/Alert';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import axios from "axios"
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';


interface AdminData {
    email: string;
    password: string;
}

interface ZodIssue {
    path: string[];
    message: string;
}

const AdminLogin = ({setAlert}:{ setAlert: React.Dispatch<React.SetStateAction<AlertData | null>> }) => {
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
    <AuthLayout
      admin
      eyebrow="Restricted access"
      title="Admin sign in"
      subtitle="A quiet gate for the people who keep ConnectHub safe."
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="label-luxe">Email</label>
          <div className={`flex items-center gap-2.5 rounded-xl border bg-ivory-100 px-3.5 py-2.5 transition-all duration-150 focus-within:bg-white focus-within:ring-[3px] ${fieldErrors.email ? 'border-clay-500 focus-within:ring-clay-100' : 'border-ivory-300 focus-within:border-sage-600 focus-within:ring-sage-200/70'}`}>
            <input
              id="email"
              onChange={handleChange}
              name="email"
              value={adminData.email}
              type="email"
              placeholder="admin@connecthub.app"
              className="w-full bg-transparent text-[13.5px] text-ink-900 outline-none placeholder:text-ink-300"
            />
          </div>
          {fieldErrors.email && <p className="text-xs font-medium text-clay-600">{fieldErrors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="label-luxe">Password</label>
          <div className={`flex items-center gap-2.5 rounded-xl border bg-ivory-100 px-3.5 py-2.5 transition-all duration-150 focus-within:bg-white focus-within:ring-[3px] ${fieldErrors.password ? 'border-clay-500 focus-within:ring-clay-100' : 'border-ivory-300 focus-within:border-sage-600 focus-within:ring-sage-200/70'}`}>
            <input
              id="password"
              onChange={handleChange}
              name="password"
              value={adminData.password}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full bg-transparent text-[13.5px] text-ink-900 outline-none placeholder:text-ink-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-ink-300 transition-colors hover:text-ink-800 focus:outline-none shrink-0"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <BsEye /> : <BsEyeSlash />}
            </button>
          </div>
          {fieldErrors.password && <p className="text-xs font-medium text-clay-600">{fieldErrors.password}</p>}
        </div>

        <button onClick={handleSubmit} className="btn-primary w-full py-3 text-[13.5px]">
          Sign in to console
        </button>
      </div>

      <div className="mt-7 text-center text-[13px] text-ink-400">
        New to the console?{" "}
        <a href="/admin/register" className="font-semibold text-sage-700 transition-colors hover:text-sage-600 hover:underline">
          Request access
        </a>
      </div>
    </AuthLayout>
  )
}

export default AdminLogin