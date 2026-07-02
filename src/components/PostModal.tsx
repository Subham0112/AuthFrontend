import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserDataContext } from '../context/userContext';
import type { PostData } from '../pages/UserDashboard';
import type { AlertData } from './Alert';
import { HiOutlinePhotograph, HiX } from 'react-icons/hi';
import { BsGlobe, BsLock } from 'react-icons/bs';
import api from '../lib/axiosInstance';

const PostModal = ({
  setAlert,
  onClose,
  setPosts,
}: {
  setAlert: React.Dispatch<React.SetStateAction<AlertData | null>>;
  onClose: () => void;
  setPosts: React.Dispatch<React.SetStateAction<PostData[]>>;
}) => {
  const [content, setContent] = useState<string>('');
  const [visibility, setVisibility] = useState<string>('all');
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const context = useContext(UserDataContext);
  const [preview, setPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!context) return null;
  const { user } = context;

  const handleUpload = async () => {
    try {
      if (!content.trim() && !file) {
        setAlert({ type: 'error', title: 'Empty Post', message: 'Post must have content or a file' });
        return;
      }
      setPosting(true);
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('userId', String(user.id));
      formData.append('content', content);
      formData.append('visibility', visibility);
      const res = await api.post(
        `/upload-file`,
        formData
      );
      setPosts((prevPosts) => [...prevPosts, res.data.data]);
      setAlert({ type: 'success', title: 'Posted!', message: res.data.message });
      setFile(null);
      setContent('');
      if (fileRef.current) fileRef.current.value = '';
      onClose();
      console.log(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (data?.message) {
          setAlert({ type: 'error', title: 'Error', message: data.message });
          console.error('Error:', data.message);
        }
      } else {
        setAlert({ type: 'error', title: 'Error', message: 'Error uploading files' });
      }
    } finally {
      setPosting(false);
    }
  };

  const initials = user?.user_name ? user.user_name.slice(0, 2).toUpperCase() : 'U';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-[520px] max-h-[90vh] overflow-auto rounded-2xl bg-white shadow-xl border border-slate-100">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Create Post</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <HiX size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* User row */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-600 text-xs font-bold">{initials}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{user?.user_name}</p>
              {/* Visibility toggle */}
              <button
                onClick={() => setVisibility(v => v === 'all' ? 'onlyme' : 'all')}
                className="flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 transition-all text-xs text-slate-600 font-medium"
              >
                {visibility === 'all' ? (
                  <><BsGlobe size={10} /> Public</>
                ) : (
                  <><BsLock size={10} /> Only me</>
                )}
              </button>
            </div>
          </div>

          {/* Text area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            name="content"
            placeholder={`What's on your mind, ${user?.user_name?.split(' ')[0] || 'you'}?`}
            className="w-full min-h-[120px] resize-none bg-transparent text-slate-800 text-sm leading-relaxed placeholder:text-slate-300 outline-none border-none focus:ring-0 p-0"
          />

          {/* Image preview */}
          {preview && (
            <div className="relative rounded-xl overflow-hidden border border-slate-100">
              <img src={preview} alt="preview" className="w-full max-h-56 object-cover" />
              <button
                onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all"
              >
                <HiX size={14} />
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Bottom actions */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-slate-500 hover:bg-slate-50 hover:text-indigo-500 transition-all text-sm font-medium"
            >
              <HiOutlinePhotograph size={18} />
              <span>Photo</span>
            </label>
            <input
              ref={fileRef}
              id="file-upload"
              type="file"
              hidden
              accept="image/*,video/*"
              onChange={(e) => {
                if (e.target.files) setFile(e.target.files[0]);
              }}
            />

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={posting || (!content.trim() && !file)}
                className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-all duration-150"
              >
                {posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;