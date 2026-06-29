import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { io } from "socket.io-client"
import axios from 'axios'
import { BsArrowLeft, BsSendFill } from 'react-icons/bs'
import Navbar from '../components/Navbar'
import { UserDataContext } from '../context/userContext'

interface MessageData {
  id: number;
  sender_id: number;
  receiver_id: number;
  messages: string;
  created_at: string;
  is_read: boolean;
}

interface OtherUser {
  id: number;
  user_name: string;
  email: string;
  profile_url?: string | null;
}

const socket = io(import.meta.env.VITE_BACKEND_API, { withCredentials: true })
const getInitials = (name?: string) => name?.slice(0, 2).toUpperCase() || "?"

const HeaderAvatar = ({ user }: { user: OtherUser | null }) => {
  if (user?.profile_url) {
    return <img src={user.profile_url} alt={user.user_name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-slate-100" />
  }
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 bg-sky-100 text-sky-600">
      {getInitials(user?.user_name)}
    </div>
  )
}

const ChatPage = () => {
  const { userId } = useParams()
  const otherUserId = Number(userId)
  const navigate = useNavigate()
  const context = useContext(UserDataContext)
  const currentUserId = context?.user?.id
  const currentUser = context?.user

  const [messages, setMessages] = useState<MessageData[]>([])
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [newMessage, setNewMessage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [typing, setTyping] = useState<boolean>(false)
  const [lastReadMessageId, setLastReadMessageId] = useState<number | null>(null)

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const currentUserIdRef = useRef<number | undefined>(currentUserId)

  // Keep ref always current
  useEffect(() => {
    currentUserIdRef.current = currentUserId
  }, [currentUserId])

  // Fetch other user info
  useEffect(() => {
    if (!otherUserId) return
    axios.get(`${import.meta.env.VITE_BACKEND_API}/user/${otherUserId}`, { withCredentials: true })
      .then(res => setOtherUser(res.data.user))
      .catch(err => console.log("Error fetching user", err))
  }, [otherUserId])

  
  useEffect(() => {
    if (!otherUserId || !currentUserId) return

    setLoading(true)
    setMessages([])
    setLastReadMessageId(null)

    axios.get(`${import.meta.env.VITE_BACKEND_API}/message/${otherUserId}`, { withCredentials: true })
      .then(res => {
        const fetched: MessageData[] = res.data.data
        setMessages(fetched)

        const lastRead = [...fetched].reverse().find(
          (m) => m.sender_id === currentUserId && m.is_read === true
        )
        if (lastRead) setLastReadMessageId(lastRead.id)
      })
      .catch(err => console.log("Error fetching messages", err))
      .finally(() => setLoading(false))
  }, [otherUserId, currentUserId])  
  useEffect(() => {
    if (!otherUserId || !currentUserId) return

    axios.patch(
      `${import.meta.env.VITE_BACKEND_API}/messages/${otherUserId}/read`,
      {},
      { withCredentials: true }
    ).then(() => {
      socket.emit("messages_read", {
        readerId: currentUserId,
        senderId: otherUserId,
      })
    }).catch(err => console.log("Error marking read", err))
  }, [otherUserId, currentUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!currentUserId) return

    socket.emit("join", currentUserId)

    socket.on("receive_message", (message: MessageData) => {
      const isCurrentConversation =
        (message.sender_id === otherUserId && message.receiver_id === currentUserId) ||
        (message.sender_id === currentUserId && message.receiver_id === otherUserId)

      if (!isCurrentConversation) return

      setMessages(prev => [...prev, message])

      if (message.sender_id === otherUserId) {
        axios.patch(
          `${import.meta.env.VITE_BACKEND_API}/messages/${otherUserId}/read`,
          {},
          { withCredentials: true }
        ).then(() => {
          socket.emit("messages_read", {
            readerId: currentUserId,
            senderId: otherUserId,
          })
        }).catch(() => {})
      }
    })

    socket.on("messages_read", () => {
      const uid = currentUserIdRef.current
      if (!uid) return

      setMessages(prev => {
        const lastSent = [...prev].reverse().find(m => m.sender_id === uid)
        if (lastSent) {
          setLastReadMessageId(lastSent.id)
          return prev.map(m => m.sender_id === uid ? { ...m, is_read: true } : m)
        }
        return prev
      })
    })

    socket.on("user_typing", (data) => {
      if (data.senderId === otherUserId) setTyping(true)
    })

    socket.on("user_stop_typing", (data) => {
      if (data.senderId === otherUserId) setTyping(false)
    })

    return () => {
      socket.off("receive_message")
      socket.off("messages_read")
      socket.off("user_typing")
      socket.off("user_stop_typing")
    }
  }, [currentUserId, otherUserId])

  if (!context) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    socket.emit("typing", { senderId: currentUserId, receiverId: otherUserId })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { senderId: currentUserId, receiverId: otherUserId })
    }, 1000)
  }

  const handleSend = async () => {
    if (!newMessage.trim()) return
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/message`,
        { message: newMessage, recieverId: otherUserId },
        { withCredentials: true }
      )
      setMessages(prev => [...prev, res.data.data])
      socket.emit("send_message", {
        senderId: currentUserId,
        receiverId: otherUserId,
        message: newMessage,
      })
      setNewMessage("")
    } catch (err) {
      console.log("Error sending message", err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend()
  }

  const BubbleAvatar = () => (
    otherUser?.profile_url ? (
      <img src={otherUser.profile_url} alt={otherUser.user_name} className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-slate-100 self-end mb-1" />
    ) : (
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0 self-end mb-1 bg-sky-100 text-sky-600">
        {getInitials(otherUser?.user_name)}
      </div>
    )
  )

  const myMessages = messages.filter(m => m.sender_id === currentUserId)
  const lastSentId = myMessages.length > 0 ? myMessages[myMessages.length - 1].id : null

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col">
      <Navbar />
      <div className="max-w-[600px] w-full mx-auto pt-6 pb-8 px-4 flex flex-col flex-1">
        <div className="flex flex-col flex-1 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <button onClick={() => navigate("/messages")} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
              <BsArrowLeft size={16} />
            </button>
            <HeaderAvatar user={otherUser} />
            <div className="flex-1 min-w-0">
              <p onClick={() => navigate(`/users/${otherUserId}`)} className="text-sm font-semibold text-slate-800 truncate cursor-pointer hover:text-indigo-600 transition-colors">
                {otherUser?.user_name || "..."}
              </p>
              {typing && <p className="text-[11px] text-indigo-400 font-medium">typing...</p>}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1 min-h-[50vh] max-h-[60vh]">
            {loading ? (
              <div className="flex flex-col gap-3 mt-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"} animate-pulse`}>
                    <div className={`h-9 rounded-2xl bg-slate-100 ${i % 2 === 0 ? "w-40" : "w-52"}`} />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full pt-10 gap-2">
                <p className="text-sm font-medium text-slate-500">No messages yet</p>
                <p className="text-xs text-slate-400">Say hello to {otherUser?.user_name}!</p>
              </div>
            ) : (
              messages.map(msg => {
                const isOwn = msg.sender_id === currentUserId
                const isLastSent = isOwn && msg.id === lastSentId
                const isLastRead = isOwn && msg.id === lastReadMessageId

                return (
                  <div key={msg.id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                    <div className={`flex items-end gap-1.5 ${isOwn ? "justify-end" : "justify-start"} w-full`}>
                      {!isOwn && <BubbleAvatar />}
                      <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm ${isOwn ? "bg-indigo-500 text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm"}`}>
                        <p className="whitespace-pre-wrap break-words break-all leading-relaxed">{msg.messages}</p>
                        <span className={`block text-[10px] mt-1 ${isOwn ? "text-indigo-200" : "text-slate-400"} text-right`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    
                    {isOwn && (isLastRead || isLastSent) && (
                      <div className="flex items-center mt-0.5 mr-1 h-3.5">
                        {isLastRead
                          ? <span className="text-[10px] text-indigo-400 font-medium">Seen</span>
                          : <span className="text-[10px] text-slate-400">Sent</span>
                        }
                      </div>
                    )}
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-t border-slate-100">
            {currentUser?.profile_url ? (
              <img src={currentUser.profile_url} alt={currentUser.user_name} className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-slate-100" />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 bg-sky-100 text-sky-600">
                {getInitials(currentUser?.user_name)}
              </div>
            )}
            <input
              value={newMessage}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              type="text"
              placeholder={`Message ${otherUser?.user_name || ""}...`}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed p-2.5 text-white transition-all duration-150 flex-shrink-0"
              aria-label="Send message"
            >
              <BsSendFill size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ChatPage