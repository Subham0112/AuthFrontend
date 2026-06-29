import { useEffect, useState } from "react";
import axios from "axios";
import { FaThumbsUp } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

interface LikedUser {
  id: number;
  user_name: string;
  profile_url?: string | null;
}

interface Props {
  postId: number;
  likeCount: number;
  onClose: () => void;
}

const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

const avatarColors = [
  "bg-indigo-100 text-indigo-600",
  "bg-sky-100 text-sky-600",
  "bg-emerald-100 text-emerald-600",
  "bg-rose-100 text-rose-600",
  "bg-amber-100 text-amber-600",
  "bg-violet-100 text-violet-600",
];
const getColor = (name: string) =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

const LikeAvatar = ({ user }: { user: LikedUser }) => {
  if (user.profile_url) {
    return (
      <img
        src={user.profile_url}
        alt={user.user_name}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-slate-100"
      />
    );
  }
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${getColor(user.user_name)}`}>
      {getInitials(user.user_name)}
    </div>
  );
};

const LikesModal = ({ postId, likeCount, onClose }: Props) => {
  const [users, setUsers] = useState<LikedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/getLikes/${postId}`,
          { withCredentials: true }
        );
        const mapped: LikedUser[] = res.data.likes.map(
          (l: { users: { id: number; user_name: string; profile_url?: string | null } }) => l.users
        );
        setUsers(mapped);
      } catch (err) {
        console.error("Error fetching likes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLikes();
  }, [postId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
              <FaThumbsUp size={11} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-800">
              Liked by
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-72">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-10">
              No likes yet.
            </p>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
              >
                <LikeAvatar user={u} />
                <span className="text-sm font-medium text-slate-800">
                  {u.user_name}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60">
          <span className="text-xs text-slate-400">
            {likeCount} {likeCount === 1 ? "person" : "people"} liked this post
          </span>
        </div>
      </div>
    </div>
  );
};

export default LikesModal;