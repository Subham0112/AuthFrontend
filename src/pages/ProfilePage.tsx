import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaRegThumbsUp, FaThumbsUp, FaRegComment } from "react-icons/fa";
import { BsChatDots } from "react-icons/bs";
import axios from "axios";
import CommentModal from "../components/CommentModal";
import LikeModal from "../components/LikeModal";
import type { AlertData } from "../components/Alert";
import Navbar from "../components/Navbar";
import { BsGlobe, BsLock } from "react-icons/bs";
import { UserDataContext } from "../context/userContext";
import { RiUser3Line } from "react-icons/ri";

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

const getInitials = (name?: string) =>
  name ? name.slice(0, 2).toUpperCase() : "U";

const ProfileAvatar = ({
  user,
  large = false,
}: {
  user?: UserData | null;
  large?: boolean;
}) => {
  if (large) {
    
    return user?.profile_url ? (
      <img
        src={user.profile_url}
        alt={user.user_name}
        className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
      />
    ) : (
      <div className="w-20 h-20 rounded-2xl bg-indigo-100 border-4 border-white shadow-md flex items-center justify-center">
        {user?.user_name ? (
          <span className="text-indigo-600 text-2xl font-bold">
            {getInitials(user.user_name)}
          </span>
        ) : (
          <RiUser3Line size={36} className="text-indigo-300" />
        )}
      </div>
    );
  }
  return user?.profile_url ? (
    <img
      src={user.profile_url}
      alt={user.user_name}
      className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-slate-100"
    />
  ) : (
    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
      <span className="text-indigo-600 text-xs font-bold">
        {getInitials(user?.user_name)}
      </span>
    </div>
  );
};

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

  const navigate = useNavigate();
  const context = useContext(UserDataContext);
  const { userId } = useParams();
  const user_id = Number(userId);

  const isOwnProfile = context?.user?.id === user_id;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/user/${userId}`,
          { withCredentials: true }
        );
        setProfileUser(res.data.user);
      } catch (err) {
        console.log("Error fetching user", err);
      }
    };
    const fetchUserPosts = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/get-post/${user_id}`,
          { withCredentials: true }
        );
        setPosts(res.data.posts);
      } catch (err) {
        console.log("Error fetching posts", err);
      }
    };
    if (userId) {
      fetchUser();
      fetchUserPosts();
    }
  }, [userId]);

  const handleLikeToggle = async (postId: number) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/toggle-like/${postId}`,
        {},
        { withCredentials: true }
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

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar />

      <div className="max-w-[680px] mx-auto px-4 pt-8 pb-16">

        {/* ── Profile Card ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-indigo-100 via-violet-50 to-sky-100" />

          <div className="px-6 pb-6">
            {/* Avatar + action row */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <ProfileAvatar user={profileUser} large />

              {!isOwnProfile && (
                <button
                  onClick={() => navigate(`/messages/${user_id}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold shadow-sm transition-all duration-150"
                >
                  <BsChatDots size={15} />
                  Message
                </button>
              )}
            </div>

            {/* Name + email */}
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
                  <ProfileAvatar user={profileUser} />
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