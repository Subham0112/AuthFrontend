import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserDataContext } from "../context/userContext";
import skeletonProfile from "../assets/img/skeleton_profile.jpg";
import type {AlertData} from "./Alert";
import api from "../lib/axiosInstance";

interface FriendUser {
  id: number;
  user_name: string;
  email: string;
  profile_url?: string | null;
}

interface FriendRecord {
  friends_id: number;
  sender_id: number;
  receiver_id: number;
  friend_status: string;
  req_sender: FriendUser;
  req_receiver: FriendUser;
}

// Shared type-scale helper for the display face used on names/titles.
const serif = { fontFamily: "'Fraunces', 'Iowan Old Style', Georgia, serif" };

const FriendList = ({ showFriend, setAlert }: { showFriend: boolean; setAlert: React.Dispatch<React.SetStateAction<AlertData|null>> }) => {
  const [friends, setFriends] = useState<FriendRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const context = useContext(UserDataContext);

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/allFriends`
        );
        if (res.status === 200) {
          setFriends(res.data.friends);
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setLoading(false);
      }
    };

    if (showFriend) {
      fetchFriends();
    }
  }, [showFriend]);

  if (!context) return null;
  const { user } = context;

  const handleUnfriend = async (friendId: number) => {
    try {
      await api.delete(
        `/unfriend/${friendId}`
      );
      setFriends((prev) =>
        prev.filter((f) => {
          const otherUser =
            f.sender_id === user.id ? f.req_receiver : f.req_sender;
          return otherUser.id !== friendId;
        })
      );
    } catch (error) {
      if(axios.isAxiosError(error) ) {
        const data = error.response?.data;
        if (data?.message) {
          setAlert({ type: "error", title: "Error", message: data.message });
          return;
        }
      }
     setAlert({ type: "error", title: "Error", message: "Could not unfriend user" });
    }
  };

  return (
    <div>
      <h3 className="text-[11px] font-semibold text-[#9C978A] uppercase tracking-widest mb-4 px-1">
        Friends
      </h3>

      {loading ? (
        <div className="bg-white rounded-[16px] border border-[#E7E3DA] p-12 text-center">
          <p className="text-[#9C978A] text-sm">Loading friends...</p>
        </div>
      ) : friends.length === 0 ? (
        <div className="bg-white rounded-[16px] border border-[#E7E3DA] p-12 text-center">
          <p style={serif} className="text-lg italic text-[#6B675C]">No friends yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {friends.map((record) => {
            const otherUser =
              record.sender_id === user.id
                ? record.req_receiver
                : record.req_sender;

            return (
              <div
                key={record.friends_id}
                className="bg-white rounded-[14px] border border-[#E7E3DA] hover:border-[#DBD6CA] shadow-[0_1px_2px_rgba(38,36,32,0.03)] hover:shadow-[0_4px_16px_rgba(38,36,32,0.06)] transition-all duration-300 px-5 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                    <img
                      src={otherUser.profile_url || skeletonProfile}
                      alt="profile"
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-[#E7E3DA]"
                    />
                  
                  <div>
                    <p style={serif} className="text-[14.5px] font-medium text-[#26241F]">
                      {otherUser.user_name}
                    </p>
                    <p className="text-[12px] text-[#9C978A]">{otherUser.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleUnfriend(otherUser.id)}
                  className="px-3 py-1.5 rounded-lg text-[#9C978A] hover:text-[#7B3F3F] hover:bg-[#F7EEEC] text-[12px] font-medium transition-colors duration-150"
                >
                  Unfriend
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FriendList;