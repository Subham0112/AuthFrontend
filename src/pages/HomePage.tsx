import React, { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { BsGlobe, BsLock } from "react-icons/bs";
import type { AlertData } from "../components/Alert";
import CommentModal from "../components/CommentModal";
import LikesModal from "../components/LikeModal";
import { FaThumbsUp, FaRegThumbsUp, FaRegComment } from "react-icons/fa";
import skeletonProfile from "../assets/img/skeleton_profile.jpg";
import api from "../lib/axiosInstance"

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
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const limit = 10;
  const navigate = useNavigate();

  const loadingMoreRef = useRef(false);
  const buttomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialPosts = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/get-all-posts`,
          {
            params: { page: 1, limit },
          }
        );
        setPosts(res.data.posts);
        setPage(1);
        setHasMore(res.data.currentPage < res.data.totalPages);
      } catch (err) {
        console.log("Error fetching posts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialPosts();
  }, []);

  const loadMorePosts = useCallback(async () => {
    if (loadingMoreRef.current || loading || !hasMore) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const res = await api.get(
        `/get-all-posts`,
        {
          params: { page: nextPage, limit },
        }
      );

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNew = (res.data.posts as PostData[]).filter(
          (p) => !existingIds.has(p.id)
        );
        return [...prev, ...uniqueNew];
      });
      setPage(nextPage);
      setHasMore(res.data.currentPage < res.data.totalPages);
    } catch (err) {
      console.log("Error loading more posts", err);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [page, hasMore, loading]);

  
  useEffect(() => {
    const buttom = buttomRef.current;
    if (!buttom) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(buttom);
    return () => observer.disconnect();
  }, [loadMorePosts]);

  const handleLikeToggle = async (postId: number) => {
    try {
      const res = await api.post(
        `/toggle-like/${postId}`,
        {}
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
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100" />
                  <div className="h-3 w-32 rounded bg-slate-100" />
                </div>
                <div className="h-3 w-full rounded bg-slate-100 mb-2" />
                <div className="h-3 w-2/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
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
                  <img
                   src={post.users?.profile_url || skeletonProfile}
                   alt={post.users?.user_name}
                   className={`w-10 h-10 rounded-full object-cover flex-shrink-0 border border-slate-100 }`}
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

        {!loading && posts.length > 0 && (
          <div ref={buttomRef} className="flex justify-center items-center py-8">
            {loadingMore && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-300 border-t-indigo-400 animate-spin" />
                Loading more posts...
              </div>
            )}
            {!hasMore && (
              <p className="text-xs text-slate-400">You're all caught up</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;