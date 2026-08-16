import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import api from "../lib/axiosInstance";
import { BsArrowLeft, BsSendFill } from "react-icons/bs";
import { FaRegTrashAlt } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";

import Navbar from "../components/Navbar";
import { UserDataContext } from "../context/userContext";
import type { AlertData } from "../components/Alert";

interface MessageData {
  id: number;
  sender_id: number;
  receiver_id: number;
  messages: string;
  created_at: string;
  is_read: boolean;
}

interface OtherUser {
  id: number;
  user_name: string;
  email: string;
  profile_url?: string | null;
}

// Shared type-scale helper for the display face used on names and headers.
const serif = { fontFamily: "'Fraunces', 'Iowan Old Style', Georgia, serif" };

const socket = io(import.meta.env.VITE_BACKEND_API, { withCredentials: true });
const getInitials = (name?: string) => name?.slice(0, 2).toUpperCase() || "?";

const isSameDay = (a: string, b: string) => {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

const formatDay = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
};

const DayDivider = ({ date }: { date: string }) => (
  <div className="flex items-center justify-center py-2">
    <span className="rounded-full border border-ivory-400 bg-ivory-100 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink-400">
      {formatDay(date)}
    </span>
  </div>
);

const HeaderAvatar = ({ user }: { user: OtherUser | null }) => {
  if (user?.profile_url) {
    return (
      <img
        src={user.profile_url}
        alt={user.user_name}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-1 ring-[#E7E3DA]"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 bg-[#F1EFE9] text-[#6B675C]">
      {getInitials(user?.user_name)}
    </div>
  );
};

const ChatPage = ({
  setAlert,
}: {
  setAlert: React.Dispatch<React.SetStateAction<AlertData | null>>;
}) => {
  const { userId } = useParams();
  const otherUserId = Number(userId);
  const navigate = useNavigate();
  const context = useContext(UserDataContext);
  const currentUserId = context?.user?.id;
  const currentUser = context?.user;


  const [messages, setMessages] = useState<MessageData[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [typing, setTyping] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
const [loadingOlder, setLoadingOlder] = useState<boolean>(false);
  const [lastReadMessageId, setLastReadMessageId] = useState<number | null>(
    null,
  );

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingOlderRef = useRef(false);
  const shouldScrollToBottomRef = useRef(true);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const currentUserIdRef = useRef<number | undefined>(currentUserId);
  const oldestIdRef = useRef<number | null>(null);
  const pendingScrollRestoreRef = useRef<{ height: number; scrollTop: number } | null>(null);

useEffect(() => {
  oldestIdRef.current =
    messages.length > 0 ? messages[0].id : null;
}, [messages]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect( () => {
    if (!otherUserId) return;
    api.get(`/user/${otherUserId}`)
      .then((res) => setOtherUser(res.data.user))
      .catch((err) => console.log("Error fetching user", err));
  }, [otherUserId]);

useEffect(() => {
  if (!otherUserId || !currentUserId) return;

  const fetchLatestMessages = async () => {
    setLoading(true);
    setMessages([]);
    setLastReadMessageId(null);
    setHasMore(true);

    try {
      const res = await api.get(
        `/message/${otherUserId}`
      );

      const fetched: MessageData[] = res.data.data;

     setMessages(fetched);
      setHasMore(res.data.hasMore);
      shouldScrollToBottomRef.current = true;

      const lastRead = [...fetched]
        .reverse()
        .find(
          (m) =>
            m.sender_id === currentUserId &&
            m.is_read
        );

      if (lastRead) {
        setLastReadMessageId(lastRead.id);
      }

    }catch(err){
      console.log("Error Fetching Messages", err)
    } finally {
      setLoading(false);
    }
  };

  fetchLatestMessages();

}, [otherUserId, currentUserId]);

const loadOlderMessages = useCallback(async () => {
  if (
    loadingOlderRef.current ||
    loading ||
    !hasMore ||
    messages.length === 0
  ) {
    return;
  }

  loadingOlderRef.current = true;
  setLoadingOlder(true);

  const div = messageContainerRef.current;
  if (!div) {
    loadingOlderRef.current = false;
    setLoadingOlder(false);
    return;
  }

  const previousHeight = div.scrollHeight;
  const previousScrollTop = div.scrollTop;

  try {
    const oldestId = oldestIdRef.current;

    const res = await api.get(
      `/message/${otherUserId}?before=${oldestId}`
    );
 
    const olderMessages: MessageData[] = res.data.data;
    shouldScrollToBottomRef.current = false;

    pendingScrollRestoreRef.current = {
      height: previousHeight,
      scrollTop: previousScrollTop,
    };

    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));

      const uniqueOlder = olderMessages.filter(
        (m) => !existingIds.has(m.id)
      );

      return [...uniqueOlder, ...prev];
    });

    setHasMore(res.data.hasMore);
  } catch (err) {
    console.log(err);
  } finally {
    loadingOlderRef.current = false;
    setLoadingOlder(false);
  }
}, [messages, hasMore, loading, otherUserId]);

useLayoutEffect(() => {
  const pending = pendingScrollRestoreRef.current;
  if (!pending) return;

  const el = messageContainerRef.current;
  if (!el) {
    pendingScrollRestoreRef.current = null;
    return;
  }

  const newHeight = el.scrollHeight;
  el.scrollTop = pending.scrollTop + (newHeight - pending.height);
  pendingScrollRestoreRef.current = null;
}, [messages]);

useEffect(() => {
  const div = messageContainerRef.current;

  if (!div) return;

  const handleScroll = () => {
    const isScrollable = div.scrollHeight > div.clientHeight + 10;
    if (
      isScrollable &&
      div.scrollTop <= 20 &&
      hasMore &&
      !loadingOlderRef.current
    ) {
      loadOlderMessages();
    }
  };

  div.addEventListener("scroll", handleScroll);

  return () => {
    div.removeEventListener("scroll", handleScroll);
  };
}, [hasMore, loadOlderMessages]);

useEffect(() => {
  if (loading) return;

  const container = messageContainerRef.current;
  if (!container) return;

  if (!shouldScrollToBottomRef.current) {
    shouldScrollToBottomRef.current = true;
    return;
  }

  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
  });
}, [loading, messages]);

  useEffect(() => {
    if (!currentUserId) return;

    socket.emit("join", currentUserId);

    socket.on("receive_message", (message: MessageData) => {
      const isCurrentConversation =
        (message.sender_id === otherUserId &&
          message.receiver_id === currentUserId) ||
        (message.sender_id === currentUserId &&
          message.receiver_id === otherUserId);

      if (!isCurrentConversation) return;
      shouldScrollToBottomRef.current = true;

      setMessages((prev) => [...prev, message]);

      if (message.sender_id === otherUserId) {
        axios
          .patch(
            `${import.meta.env.VITE_BACKEND_API}/messages/${otherUserId}/read`,
            {},
            { withCredentials: true },
          )
          .then(() => {
            socket.emit("messages_read", {
              readerId: currentUserId,
              senderId: otherUserId,
            });
          })
          .catch(() => {});
      }
    });

    socket.on("messages_read", () => {
      const uid = currentUserIdRef.current;
      if (!uid) return;
      setMessages((prev) => {
        const lastSent = [...prev].reverse().find((m) => m.sender_id === uid);
        if (lastSent) {
          setLastReadMessageId(lastSent.id);
          return prev.map((m) =>
            m.sender_id === uid ? { ...m, is_read: true } : m,
          );
        }
        return prev;
      });
    });

    socket.on("user_typing", (data) => {
      if (data.senderId === otherUserId) setTyping(true);
    });

    socket.on("user_stop_typing", (data) => {
      if (data.senderId === otherUserId) setTyping(false);
    });
    socket.on("message_deleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    });

    axios
      .patch(
        `${import.meta.env.VITE_BACKEND_API}/messages/${otherUserId}/read`,
        {},
        { withCredentials: true },
      )
      .then(() => {
        socket.emit("messages_read", {
          readerId: currentUserId,
          senderId: otherUserId,
        });
      })
      .catch((err) => console.log("Error marking read", err));

    return () => {
      socket.off("receive_message");
      socket.off("messages_read");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.off("message_deleted");
    };
  }, [currentUserId, otherUserId]);

  useEffect(() => {
  if (openMenuId === null) return

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.msg-menu')) {
      setOpenMenuId(null)
    }
  }

  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [openMenuId])

  if (!context) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    socket.emit("typing", { senderId: currentUserId, receiverId: otherUserId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        senderId: currentUserId,
        receiverId: otherUserId,
      });
    }, 1000);
  };

  

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await api.post(
        `/message`,
        { message: newMessage, recieverId: otherUserId }
      );
        shouldScrollToBottomRef.current = true;
      setMessages((prev) => [...prev, res.data.data]);
      socket.emit("send_message", {
        senderId: currentUserId,
        receiverId: otherUserId,
        message: newMessage,
      });
      setNewMessage("");
    } catch (err) {
      console.log("Error sending message", err);
    }
  };
  const handleMsgDelete = async (id: number) => {
    try {
      const deleteMsg = await api.delete(
        `/delete-message/${id}`
      );
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      setAlert({
        type: "success",
        title: "Message Deleted",
        message: deleteMsg.data.message,
      });
      console.log(deleteMsg.data.message);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errData = err.response?.data;
        if (errData?.message) {
          setAlert({
            type: "error",
            title: "Message Delete Failed",
            message: errData.message,
          });
          console.log(errData.message);
        }
      } else {
        setAlert({
          type: "error",
          title: "Message Delete Failed",
          message: "Unable to Delete Message",
        });
        console.log("Unable to Delete Message");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const BubbleAvatar = () =>
    otherUser?.profile_url ? (
      <img
        src={otherUser.profile_url}
        alt={otherUser.user_name}
        className="w-6 h-6 rounded-full object-cover flex-shrink-0 ring-1 ring-[#E7E3DA] self-end mb-1"
      />
    ) : (
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0 self-end mb-1 bg-[#F1EFE9] text-[#6B675C]">
        {getInitials(otherUser?.user_name)}
      </div>
    );

  const myMessages = messages.filter((m) => m.sender_id === currentUserId);
  const lastSentId =
    myMessages.length > 0 ? myMessages[myMessages.length - 1].id : null;

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col text-[#2A2822]">
      <Navbar />
      <div
     
      className="max-w-[600px] w-full mx-auto pt-8 pb-8 px-4 flex flex-col flex-1">
        <div className="flex flex-col h-[75vh] rounded-[16px] border border-[#E7E3DA] bg-white overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-ivory-300 bg-white px-4 py-3.5">
            <button
              onClick={() => navigate("/messages")}
              className="icon-btn shrink-0"
              aria-label="Back to messages"
            >
              <BsArrowLeft size={17} />
            </button>
            <HeaderAvatar user={otherUser} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p
                  onClick={() => navigate(`/users/${otherUserId}`)}
                  style={serif}
                  className="cursor-pointer truncate text-[15px] font-medium text-ink-900 transition-colors hover:text-sage-700"
                >
                  {otherUser?.user_name || "..."}
                </p>
                {typing && (
                  <span className="flex items-center gap-1 text-sage-700">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sage-600 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sage-600 [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sage-600 [animation-delay:240ms]" />
                  </span>
                )}
              </div>
              <p className="truncate text-[11.5px] text-ink-400">
                {typing
                  ? `${otherUser?.user_name || "They"} is typing…`
                  : otherUser?.email || "Conversation"}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="relative flex-1 min-h-0">
            {loadingOlder && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <div className="flex items-center gap-2 rounded-full border border-ivory-400 bg-white/90 px-3 py-1.5 text-xs text-ink-600 backdrop-blur">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ivory-400 border-t-sage-700" />
                  Loading older messages...
                </div>
              </div>
            )}
            <div
           ref={messageContainerRef}
          className="h-full overflow-y-auto px-5 py-5 space-y-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {loading ? (
              <div className="flex flex-col gap-3 mt-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"} animate-pulse`}
                  >
                    <div
                      className={`h-9 rounded-2xl bg-[#F1EFE9] ${i % 2 === 0 ? "w-40" : "w-52"}`}
                    />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full pt-10 gap-2">
                <p style={serif} className="text-base italic text-[#6B675C]">
                  No messages yet
                </p>
                <p className="text-xs text-[#9C978A]">
                  Say hello to {otherUser?.user_name}!
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => {
                const isOwn = msg.sender_id === currentUserId;
                const isLastSent = isOwn && msg.id === lastSentId;
                const isLastRead = isOwn && msg.id === lastReadMessageId;
                const prev = messages[idx - 1];
                const showDay = !prev || !isSameDay(prev.created_at, msg.created_at);
                return (
                  <div key={msg.id} className="flex flex-col">
                    {showDay && <DayDivider date={msg.created_at} />}
                    <div
                      className={`flex group flex-col ${isOwn ? "items-end" : "items-start"}`}
                    >
                    <div
                      className={`flex items-center gap-1 ${isOwn ? "justify-end" : "justify-start"} w-full`}
                    >
                    {!isOwn && <BubbleAvatar />}
                    {isOwn &&
                    <span className="msg-menu flex items-center gap-1" >
                     {openMenuId === msg.id &&
                      <span 
                          onClick={() => {
                          handleMsgDelete(msg.id);
                          setOpenMenuId(null);
                        }}
                      className="px-4 cursor-pointer py-2 rounded-lg bg-[#F7EEEC] text-[#7B3F3F] text-xs flex items-center gap-2 font-medium">

                      <FaRegTrashAlt
                        className="text-[#7B3F3F]"
                      
                      />
                      Delete Message
                      </span>
                    }
                      <span
                        className="cursor-pointer text-[#B2AC9C] hover:text-[#6B675C] opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                        onClick={() =>
                          setOpenMenuId((prev) =>
                            prev === msg.id ? null : msg.id,
                          )
                        }
                      >
                        <HiDotsVertical />
                      </span>

                      </span>}

                      <div
                        className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-[13.5px] shadow-sm ${isOwn ? "bg-ink-900 text-white rounded-br-sm" : "bg-white border border-ivory-300 text-ink-800 rounded-bl-sm"}`}
                      >
                        <div
                          className={`flex ${isOwn ? "flex-row-reverse" : "flex-row"} gap-5`}
                        >
                          <p className="whitespace-pre-wrap break-words break-all leading-relaxed">
                            {msg.messages}
                          </p>
                        </div>
                        <span
                          className={`block text-[10px] mt-1 ${isOwn ? "text-white/50" : "text-[#9C978A]"} text-right`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {isOwn && (isLastRead || isLastSent) && (
                      <div className="flex items-center mt-0.5 mr-1 h-3.5">
                        {isLastRead ? (
                          <span className="text-[10px] font-semibold text-sage-700">
                            Seen
                          </span>
                        ) : (
                          <span className="text-[10px] text-ink-300">
                            Sent
                          </span>
                        )}
                      </div>
                    )}
                    </div>
                  </div>
                );
              })}
              </>
            )}
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2.5 border-t border-ivory-300 bg-white px-4 py-3.5">
            {currentUser?.profile_url ? (
              <img
                src={currentUser.profile_url}
                alt={currentUser.user_name}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-[#E7E3DA]"
              />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 bg-[#F1EFE9] text-[#6B675C]">
                {getInitials(currentUser?.user_name)}
              </div>
            )}
            <input
              value={newMessage}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              type="text"
              placeholder={`Message ${otherUser?.user_name || ""}...`}
              className="flex-1 rounded-xl border border-ivory-400 bg-ivory-100 px-4 py-2.5 text-[13.5px] outline-none transition-all placeholder:text-ink-300 focus:border-sage-600 focus:bg-white focus:ring-[3px] focus:ring-sage-200/70"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="rounded-xl bg-ink-900 p-2.5 text-white transition-all duration-150 hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-30 flex-shrink-0"
              aria-label="Send message"
            >
              <BsSendFill size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;