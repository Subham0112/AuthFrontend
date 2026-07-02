import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../lib/axiosInstance'
import { io } from "socket.io-client"
import type { AlertData } from '../components/Alert'
import Navbar from '../components/Navbar'
import { UserDataContext } from '../context/userContext'

interface ConversationData {
  userId: number;
  name: string;
  lastMessage: string;
  lastMessageAt: string;
  profile_url?: string | null;
  unreadCount: number;
}

const getInitials = (name: string) => name?.slice(0, 2).toUpperCase() || "?"

const getAvatarColor = (name?: string) => {
  const colors = [
    "bg-violet-100 text-violet-600",
    "bg-sky-100 text-sky-600",
    "bg-emerald-100 text-emerald-600",
    "bg-rose-100 text-rose-600",
    "bg-amber-100 text-amber-600",
    "bg-indigo-100 text-indigo-600",
  ]
  if (!name) return colors[0]
  return colors[name.charCodeAt(0) % colors.length]
}

const ConvAvatar = ({ name, profileUrl }: { name: string; profileUrl?: string | null }) => {
  if (profileUrl) {
    return (
      <img
        src={profileUrl}
        alt={name}
        className="w-11 h-11 shrink-0 rounded-full object-cover border border-slate-100"
      />
    )
  }
  return (
    <div className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold ${getAvatarColor(name)}`}>
      {getInitials(name)}
    </div>
  )
}

const Messages = ({ setAlert }: { setAlert: React.Dispatch<React.SetStateAction<AlertData | null>> }) => {
  const [conversations, setConversations] = useState<ConversationData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const navigate = useNavigate()
  const location = useLocation()
  const context = useContext(UserDataContext)
  const currentUserId = context?.user?.id

  const fetchConversations = async () => {
    try {
      const res = await api.get(`/get-conversation`)
      setConversations(res.data.data)
    } catch (err) {
      console.log("Error fetching conversations", err)
      setAlert({ type: 'error', title: 'Failed to load messages', message: 'Could not fetch your conversations.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  
  useEffect(() => {
    const match = location.state?.clearedUserId
    if (match) {
      setConversations((prev) =>
        prev.map((c) => c.userId === match ? { ...c, unreadCount: 0 } : c)
      )
    }
  }, [location.state])

  useEffect(() => {
    if (!currentUserId) return

    const socket = io(import.meta.env.VITE_BACKEND_API, { withCredentials: true })
    socket.emit("join", currentUserId)

    socket.on("receive_message", (message) => {
      if (message.sender_id === currentUserId) return

      setConversations((prev) => {
        const exists = prev.find((c) => c.userId === message.sender_id)

        if (exists) {
          const updated = prev.map((c) =>
            c.userId === message.sender_id
              ? {
                  ...c,
                  lastMessage: message.messages,
                  lastMessageAt: message.created_at,
                  unreadCount: c.unreadCount + 1,
                }
              : c
          )
          return [
            updated.find((c) => c.userId === message.sender_id)!,
            ...updated.filter((c) => c.userId !== message.sender_id),
          ]
        }

        
        fetchConversations()
        return prev
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [currentUserId])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    return isToday
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  const handleOpenChat = (userId: number) => {
    setConversations((prev) =>
      prev.map((c) => c.userId === userId ? { ...c, unreadCount: 0 } : c)
    )
    navigate(`/messages/${userId}`)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar />

      <div className="max-w-[600px] mx-auto pt-8 pb-16 px-4">
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">

          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100">
            <h1 className="text-base font-semibold text-slate-800">Messages</h1>
            <p className="text-xs text-slate-400 mt-0.5">Your recent conversations</p>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3 px-6 py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-11 h-11 rounded-full bg-slate-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded-full w-1/3" />
                    <div className="h-3 bg-slate-100 rounded-full w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-medium text-slate-600">No conversations yet</p>
              <p className="text-xs text-slate-400 mt-1">Visit someone's profile to start a chat</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {conversations.map((conv) => (
                <div
                  key={conv.userId}
                  onClick={() => handleOpenChat(conv.userId)}
                  className={`flex items-center gap-3.5 px-6 py-4 cursor-pointer transition-colors duration-150 ${
                    conv.unreadCount > 0
                      ? "bg-indigo-50/60 hover:bg-indigo-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <ConvAvatar name={conv.name} profileUrl={conv.profile_url} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`text-sm truncate ${conv.unreadCount > 0 ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                        {conv.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {conv.unreadCount > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-medium">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                    </div>
                    <p className={`text-xs truncate leading-relaxed ${conv.unreadCount > 0 ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Messages