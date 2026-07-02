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
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 px-1">
        Friends
      </h3>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <p className="text-slate-400 text-sm">Loading friends...</p>
        </div>
      ) : friends.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <p className="text-slate-400 text-sm">You don't have any friends yet.</p>
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
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 px-5 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                    <img
                      src={otherUser.profile_url || skeletonProfile}
                      alt="profile"
                      className="w-10 h-10 rounded-full object-cover border border-slate-100"
                    />
                  
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {otherUser.user_name}
                    </p>
                    <p className="text-xs text-slate-400">{otherUser.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleUnfriend(otherUser.id)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 text-xs font-medium transition-all duration-150"
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