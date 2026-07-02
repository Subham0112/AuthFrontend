import React, { useState, useEffect } from "react"
import skeletonProfile from "../assets/img/skeleton_profile.jpg"

import api from "../lib/axiosInstance"
import { FaCheck } from "react-icons/fa"
import { ImCross } from "react-icons/im"

interface senderUser {
  id: number
  user_name: string
  profile_url?: string | null
}
interface FriendRequestData {
  id: number
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
    return <p className="text-slate-400 text-sm text-center py-6">Loading friend requests...</p>
  }

  if (friendRequests.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-6">No friend requests.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {friendRequests.map((request) => (
        <div
          key={request.id}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all"
        >
          <img
            src={request.req_sender.profile_url || skeletonProfile}
            alt={request.req_sender.user_name}
            className="w-11 h-11 rounded-full object-cover flex-shrink-0"
          />
          <span className="flex-1 text-sm font-semibold text-slate-800 truncate">
            {request.req_sender.user_name}
          </span>
          <button
            onClick={() => handleAccept(request.sender_id)}
            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all"
          >
            <FaCheck size={13} />
          </button>
          <button
            onClick={() => handleReject(request.sender_id)}
            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
          >
            <ImCross size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}

export default FriendRequest