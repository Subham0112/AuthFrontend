import { useEffect, useState } from "react";
import api from "../lib/axiosInstance";
import { FaThumbsUp } from "react-icons/fa";
import { HiX } from "react-icons/hi";
import skeletonProfile from "../assets/img/skeleton_profile.jpg";

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
  "bg-ivory-200 text-ink-600",
  "bg-sage-100 text-sage-700",
  "bg-gold-50 text-gold-700",
  "bg-clay-100 text-clay-600",
  "bg-ivory-300 text-ink-700",
];
const getColor = (name: string) =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

const LikeAvatar = ({ user }: { user: LikedUser }) => {
  if (user.profile_url) {
    return (
      <img
        src={user.profile_url || skeletonProfile}
        alt={user.user_name}
        className="h-9 w-9 rounded-full object-cover flex-shrink-0 ring-1 ring-ivory-400"
      />
    );
  }
  return (
    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${getColor(user.user_name)}`}>
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
        const res = await api.get(
          `/getLikes/${postId}`
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 p-4 backdrop-blur-[2px] animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-ivory-400 bg-white shadow-lift animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ivory-300 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sage-700 text-white">
              <FaThumbsUp size={11} />
            </div>
            <span className="font-display text-[15px] font-medium text-ink-900">
              Liked by
            </span>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            aria-label="Close likes"
          >
            <HiX size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-72 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-ivory-300 border-t-sage-700" />
            </div>
          ) : users.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-400">
              No likes yet — be the first.
            </p>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-ivory-100"
              >
                <LikeAvatar user={u} />
                <span className="text-sm font-semibold text-ink-800">
                  {u.user_name}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-ivory-300 bg-ivory-50 px-5 py-3">
          <span className="text-xs text-ink-400">
            {likeCount} {likeCount === 1 ? "person" : "people"} liked this post
          </span>
        </div>
      </div>
    </div>
  );
};

export default LikesModal;