import React, {useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { BsGlobe, BsLock } from "react-icons/bs";
import type { AlertData } from "../components/Alert";
import CommentModal from "../components/CommentModal";
import LikesModal from "../components/LikeModal";
import { FaThumbsUp, FaRegThumbsUp, FaRegComment } from "react-icons/fa";
import axios from "axios";

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
  profile_url?: string | null;  // ← added
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

const getAvatarColor = (name?: string) => {
  const colors = [
    "bg-violet-100 text-violet-600",
    "bg-sky-100 text-sky-600",
    "bg-emerald-100 text-emerald-600",
    "bg-rose-100 text-rose-600",
    "bg-amber-100 text-amber-600",
    "bg-indigo-100 text-indigo-600",
  ];
  if (!name) return colors[0];
  return colors[name.charCodeAt(0) % colors.length];
};

// Renders either a real profile photo or a colored initials fallback
const Avatar = ({
  user,
  size = "md",
  onClick,
}: {
  user?: UserData;
  size?: "sm" | "md";
  onClick?: () => void;
}) => {
  const dim = size === "sm" ? "w-9 h-9 text-xs" : "w-10 h-10 text-sm";
  const rounded = size === "sm" ? "rounded-full" : "rounded-full";

  if (user?.profile_url) {
    return (
      <img
        src={user.profile_url}
        alt={user.user_name}
        onClick={onClick}
        className={`${dim} ${rounded} object-cover flex-shrink-0 border border-slate-100 ${onClick ? "cursor-pointer" : ""}`}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      className={`${dim} ${rounded} flex items-center justify-center font-semibold flex-shrink-0 ${getAvatarColor(user?.user_name)} ${onClick ? "cursor-pointer" : ""}`}
    >
      {getInitials(user?.user_name)}
    </div>
  );
};

const HomePage = ({
  setAlert,
}: {
  setAlert: React.Dispatch<React.SetStateAction<AlertData | null>>;
}) => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);
  const [showLikesModal, setShowLikesModal] = useState<boolean>(false);
  const [likesPostId, setLikesPostId] = useState<number | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const FetchPosts = async () => {
      const post = await axios.get(
        `${import.meta.env.VITE_BACKEND_API}/get-all-posts`,
        {
          withCredentials: true,
          params: { page, limit },
        }
      );
      setPosts(post.data.posts);
      setTotalPages(post.data.totalPages);
    };
    FetchPosts();
  }, [page]);

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
          const currentCount = post.likeCount;
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

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar />

      <div className="max-w-[600px] mx-auto pt-8 pb-16 px-4">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <div className="text-4xl mb-3">🌱</div>
            <p className="text-slate-500 text-sm">
              No posts yet. Be the first to share something!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="px-5 pt-5 pb-3 flex items-center gap-3">
                  <Avatar
                    user={post.users}
                    onClick={() => navigate(`/users/${post.users?.id}`)}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      onClick={() => navigate(`/users/${post.users?.id}`)}
                      className="cursor-pointer text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors truncate"
                    >
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

                {post.content && (
                  <div className="px-5 pb-3">
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                )}

                {post.media && post.media.length > 0 && (
                  <div className="mt-1">
                    {post.media.map((m) => (
                      <div key={m.media_id} className="bg-slate-50">
                        <img
                          src={m.file_url}
                          alt={m.filename}
                          className="w-full max-h-[440px] object-cover"
                        />
                      </div>
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
                        {post.likeCount}{" "}Like
                      </span>
                    ) : (
                      <span>Like</span>
                    )}
                  </button>

                  <div className="w-px h-6 bg-slate-100" />

                  <button
                    onClick={() => {
                      setSelectedPostId(post.id);
                      setShowCommentModal(true);
                    }}
                    className="flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-150"
                  >
                    <FaRegComment size={15} />
                    <span>
                      {post.commentCount > 0 ? post.commentCount : ""} Comment
                    </span>
                  </button>
                </div>
              </article>
            ))}

            {showLikesModal && likesPostId !== null && (
              <LikesModal
                postId={likesPostId}
                likeCount={posts.find((p) => p.id === likesPostId)?.likeCount ?? 0}
                onClose={() => { setShowLikesModal(false); setLikesPostId(null); }}
              />
            )}
            {showCommentModal && selectedPostId !== null && (
              <CommentModal
                postId={selectedPostId}
                onCommentAdded={() => {
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id === selectedPostId
                        ? { ...p, commentCount: p.commentCount + 1 }
                        : p
                    )
                  );
                }}
                onCommentDelete={() => {
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id === selectedPostId
                        ? { ...p, commentCount: p.commentCount - 1 }
                        : p
                    )
                  );
                }}
                setAlert={setAlert}
                onClose={() => setShowCommentModal(false)}
              />
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            ← Previous
          </button>
          <span className="text-sm text-slate-400 font-medium">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;