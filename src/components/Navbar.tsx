import React, { useContext, useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { UserDataContext } from "../context/userContext"
import { HiHome, HiOutlineHome } from "react-icons/hi"
import { IoChatbubbleOutline, IoChatbubble } from "react-icons/io5"
import { HiUserGroup, HiOutlineUserGroup } from "react-icons/hi"
import RequestModal from "./RequestModal"

import { HiOutlineLogout } from "react-icons/hi"
import skeletonProfile from "../assets/img/skeleton_profile.jpg"
import { io } from "socket.io-client"

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const context = useContext(UserDataContext)
  const [loggingOut, setLoggingOut] = useState(false)
  const [totalUnread, setTotalUnread] = useState(0)
  const [showRequestModal, setShowRequestModal] = useState(false)
const [pendingRequestCount, setPendingRequestCount] = useState(0)


useEffect(() => {
  if (!context?.user?.id) return

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API}/friend-request`,
        { withCredentials: true }
      )
      setPendingRequestCount(res.data.friendRequest?.length ?? 0)
    } catch (err) {
      console.log("Error fetching pending requests", err)
    }
  }
  fetchPendingRequests()
}, [context?.user?.id])
  
 useEffect(() => {
  if (!context?.user?.id) return


  const fetchUnread = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_API}/total-unread`, {
        withCredentials: true,
      })
      setTotalUnread(res.data.count)
    } catch (err) {
      console.log("Error fetching unread count", err)
    }
  }
  fetchUnread()

  const socket = io(import.meta.env.VITE_BACKEND_API, { withCredentials: true })
  socket.emit("join", user.id)

  socket.on("receive_message", () => {
    if (!location.pathname.startsWith("/messages")) {
      setTotalUnread((n) => n + 1)
    }
  })

  return () => {
    socket.disconnect()
  }
}, [context?.user?.id])

  useEffect(() => {
    if (location.pathname.startsWith("/messages")) {
      setTotalUnread(0)
    }
  }, [location.pathname])

  if (!context) return null
  const { setUser, user } = context

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/logout`,
        {},
        { withCredentials: true }
      )
      console.log(res.data.message)
      setUser({ id: 0, email: "", role: null, user_name: "", profile_url: null })
      navigate("/login")
    } catch (err) {
      console.error("Error logging out", err)
    } finally {
      setLoggingOut(false)
    }
  }

  const isActive = (path: string) => location.pathname === path



  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)]">
      <div className="max-w-6xl mx-auto pl-6 pr-4 h-[60px] flex items-center justify-between">

        {/* Logo */}
        <div
          onClick={() => navigate("/homepage")}
          className="cursor-pointer flex items-center gap-2 select-none"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <span className="text-slate-800 font-bold text-lg tracking-tight">MySocial</span>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          <NavButton
            onClick={() => navigate("/homepage")}
            active={isActive("/homepage")}
            icon={isActive("/homepage") ? <HiHome size={22} /> : <HiOutlineHome size={22} />}
            label="Home"
          />

          {/* Messages button with badge */}
          <div className="relative">
            <NavButton
              onClick={() => navigate("/messages")}
              active={location.pathname.startsWith("/messages")}
              icon={location.pathname.startsWith("/messages") ? <IoChatbubble size={20} /> : <IoChatbubbleOutline size={20} />}
              label="Messages"
            />
            {totalUnread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center pointer-events-none">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </div>

     

        </div>

        {/* Avatar + Logout */}
        <div className="flex items-center gap-3">
          
          <div
            onClick={() => navigate("/dashboard")}
            className="flex flex-col items-center gap-0.5 px-4  rounded-xl transition-all duration-150 group text-slate-400 hover:text-slate-700 hover:bg-slate-50 "
          >
              <img
                src={user.profile_url || skeletonProfile}
                alt={user.user_name}
                className="w-9 h-9 rounded-full object-cover"
              />
              <span className={`text-[10px] font-medium tracking-wide "text-slate-400 group-hover:text-slate-600"`}>Profile</span>
           
          </div>
                 <div className="relative">
          <NavButton
           onClick={() => setShowRequestModal(!showRequestModal)}
           active={showRequestModal}
           icon={showRequestModal ? <HiUserGroup size={20} /> : <HiOutlineUserGroup size={20} />}
           label="Requests"
         />
        {pendingRequestCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center pointer-events-none">
      {pendingRequestCount > 99 ? "99+" : pendingRequestCount}
        </span>
       )}
       </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 text-sm font-medium transition-all duration-150"
          >
            <HiOutlineLogout size={17} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
      {showRequestModal && (
  <RequestModal onClose={() => setShowRequestModal(false)} />
)}
    </nav>
  )
}

const NavButton = ({
  onClick,
  active,
  icon,
  label,
}: {
  onClick: () => void
  active: boolean
  icon: React.ReactNode
  label: string
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-150 group
      ${active
        ? "text-indigo-600 bg-indigo-50"
        : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
      }`}
  >
    {icon}
    <span className={`text-[10px] font-medium tracking-wide ${active ? "text-indigo-500" : "text-slate-400 group-hover:text-slate-600"}`}>
      {label}
    </span>
  </button>
)

export default Navbar