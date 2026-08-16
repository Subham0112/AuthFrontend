import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import api from "../lib/axiosInstance";
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
      const res = await api.post(
        `/upload-profile`,
        formData
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 p-4 backdrop-blur-[2px] animate-fade-in">
      <div className="w-full max-w-[400px] animate-scale-in overflow-hidden rounded-2xl border border-ivory-400 bg-white shadow-lift">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-ivory-300 px-5 py-4">
          <h2 className="font-display text-[16px] font-medium text-ink-900">
            {currentProfileUrl ? "Update Profile Picture" : "Upload Profile Picture"}
          </h2>
          <button
            onClick={onClose}
            className="icon-btn"
            aria-label="Close"
          >
            <HiX size={16} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-col items-center gap-3">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="preview"
                  className="h-32 w-32 rounded-full border-4 border-sage-200 object-cover shadow-luxe"
                />
                <button
                  onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-white shadow transition-all hover:bg-ink-700"
                  aria-label="Remove preview"
                >
                  <HiX size={12} />
                </button>
              </div>
            ) : currentProfileUrl ? (
              <img
                src={currentProfileUrl}
                alt="current profile"
                className="h-32 w-32 rounded-full border-4 border-sage-200 object-cover opacity-60 shadow-luxe"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-sage-100 bg-sage-50">
                <RiUser3Line size={48} className="text-sage-300" />
              </div>
            )}

            {!preview && (
              <p className="text-center text-xs text-ink-400">
                {currentProfileUrl
                  ? "Choose a new photo to replace your current one"
                  : "No profile picture yet — upload one below"}
              </p>
            )}
          </div>

          <label
            htmlFor="profile-upload"
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ivory-400 bg-ivory-100 py-2.5 text-sm font-semibold text-ink-500 transition-all duration-150 hover:border-sage-500 hover:bg-sage-50 hover:text-sage-700"
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
              className="btn-ghost flex-1 py-2.5"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="btn-primary flex-1 py-2.5"
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