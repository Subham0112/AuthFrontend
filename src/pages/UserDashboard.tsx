import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/userContext";
import {
  FaRegEdit,
  FaRegTrashAlt,
  FaRegThumbsUp,
  FaThumbsUp,
  FaRegComment,
} from "react-icons/fa";
import axios from "axios";
import api from "../lib/axiosInstance";
import CommentModal from "../components/CommentModal";
import LikeModal from "../components/LikeModal";
import type { AlertData } from "../components/Alert";
import EditModal from "../components/EditModal";
import PostModal from "../components/PostModal";
import ProfileUploadModal from "../components/ProfileModal";
import Navbar from "../components/Navbar";
import { BsGlobe, BsLock } from "react-icons/bs";
import { HiOutlinePencilAlt } from "react-icons/hi";
import skeletonProfile from "../assets/img/skeleton_profile.jpg";
import { RiLogoutBoxLine } from "react-icons/ri";
import { MdOutlineDeleteOutline, MdOutlineAddAPhoto } from "react-icons/md";
import FriendList from "../components/FriendList";

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


const UserDashboard = ({
  setAlert,
}: {
  setAlert: React.Dispatch<React.SetStateAction<AlertData | null>>;
}) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showFriendList, setShowFriendList] = useState<boolean>(false);
  const [showPosts,setShowPosts] = useState<boolean>(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likesPostId, setLikesPostId] = useState<number | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const context = useContext(UserDataContext);

  useEffect(() => {
    if (!context) return;
    const { user } = context;
    const fetchUserPosts = async () => {
      try {
        const res = await api.get(
          `/get-post/${user.id}`
        );
        setPosts(res.data.posts);
      } catch (err) {
        console.log("Error fetching posts", err);
      }
    };
    if (user.id) fetchUserPosts();
  }, [context]);

  if (!context) return null;
  const { user, setUser } = context;

  const handleLogoutFromAll = async () => {
    try {
      const res = await api.patch(
        `/logout-from-all`,
        {}
      );
      console.log(res.data.message);
      setUser({ id: 0, email: "", role: null, user_name: "", profile_url: null });
      navigate("/login");
    } catch (err) {
      console.error("Error logging out", err);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    try {
      await api.delete(
        `/deleteUser/${id}`
      );
      setUser({ id: 0, email: "", role: null, user_name: "", profile_url: null });
      navigate("/login");
    } catch (err) {
      console.log("Error deleting users", err);
    }
  };

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

  const totalLikes = posts.reduce((sum, post) => sum + (post.likeCount ?? 0), 0);

  const handlePostDelete = async (id: number) => {
    try {
      const res = await api.delete(
        `/delete-post/${id}`
      );
      console.log(res.data.message);
      setPosts((prev) => prev.filter((post) => post.id !== id));
      setAlert({ type: "success", title: "Post Deleted", message: res.data.message });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (data?.message)
          setAlert({ type: "error", title: "Error Deleting", message: data.message });
      } else {
        setAlert({ type: "error", title: "Error", message: "Error deleting post" });
      }
    }
  };

  const handleProfileUpdated = (newUrl: string) => {
    setUser((prev) => ({ ...prev, profile_url: newUrl }));
  };

  const profileUrl = user.profile_url;

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar />

      <div className="max-w-[680px] mx-auto px-4 pt-8 pb-16">

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-indigo-100 via-violet-50 to-sky-100" />

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">

              <div className="relative group cursor-pointer" onClick={() => setShowProfileModal(true)}>
                
                  <img
                    src={profileUrl || skeletonProfile}
                    alt="profile"
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
                  />
                
                <div className="absolute inset-0 rounded-2xl bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-150">
                  <MdOutlineAddAPhoto size={22} className="text-white" />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold shadow-sm transition-all duration-150"
                >
                  <MdOutlineAddAPhoto size={14} />
                  {profileUrl ? "Update photo" : "Add photo"}
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold shadow-sm transition-all duration-150"
                >
                  <HiOutlinePencilAlt size={15} />
                  New Post
                </button>
              </div>
            </div>

            {/* Name + email */}
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-800">{user?.user_name || "User"}</h2>
              <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-3 mb-5">
              <div className="flex flex-col items-center justify-center bg-gradient-to-r from-indigo-100 via-violet-50 to-sky-100 rounded-2xl shadow-md px-4 py-3 gap-1 min-w-[200px]">
                <span className="text-2xl font-bold text-slate-800">{totalLikes}</span>
                <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Likes</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-gradient-to-r from-indigo-100 via-violet-50 to-sky-100 rounded-2xl shadow-md px-4 py-3 gap-1 min-w-[200px]">
                <span className="text-2xl font-bold text-slate-800">{posts.length}</span>
                <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Posts</span>
              </div>
            </div>

            {/* Danger actions */}
            <div className="flex gap-2 pt-4 border-t border-slate-50">
              <button
                onClick={handleLogoutFromAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 text-sm font-medium transition-all duration-150"
              >
                <RiLogoutBoxLine size={15} />
                Logout all devices
              </button>
              <button
                onClick={() => handleDeleteAccount(user.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 text-sm font-medium transition-all duration-150"
              >
                <MdOutlineDeleteOutline size={16} />
                Delete account
              </button>
               <button
                onClick={() => {
                  navigate("/change-password")
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 text-sm font-medium transition-all duration-150"
              >
                <MdOutlineDeleteOutline size={16} />
              Change Password              
              </button>
            </div>
            <div className="flex gap-2 pt-4 border-t border-slate-50 mt-3">
                <button
                onClick={() =>{ 
                  setShowPosts(true)
                  setShowFriendList(false)}}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 text-sm font-medium transition-all duration-150"
              >
               Show Posts 
              </button>
              <button
                onClick={() =>{ 
                  setShowFriendList(true)
                  setShowPosts(false)}}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 text-sm font-medium transition-all duration-150"
              >
               Show Friends 
              </button>
            </div>
          </div>
        </div>

        {showPosts && <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 px-1">
            Your Posts
          </h3>

        {  posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <p className="text-slate-400 text-sm">You haven't posted anything yet.</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-semibold hover:bg-indigo-100 transition-all"
              >
                Create your first post
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      
                        <img
                          src={profileUrl || skeletonProfile}
                          alt="profile"
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-slate-100"
                        />
                      
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{post.users?.user_name}</p>
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setSelectedPost(post); setShowEditModal(true); }}
                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                      >
                        <FaRegEdit size={14} />
                      </button>
                      <button
                        onClick={() => handlePostDelete(post.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <FaRegTrashAlt size={14} />
                      </button>
                    </div>
                  </div>

                  {post.content && (
                    <div className="px-5 pb-3">
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </div>
                  )}

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

                  <div className="px-5 py-1 border-t border-slate-50 flex items-center">
                    <button
                      onClick={() => handleLikeToggle(post.id)}
                      className={`flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                        ${post.likedByCurrentUser
                          ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                    >
                      {post.likedByCurrentUser ? <FaThumbsUp size={15} /> : <FaRegThumbsUp size={15} />}
                      {post.likeCount > 0 ? (
                        <span
                          onClick={(e) => { e.stopPropagation(); setLikesPostId(post.id); setShowLikesModal(true); }}
                          className="hover:underline cursor-pointer"
                        >
                          {post.likeCount}{" "} Like
                        </span>
                      ) : null}
                      
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
        </div>}

          { showFriendList && <FriendList setAlert={setAlert} showFriend={showFriendList} />}
      </div>

      {/* ── Modals ── */}
      {showProfileModal && (
        <ProfileUploadModal
          currentProfileUrl={profileUrl}
          onClose={() => setShowProfileModal(false)}
          onProfileUpdated={handleProfileUpdated}
          setAlert={setAlert}
        />
      )}
      {showLikesModal && likesPostId !== null && (
        <LikeModal
          postId={likesPostId}
          likeCount={posts.find((p) => p.id === likesPostId)?.likeCount ?? 0}
          onClose={() => { setShowLikesModal(false); setLikesPostId(null); }}
        />
      )}
      {showModal && (
        <PostModal setPosts={setPosts} setAlert={setAlert} onClose={() => setShowModal(false)} />
      )}
      {showEditModal && selectedPost && (
        <EditModal
          post={selectedPost}
          setPosts={setPosts}
          setAlert={setAlert}
          onClose={() => { setShowEditModal(false); setSelectedPost(null); }}
        />
      )}
      {showCommentModal && selectedPost && (
        <CommentModal
          postId={selectedPost?.id}
          setAlert={setAlert}
          onCommentAdded={() =>
            setPosts((prev) =>
              prev.map((p) => p.id === selectedPost.id ? { ...p, commentCount: p.commentCount + 1 } : p)
            )
          }
          onCommentDelete={() =>
            setPosts((prev) =>
              prev.map((p) => p.id === selectedPost.id ? { ...p, commentCount: p.commentCount - 1 } : p)
            )
          }
          onClose={() => setShowCommentModal(false)}
        />
      )}
    </div>
  );
};

export default UserDashboard;