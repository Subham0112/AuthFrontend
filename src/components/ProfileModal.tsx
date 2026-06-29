import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { HiOutlinePhotograph, HiX } from "react-icons/hi";
import { RiUser3Line } from "react-icons/ri";
import type { AlertData } from "./Alert";

interface ProfileUploadModalProps {
  currentProfileUrl?: string | null;
  onClose: () => void;
  onProfileUpdated: (newUrl: string) => void;
  setAlert: React.Dispatch<React.SetStateAction<AlertData | null>>;
}

const ProfileUploadModal = ({
  currentProfileUrl,
  onClose,
  onProfileUpdated,
  setAlert,
}: ProfileUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("profile", file);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/upload-profile`,
        formData,
        { withCredentials: true }
      );
      onProfileUpdated(res.data.profile_url);
      setAlert({ type: "success", title: "Profile Updated", message: "Your profile picture has been updated." });
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        if (msg) setAlert({ type: "error", title: "Upload Failed", message: msg });
      } else {
        setAlert({ type: "error", title: "Upload Failed", message: "Something went wrong." });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-[400px] rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            {currentProfileUrl ? "Update Profile Picture" : "Upload Profile Picture"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <HiX size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col items-center gap-3">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 shadow-md"
                />
                <button
                  onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-900 transition-all shadow"
                >
                  <HiX size={12} />
                </button>
              </div>
            ) : currentProfileUrl ? (
              <img
                src={currentProfileUrl}
                alt="current profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 shadow-md opacity-60"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-indigo-50 border-4 border-indigo-100 flex items-center justify-center shadow-inner">
                <RiUser3Line size={48} className="text-indigo-200" />
              </div>
            )}

            {!preview && (
              <p className="text-xs text-slate-400 text-center">
                {currentProfileUrl
                  ? "Choose a new photo to replace your current one"
                  : "No profile picture yet — upload one below"}
              </p>
            )}
          </div>

          <label
            htmlFor="profile-upload"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer text-sm text-slate-500 font-medium transition-all"
          >
            <HiOutlinePhotograph size={18} />
            Choose from gallery
          </label>
          <input
            ref={fileRef}
            id="profile-upload"
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }}
          />

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-all duration-150"
            >
              {uploading ? "Uploading…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUploadModal;