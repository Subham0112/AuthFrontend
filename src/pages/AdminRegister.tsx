import { useContext, useState } from 'react'
import { BsEye, BsEyeSlash, BsPerson, BsEnvelope, BsLock } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import type { AlertData } from '../components/Alert';
import { UserDataContext } from '../context/userContext';
import AuthLayout from '../components/AuthLayout';

interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: string;
}

interface ZodIssue {
    path: string[];
    message: string;
}

const AdminRegister = ({setAlert}:{ setAlert: React.Dispatch<React.SetStateAction<AlertData | null>> }) => {
    const [adminRegisterData, setRegisterData] = useState<RegisterData>({
        name: "",
        email: "",
        password: "",
        role: "admin"
    })
    const context = useContext(UserDataContext);
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const navigate=useNavigate()

    if (!context ) return null;

    const {setUser} = context

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterData({
            ...adminRegisterData,
            [e.target.name]: e.target.value
        })
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: "" })
        }
    }

    const handleSubmit = async () => {
        setFieldErrors({})

        try {
            const res= await axios.post(`${import.meta.env.VITE_BACKEND_API}/register`, adminRegisterData,{
                withCredentials:true
            });
            setAlert({ type: 'success', title: 'Registered', message: 'Admin Registered successfully.' })
            console.log(res.data.user);
            setUser(res.data.user)
            navigate("/admin/dashboard", { replace: true })
        } catch (err) {
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
                    setAlert({ type: 'error', title: 'Register failed', message: data.message })
                }

            } else {
                setAlert({ type: 'error', title: 'Register failed', message: "Registration failed." })
            }
        }
    }

    return (
        <AuthLayout
          admin
          eyebrow="Restricted access"
          title="Request admin access"
          subtitle="Register to join the team behind the curtains."
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="label-luxe">Name</label>
              <div className={`flex items-center gap-2.5 rounded-xl border bg-ivory-100 px-3.5 py-2.5 transition-all duration-150 focus-within:bg-white focus-within:ring-[3px] ${fieldErrors.name ? 'border-clay-500 focus-within:ring-clay-100' : 'border-ivory-300 focus-within:border-sage-600 focus-within:ring-sage-200/70'}`}>
                <BsPerson className="text-ink-300 shrink-0" />
                <input
                  id="name"
                  onChange={handleChange}
                  value={adminRegisterData.name}
                  name="name"
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-transparent text-[13.5px] text-ink-900 outline-none placeholder:text-ink-300"
                />
              </div>
              {fieldErrors.name && <p className="text-xs font-medium text-clay-600">{fieldErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="label-luxe">Email</label>
              <div className={`flex items-center gap-2.5 rounded-xl border bg-ivory-100 px-3.5 py-2.5 transition-all duration-150 focus-within:bg-white focus-within:ring-[3px] ${fieldErrors.email ? 'border-clay-500 focus-within:ring-clay-100' : 'border-ivory-300 focus-within:border-sage-600 focus-within:ring-sage-200/70'}`}>
                <BsEnvelope className="text-ink-300 shrink-0" />
                <input
                  id="email"
                  onChange={handleChange}
                  value={adminRegisterData.email}
                  name="email"
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
                <BsLock className="text-ink-300 shrink-0" />
                <input
                  id="password"
                  onChange={handleChange}
                  value={adminRegisterData.password}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
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
              Request access
            </button>
          </div>

          <div className="mt-7 text-center text-[13px] text-ink-400">
            Already registered?{" "}
            <a href="/admin/login" className="font-semibold text-sage-700 transition-colors hover:text-sage-600 hover:underline">
              Sign in
            </a>
          </div>
        </AuthLayout>
    )
}

export default AdminRegister