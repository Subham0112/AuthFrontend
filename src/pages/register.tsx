import { useState, useContext } from 'react'
import { BsEye, BsEyeSlash, BsPerson, BsEnvelope, BsLock } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
// import Alert from '../components/Alert'
import type { AlertData } from '../components/Alert';
import { UserDataContext } from '../context/userContext';

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

const Register = ({setAlert}:{ setAlert: React.Dispatch<React.SetStateAction<AlertData | null>> }) => {

    const [userRegisterData, setRegisterData] = useState<RegisterData>({
        name: "",
        email: "",
        password: "",
        role: "user"
    })
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const navigate=useNavigate()
    const context =useContext(UserDataContext)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterData({
            ...userRegisterData,
            [e.target.name]: e.target.value
        })
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: "" })
        }
    }
    if(!context) return null

    const {setUser}=context;

    const handleSubmit = async () => {
        setFieldErrors({})

        try {
            const res= await axios.post(`${import.meta.env.VITE_BACKEND_API}/register`, userRegisterData,{
                withCredentials:true
            });
            setAlert({ type: 'success', title: 'Registered', message: 'Your account was created successfully.' })
            console.log(res.data.user);
            setUser(res.data.user)
            navigate("/dashboard")
            setRegisterData({ name: "", email: "", password: "", role: "user" })

        } catch (err) {
            if (axios.isAxiosError(err)) {
                const data = err.response?.data

                if (data?.errors) {
                    // Zod field errors — map array to { fieldName: message }
                    const mapped: Record<string, string> = {}
                    data.errors.forEach((e: ZodIssue) => {
                        if (e.path?.[0]) {
                            mapped[e.path[0]] = e.message
                        }
                    })
                    setFieldErrors(mapped)

                } else if (data?.message) {
                    // General error like "User already exists"
                    setAlert({ type: 'error', title: 'Register failed', message: data.message })
                }

            } else {
                setAlert({ type: 'error', title: 'Register failed', message: "Registration failed." })
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
                    <h1 className='text-xl font-semibold text-slate-900'>Create your account</h1>
                    <p className='mt-1 text-sm text-slate-500'>Join MySocialApp in a few seconds</p>
                </div>

                <div className='space-y-4'>
                    <div className='space-y-1.5'>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
                        <div className={`flex items-center gap-2 rounded-xl border bg-slate-50 px-3.5 py-2.5 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 ${fieldErrors.name ? 'border-red-300' : 'border-slate-200 focus-within:border-blue-400'}`}>
                            <BsPerson className='text-slate-400 shrink-0' />
                            <input
                                id="name"
                                onChange={handleChange}
                                value={userRegisterData.name}
                                name='name'
                                type="text"
                                placeholder='Your name'
                                className='w-full bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400'
                            />
                        </div>
                        {fieldErrors.name && (
                            <p className='text-red-500 text-xs'>{fieldErrors.name}</p>
                        )}
                    </div>

                    <div className='space-y-1.5'>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                        <div className={`flex items-center gap-2 rounded-xl border bg-slate-50 px-3.5 py-2.5 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 ${fieldErrors.email ? 'border-red-300' : 'border-slate-200 focus-within:border-blue-400'}`}>
                            <BsEnvelope className='text-slate-400 shrink-0' />
                            <input
                                id="email"
                                onChange={handleChange}
                                value={userRegisterData.email}
                                name='email'
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
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                        <div className={`flex items-center gap-2 rounded-xl border bg-slate-50 px-3.5 py-2.5 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 ${fieldErrors.password ? 'border-red-300' : 'border-slate-200 focus-within:border-blue-400'}`}>
                            <BsLock className='text-slate-400 shrink-0' />
                            <input
                                id="password"
                                onChange={handleChange}
                                value={userRegisterData.password}
                                name='password'
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
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
                        Create account
                    </button>
                </div>

                <div className='mt-6 text-center text-sm text-slate-500'>
                    Already have an account? <a href='/login' className='font-medium text-blue-600 hover:text-blue-700'>Login</a>
                </div>
            </div>
        </div>
    )
}

export default Register