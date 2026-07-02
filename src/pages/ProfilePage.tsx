import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaRegThumbsUp, FaThumbsUp, FaRegComment,FaCheck } from "react-icons/fa";
import { BsChatDots,BsFillPersonCheckFill,BsFillPersonXFill } from "react-icons/bs";
import { ImCross } from "react-icons/im";
import api from "../lib/axiosInstance";
import axios from "axios";
import CommentModal from "../components/CommentModal";
import LikeModal from "../components/LikeModal";
import type { AlertData } from "../components/Alert";
import Navbar from "../components/Navbar";
import { BsGlobe, BsLock, BsPersonFillAdd } from "react-icons/bs";
import { UserDataContext } from "../context/userContext";
import skeletonProfile from "../assets/img/skeleton_profile.jpg";

interface Media {
  media_id: number;
  post_id: number;
  user_id: number;
  filename: string;
  file_url: string;
}

interface UserData {
  id: number;
  user_name: string;
  email: string;
  profile_url?: string | null; 
}

export interface PostData {
  id: number;
  user_id: number;
  content: string;
  visiblity: string;
  media?: Media[];
  users?: UserData;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
}



const ProfilePage = ({
  setAlert,
}: {
  setAlert: React.Dispatch<React.SetStateAction<AlertData | null>>;
}) => {
  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [profileUser, setProfileUser] = useState<UserData | null>(null);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likesPostId, setLikesPostId] = useState<number | null>(null);
  const [friendStatus, setFriendStatus] = useState<string>("none");

  const navigate = useNavigate();
  const context = useContext(UserDataContext);
  const { otherUserId } = useParams();
  const user_id = Number(otherUserId);

  const isOwnProfile = context?.user?.id === user_id;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(
          `/user/${user_id}`
        );
        setProfileUser(res.data.user);
      } catch (err) {
        console.log("Error fetching user", err);
      }
    };
    const fetchUserPosts = async () => {
      try {
        const res = await api.get(
          `/get-post/${user_id}`
        );
        setPosts(res.data.posts);
      } catch (err) {
        console.log("Error fetching posts", err);
      }
    };
    const fetchUserFriedsStatus= async () => {
      try {
        const res = await api.get(
          `/friend-status/${user_id}`
        );
        setFriendStatus(res.data.status);
        console.log(friendStatus);
      } catch (err) {
        console.log("Error fetching friend status", err);
      }
    }
    if (otherUserId) {
      fetchUser();
      fetchUserPosts();
      fetchUserFriedsStatus();
    }
  }, [otherUserId]);

  const handleLikeToggle = async (postId: number) => {
    try {
      const res = await api.post(
        `/toggle-like/${postId}`,
        {}
      );
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          const currentCount = post.likeCount ?? 0;
          return {
            ...post,
            likedByCurrentUser: res.data.liked,
            likeCount: res.data.liked ? currentCount + 1 : currentCount - 1,
          };
        })
      );
    } catch (err) {
      console.log("Error toggling like", err);
    }
  };

  const totalLikes = posts.reduce((sum, post) => sum + post.likeCount, 0);


  const handleAddClick = async (otherUserId: number) => {
    try {
      const res = await api.post(
        `/add-friend/${otherUserId}`,
        {}
      );
      if (res.status === 200) {
        setFriendStatus("pending_sent");
        setAlert({
          type: "success",
          title:"Request Sent",
          message: res.data.message || "Friend request sent successfully.",
        });
      }
    } catch (err) {
      if(axios.isAxiosError(err)){
        const data = err.response?.data;
        if(data?.message){
          setAlert({
            type: "error",
            title:"Request Failed",
            message: data.message,
          });
             console.log("Error sending friend request", data.message);  
            return;
            }
      }
      console.log("Error sending friend request", err);
      setAlert({
        type: "error",
        title:"Request Failed",
        message: "Failed to send friend request.",
      });
    }
  };

  const handleCancelRequest = async (otherUserId: number) => {
    try {
      const res = await api.delete(
        `/request-cancel/${otherUserId}`
      );
      if (res.status === 200) {
        setFriendStatus("none");
        setAlert({
          type: "success",
          title:"Request Canceled",
          message: "Friend request canceled successfully.",
        });
      }
    } catch (err) {
      if(axios.isAxiosError(err)){
        const data = err.response?.data;
        if(data?.message){
          setAlert({
            type: "error",
            title:"Cancel Request Failed",
            message: data.message,
          });
             console.log("Error canceling friend request", data.message);  
            return;
            }
      }
      console.log("Error canceling friend request", err);
      setAlert({
        type: "error",
        title:"Cancel Request Failed",
        message: "Failed to cancel friend request.",
      });
    }
  };

  const handleAcceptRequest = async (otherUserId: number) => {
    try {
      const res = await api.patch(
        `/accept-request/${otherUserId}`,
        {}
      );
      if (res.status === 200) {
        setFriendStatus("friends");
        setAlert({
          type: "success",
          title:"Request Accepted",
          message: "Friend request accepted successfully.",
        });
      }
    } catch (err) {
      if(axios.isAxiosError(err)){
        const data = err.response?.data;
        if(data?.message){
          setAlert({
            type: "error",
            title:"Accept Request Failed",
            message: data.message,
          });
             console.log("Error accepting friend request", data.message);  
            return;
            }
      }
      console.log("Error accepting friend request", err);
      setAlert({
        type: "error",
        title:"Accept Request Failed",
        message: "Failed to accept friend request.",
      });
    }
  };
  const handleRejectRequest = async (otherUserId: number) => {
    try {
      const res = await api.delete(
        `/delete-request/${otherUserId}`
      );
      if (res.status === 200) {
        setFriendStatus("none");
        setAlert({
          type: "success",
          title:"Request Rejected",
          message: "Friend request rejected successfully.",
        });
      }
    } catch (err) {
      if(axios.isAxiosError(err)){
        const data = err.response?.data;
        if(data?.message){
          setAlert({
            type: "error",
            title:"Reject Request Failed",
            message: data.message,
          });
             console.log("Error rejecting friend request", data.message);  
            return;
            }
      }
      console.log("Error rejecting friend request", err);
      setAlert({
        type: "error",
        title:"Reject Request Failed",
        message: "Failed to reject friend request.",
      });
    }
  };

  const handleUnfriend = async (otherUserId: number) => {
    try {
      const res = await api.delete(
        `/unfriend/${otherUserId}`
      );
      if (res.status === 200) {
        setFriendStatus("none");
        setAlert({
          type: "success",
          title:"Unfriended",
          message: "You have unfriended this user.",
        });
      }
    } catch (err) {
      if(axios.isAxiosError(err)){
        const data = err.response?.data;
        if(data?.message){
          setAlert({
            type: "error",
            title:"Unfriend Failed",
            message: data.message,
          });
             console.log("Error unfriending user", data.message);  
            return;
            }
      }
      console.log("Error unfriending user", err);
      setAlert({
        type: "error",
        title:"Unfriend Failed",
        message: "Failed to unfriend this user.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar />

      <div className="max-w-[680px] mx-auto px-4 pt-8 pb-16">

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-indigo-100 via-violet-50 to-sky-100" />

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-8 mb-4">
              <img
              src={profileUser?.profile_url || skeletonProfile }
              alt={profileUser?.user_name}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
               />

              {!isOwnProfile && (
                <div className="flex flex-col mt-10 gap-2 w-40">
                <button
                  onClick={() => navigate(`/messages/${user_id}`)}
                  className="w-[80%] flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold shadow-sm transition-all duration-150"
                >
                  <BsChatDots size={15} />
                  Message
                </button>
                {friendStatus === "none" &&
                <button
                 onClick={()=>{
                  handleAddClick(user_id)
                 }}
                  className="w-[80%] flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-400 text-white text-sm font-semibold shadow-sm transition-all duration-150"
                >
                  <BsPersonFillAdd size={15} />
                  Add Friend
                </button>}
                {friendStatus === "pending_sent" &&
                <button
                 onClick={()=>{
                  handleCancelRequest(user_id)
                 }}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-400 hover:bg-slate-300 text-white text-sm font-semibold shadow-sm transition-all duration-150"
                >
                  <BsFillPersonXFill size={15} />
                  Cancel Request
                </button>}
                   {friendStatus === "pending_received" &&
                   <div className="flex flex-col gap-2">
                <button
                 onClick={() => handleAcceptRequest(user_id)}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-xl bg-green-400 hover:bg-green-300 text-white text-sm font-semibold shadow-sm transition-all duration-150"
                >
                  <FaCheck size={15} />
                  Accept Request
                </button>
                  <button
                 onClick={() => handleRejectRequest(user_id)}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-xl bg-red-400 hover:bg-red-300 text-white text-sm font-semibold shadow-sm transition-all duration-150"
                >
                  <ImCross size={15} />
                  Reject Request
                </button>
                </div>
                
                }
                {friendStatus === "friends" &&
                <button
                  onClick={() => handleUnfriend(user_id)}
                  className="w-[80%] flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-400 text-white text-sm font-semibold shadow-sm transition-all duration-150"
                >
                  <BsFillPersonCheckFill size={15} />
                  Unfriend
                </button>}
             
                </div>
              )}
            </div>

            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-800">
                {profileUser?.user_name || "User"}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">{profileUser?.email}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center justify-center bg-gradient-to-r from-indigo-100 via-violet-50 to-sky-100 rounded-2xl shadow-md px-4 py-3 gap-1 min-w-[200px]">
                <span className="text-2xl font-bold text-slate-800">{totalLikes}</span>
                <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Likes</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-gradient-to-r from-indigo-100 via-violet-50 to-sky-100 rounded-2xl shadow-md px-4 py-3 gap-1 min-w-[200px]">
                <span className="text-2xl font-bold text-slate-800">{posts.length}</span>
                <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Posts</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Posts ── */}
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 px-1">
          Posts
        </h3>

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
            <div className="text-4xl mb-3">✍️</div>
            <p className="text-slate-400 text-sm">No posts yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Post header */}
                <div className="px-5 pt-5 pb-3 flex items-center gap-3">
                  {/* Shows the profile-page user's photo on every post */}
                  <img
                  src={profileUser?.profile_url || skeletonProfile }
                  alt={profileUser?.user_name}
                  className="w-12 h-12 rounded-full object-cover border-4 border-white shadow-md"
               />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {post.users?.user_name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {post.visiblity === "all" ? (
                        <BsGlobe className="text-slate-400" size={10} />
                      ) : (
                        <BsLock className="text-slate-400" size={10} />
                      )}
                      <span className="text-[11px] text-slate-400 capitalize">
                        {post.visiblity === "all" ? "Public" : "Only me"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                {post.content && (
                  <div className="px-5 pb-3">
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                )}

                {/* Media */}
                {post.media && post.media.filter(Boolean).length > 0 && (
                  <div className="mt-1">
                    {post.media.filter(Boolean).map((media) => (
                      <img
                        key={media.media_id}
                        src={media.file_url}
                        alt="post media"
                        className="w-full max-h-[420px] object-cover"
                      />
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="px-5 py-1 border-t border-slate-50 flex items-center">
                  <button
                    onClick={() => handleLikeToggle(post.id)}
                    className={`flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                      ${post.likedByCurrentUser
                        ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      }`}
                  >
                    {post.likedByCurrentUser ? (
                      <FaThumbsUp size={15} />
                    ) : (
                      <FaRegThumbsUp size={15} />
                    )}
                    {post.likeCount > 0 ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setLikesPostId(post.id);
                          setShowLikesModal(true);
                        }}
                        className="hover:underline cursor-pointer"
                      >
                        {post.likeCount}
                      </span>
                    ) : null}{" "}
                    Like
                  </button>

                  <div className="w-px h-5 bg-slate-100" />

                  <button
                    onClick={() => { setSelectedPost(post); setShowCommentModal(true); }}
                    className="flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-150"
                  >
                    <FaRegComment size={14} />
                    <span>{post.commentCount > 0 ? post.commentCount : ""} Comment</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {showCommentModal && selectedPost && (
          <CommentModal
            postId={selectedPost?.id}
            setAlert={setAlert}
            onCommentAdded={() =>
              setPosts((prev) =>
                prev.map((p) =>
                  p.id === selectedPost.id ? { ...p, commentCount: p.commentCount + 1 } : p
                )
              )
            }
            onCommentDelete={() =>
              setPosts((prev) =>
                prev.map((p) =>
                  p.id === selectedPost.id ? { ...p, commentCount: p.commentCount - 1 } : p
                )
              )
            }
            onClose={() => setShowCommentModal(false)}
          />
        )}
        {showLikesModal && likesPostId !== null && (
          <LikeModal
            postId={likesPostId}
            likeCount={posts.find((p) => p.id === likesPostId)?.likeCount ?? 0}
            onClose={() => { setShowLikesModal(false); setLikesPostId(null); }}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;