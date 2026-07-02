import React, { useEffect, useRef, useState } from "react"
import FriendRequest from "./FriendRequest"
import SentRequestList from "./SentRequestList"

const RequestModal = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={dropdownRef}
      className="absolute right-5 top-[calc(100%+10px)] w-[360px] bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150"
    >
      {/* little caret pointing up at the nav button */}
      <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-t border-l border-slate-100 rotate-45" />

      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-base font-bold text-slate-800">Friend Requests</h2>
      </div>

      {/* Tabs */}
      <div className="flex px-4 gap-1 border-b border-slate-100">
        <button
          onClick={() => setActiveTab("received")}
          className={`px-3 py-2 text-sm font-semibold border-b-2 transition-all duration-150 ${
            activeTab === "received"
              ? "text-indigo-600 border-indigo-500"
              : "text-slate-400 border-transparent hover:text-slate-600"
          }`}
        >
          Requests
        </button>
        <button
          onClick={() => setActiveTab("sent")}
          className={`px-3 py-2 text-sm font-semibold border-b-2 transition-all duration-150 ${
            activeTab === "sent"
              ? "text-indigo-600 border-indigo-500"
              : "text-slate-400 border-transparent hover:text-slate-600"
          }`}
        >
          Sent Requests
        </button>
      </div>

      {/* Body */}
      <div className="p-3 max-h-[500px] overflow-y-auto">
        {activeTab === "received" ? (
          <FriendRequest showRequest={activeTab === "received"} />
        ) : (
          <SentRequestList showSentRequests={activeTab === "sent"} />
        )}
      </div>
    </div>
  )
}

export default RequestModal