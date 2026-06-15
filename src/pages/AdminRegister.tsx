import { useContext, useState } from 'react'
import { BsEye, BsEyeSlash } from 'react-icons/bs';
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
            const res= await axios.post("http://localhost:3000/register", adminRegisterData,{
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
        <div>
            <div className='w-full h-screen flex items-center justify-center'>
                <div className='w-[450px] min-h-[400px] bg-gray-200 rounded-lg flex flex-col items-center p-6'>
                    <h1 className='text-2xl font-bold'>Admin Register Page</h1>
                    <div className="w-full mt-4">

                       
                        <div className='mb-2 flex flex-col w-full'>
                            <label htmlFor="name" className="block mb-2">Name</label>
                            <input
                                onChange={handleChange}
                                value={adminRegisterData.name}
                                name='name'
                                type="text"
                                placeholder='Enter Name'
                                className={`${fieldErrors.name?"border border-red-400": ""} w-full p-2 rounded-md`}
                            />
                            <div className='h-4'>
                            {fieldErrors.name && (
                                <p className='text-red-500 text-xs mt-1'>{fieldErrors.name}</p>
                            )}
                            </div>
                        </div>

                        {/* Email */}
                        <div className='mb-2 flex flex-col w-full'>
                            <label htmlFor="email" className="block mb-2">Email</label>
                            <input
                                onChange={handleChange}
                                value={adminRegisterData.email}
                                name='email'
                                type="email"
                                placeholder='Enter Email'
                                className={`${fieldErrors.email?"border border-red-400": ""} w-full p-2 rounded-md`}
                            />
                            <div className='h-4'>
                            {fieldErrors.email && (
                                <p className='text-red-500 text-xs mt-1'>{fieldErrors.email}</p>
                            )}
                            </div>
                        </div>

                        {/* Password */}
                        <div className='mb-2 flex flex-col w-full'>
                            <label htmlFor="password" className="block mb-2">Password</label>
                            <div className="flex items-center gap-2">
                                <input
                                    onChange={handleChange}
                                    value={adminRegisterData.password}
                                    name='password'
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter Password"
                                    className={`${fieldErrors.password?"border border-red-400": ""} w-full p-2 rounded-md`}
                                />
                                <span onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <BsEye /> : <BsEyeSlash />}
                                </span>
                            </div>
                            <div className='h-4'>
                            {fieldErrors.password && (
                                <p className='text-red-500 text-xs mt-1'>{fieldErrors.password}</p>
                            )}
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className='w-full bg-blue-500 text-white p-2 rounded-md'>
                            Register
                        </button>
                    </div>

                    <div className='w-full mt-8 text-center'>
                        <p>Already have an Account? <a href='/admin/login' className='text-blue-500'>Login</a></p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminRegister