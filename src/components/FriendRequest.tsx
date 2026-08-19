import { useState, useEffect } from "react"
import skeletonProfile from "../assets/img/skeleton_profile.jpg"

import api from "../lib/axiosInstance"
import { getSocket } from "../lib/socket"
import { FaCheck } from "react-icons/fa"
import { ImCross } from "react-icons/im"

interface senderUser {
  id: number
  user_name: string
  profile_url?: string | null
}
interface FriendRequestData {
  friends_id: number
  sender_id: number
  receiver_id: number
  friend_status: string
  req_sender: senderUser
}

const FriendRequest = ({ showRequest }: { showRequest: boolean }) => {
  const [friendRequests, setFriendRequests] = useState<FriendRequestData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchFriendRequests = async () => {
      setLoading(true)
      try {
        const res = await api.get(
          `/friend-request`
        )
        if (res.status === 200) {
          setFriendRequests(res.data.friendRequest)
        }
      } catch (error) {
        console.error("Error fetching friend requests:", error)
      } finally {
        setLoading(false)
      }
    }
    if (showRequest) {
      fetchFriendRequests()
    }
  }, [showRequest])

  // Realtime: a new request arrives → prepend it instantly (no refresh)
  useEffect(() => {
    const socket = getSocket()
    if (!socket || !showRequest) return

    const onReceived = (data: FriendRequestData) => {
      setFriendRequests((prev) => {
        if (prev.some((r) => r.sender_id === data.sender_id)) return prev
        return [data, ...prev]
      })
    }
    const onCancelled = (data: { sender_id: number }) => {
      setFriendRequests((prev) =>
        prev.filter((r) => r.sender_id !== data.sender_id)
      )
    }

    socket.on("friend_request_received", onReceived)
    socket.on("friend_request_cancelled", onCancelled)
    return () => {
      socket.off("friend_request_received", onReceived)
      socket.off("friend_request_cancelled", onCancelled)
    }
  }, [showRequest])

  const handleAccept = async (senderId: number) => {
    try {
      await api.patch(
        `/accept-request/${senderId}`,
        {}
      )
      setFriendRequests((prev) => prev.filter((r) => r.sender_id !== senderId))
    } catch (error) {
      console.error("Error accepting friend request:", error)
    }
  }

  const handleReject = async (senderId: number) => {
    try {
      await api.delete(
        `/delete-request/${senderId}`
      )
      setFriendRequests((prev) => prev.filter((r) => r.sender_id !== senderId))
    } catch (error) {
      console.error("Error rejecting friend request:", error)
    }
  }

  if (loading) {
    return <p className="text-ink-400 text-sm text-center py-6">Loading friend requests…</p>
  }

  if (friendRequests.length === 0) {
    return <p className="text-ink-400 text-sm text-center py-6">No friend requests.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {friendRequests.map((request) => (
        <div
          key={request.friends_id}
          className="flex items-center gap-3 rounded-xl p-3 transition-all duration-150 hover:bg-ivory-100"
        >
          <img
            src={request.req_sender.profile_url || skeletonProfile}
            alt={request.req_sender.user_name}
            className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-ivory-400"
          />
          <span className="flex-1 truncate text-sm font-semibold text-ink-800">
            {request.req_sender.user_name}
          </span>
          <button
            onClick={() => handleAccept(request.sender_id)}
            aria-label={`Accept ${request.req_sender.user_name}'s request`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-sage-700 transition-all duration-150 hover:bg-sage-700 hover:text-white"
          >
            <FaCheck size={12} />
          </button>
          <button
            onClick={() => handleReject(request.sender_id)}
            aria-label={`Reject ${request.req_sender.user_name}'s request`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-clay-100 text-clay-600 transition-all duration-150 hover:bg-clay-600 hover:text-white"
          >
            <ImCross size={11} />
          </button>
        </div>
      ))}
    </div>
  )
}

export default FriendRequest