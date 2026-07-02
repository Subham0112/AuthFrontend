import React, { useEffect, useState, useContext } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { HiX } from "react-icons/hi";
import axios from "axios";
import type { AlertData } from "./Alert";
import { UserDataContext } from "../context/userContext";
import api from "../lib/axiosInstance";

interface CommentData {
  id: number;
  comment: string;
  created_at: string;
  user_id: number;
  users?: {
    user_name: string;
    profile_url?: string | null;
  };
}

interface Props {
  postId: number;
  setAlert: React.Dispatch<React.SetStateAction<AlertData | null>>;
  onClose: () => void;
  onCommentAdded: () => void;
  onCommentDelete: () => void;
}

const getInitials = (name?: string) =>
  name ? name.slice(0, 2).toUpperCase() : "U";



const CommentAvatar = ({ name, profileUrl }: { name?: string; profileUrl?: string | null }) => {
  if (profileUrl) {
    return (
      <img
        src={profileUrl}
        alt={name}
        className="h-8 w-8 shrink-0 rounded-full object-cover border border-slate-100"
      />
    );
  }
  return (
    <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold bg-sky-100 text-sky-600`}>
      {getInitials(name)}
    </div>
  );
};

const CommentModal = ({ postId, setAlert, onCommentAdded, onCommentDelete, onClose }: Props) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newComment, setNewComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const context = useContext(UserDataContext);
  const currentUser = context?.user;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(
          `/get-comments/${postId}`
        );
        setComments(res.data.comments);
      } catch (err) {
        console.log("Error fetching comments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(
        `/post-comment`,
        { comment: newComment, post_id: postId }
      );
      setComments((prev) => [...prev, res.data.comment]);
      setAlert({ type: "success", title: "Comment Posted", message: res.data.message });
      onCommentAdded?.();
      setNewComment("");
    } catch (err) {
      console.log("Error posting comment", err);
      setAlert({ type: "error", title: "Error", message: "Could not post comment" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (id: number) => {
    try {
      const deleteComment = await api.delete(
        `/delete-comment/${id}`
      );
      setComments((prev) => prev.filter((comment) => comment.id !== id));
      if (deleteComment.status === 200) {
        setAlert({ type: "success", title: "Comment Deleted", message: deleteComment.data.message });
        onCommentDelete?.();
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (data?.message) {
          setAlert({ type: "error", title: "Error Deleting Comments", message: data.message });
        }
      } else {
        setAlert({ type: "error", title: "Error Deleting Comments", message: "Error Deleting Comments" });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-[480px] max-h-[80vh] flex flex-col rounded-2xl bg-white shadow-xl border border-slate-100">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Comments</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <HiX size={18} />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No comments yet. Be the first to comment.
            </p>
          ) : (
            comments.map((c) => {
              return (
                <div key={c.id} className="flex gap-2.5 items-start group">
                  <CommentAvatar
                    name={c.users?.user_name}
                    profileUrl={c.users?.profile_url}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="inline-block bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-full">
                      <p className="text-xs font-semibold text-slate-800 mb-0.5">
                        {c.users?.user_name || "User"}
                      </p>
                      <p className="text-sm text-slate-700 break-words">{c.comment}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="opacity-0 group-hover:opacity-100 mt-1.5 p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0"
                  >
                    <FaRegTrashAlt size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2">
          <CommentAvatar
            name={currentUser?.user_name}
            profileUrl={currentUser?.profile_url}
          />
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }}
            placeholder="Write a comment..."
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:bg-white"
          />
          <button
            onClick={handleAddComment}
            disabled={submitting || !newComment.trim()}
            className="px-4 py-2 rounded-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;