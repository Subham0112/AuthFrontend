import { useState, useEffect } from "react"
import skeletonProfile from "../assets/img/skeleton_profile.jpg"
import api from "../lib/axiosInstance"
import { getSocket } from "../lib/socket"
import { BsFillPersonXFill } from "react-icons/bs"

interface receiverUser {
  id: number
  user_name: string
  profile_url?: string | null
}
interface SentRequest {
  id: number
  sender_id: number
  receiver_id: number
  friend_status: string
  req_receiver: receiverUser
}

const SentRequestList = ({ showSentRequests }: { showSentRequests: boolean }) => {
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSentRequests = async () => {
      setLoading(true)
      try {
        const res = await api.get(
          `/sent-request`
        )
        if (res.status === 200) {
          setSentRequests(res.data.sentRequest)
        }
      } catch (error) {
        console.error("Error fetching sent requests:", error)
      } finally {
        setLoading(false)
      }
    }
    if (showSentRequests) {
      fetchSentRequests()
    }
  }, [showSentRequests])

  // Realtime: the other person accepted or rejected → drop it from the
  // sent list instantly (no manual refresh)
  useEffect(() => {
    const socket = getSocket()
    if (!socket || !showSentRequests) return

    const removeRequest = (data: { sender_id: number; receiver_id: number }) => {
      setSentRequests((prev) =>
        prev.filter(
          (r) => !(r.sender_id === data.sender_id && r.receiver_id === data.receiver_id)
        )
      )
    }
    const onAccepted = removeRequest
    const onRejected = removeRequest

    socket.on("friend_request_accepted", onAccepted)
    socket.on("friend_request_rejected", onRejected)
    return () => {
      socket.off("friend_request_accepted", onAccepted)
      socket.off("friend_request_rejected", onRejected)
    }
  }, [showSentRequests])

  const handleCancel = async (receiverId: number) => {
    try {
      await api.delete(
        `/request-cancel/${receiverId}`
      )
      setSentRequests((prev) => prev.filter((r) => r.receiver_id !== receiverId))
    } catch (error) {
      console.error("Error canceling sent request:", error)
    }
  }

  if (loading) {
    return <p className="text-ink-400 text-sm text-center py-6">Loading sent requests…</p>
  }

  if (sentRequests.length === 0) {
    return <p className="text-ink-400 text-sm text-center py-6">No sent requests.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {sentRequests.map((request) => (
        <div
          key={request.id}
          className="flex items-center gap-3 rounded-xl p-3 transition-all duration-150 hover:bg-ivory-100"
        >
          <img
            src={request.req_receiver?.profile_url || skeletonProfile}
            alt={request.req_receiver?.user_name}
            className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-ivory-400"
          />
          <span className="flex-1 truncate text-sm font-semibold text-ink-800">
            {request.req_receiver?.user_name}
          </span>
          <button
            onClick={() => handleCancel(request.receiver_id)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-400 transition-all duration-150 hover:bg-clay-100 hover:text-clay-600"
          >
            <BsFillPersonXFill size={13} />
            Cancel
          </button>
        </div>
      ))}
    </div>
  )
}

export default SentRequestList