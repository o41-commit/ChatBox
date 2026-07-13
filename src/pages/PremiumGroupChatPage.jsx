import React, { useState, useEffect, useRef } from "react";
import {
  FaArrowLeft,
  FaEllipsisV,
  FaPaperPlane,
  FaTrash,
  FaSpinner,
  FaUsers,
  FaInfoCircle,
  FaSignOutAlt,
  FaRegComments,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

const PremiumGroupChatPage = ({ currentUserId }) => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const [groupDetails, setGroupDetails] = useState({
    name: "Group Room",
    groupPics: "",
    membersCount: 0,
    description: "",
  });

  const socketRef = useRef(null);
  const dropdownRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const api = import.meta.env.VITE_BACKEND_URL;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 1. FETCH INITIAL GROUP METADATA ---
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await axios.get(`${api}/group/${groupId}`, {
          withCredentials: true,
        });

        if (response.data) {
          const targetGroup = response.data.group || response.data;
          setGroupDetails({
            name: targetGroup.name || "Group Room",
            groupPics: targetGroup.groupPics || "",
            membersCount: targetGroup.users?.length || response.data.members?.length || 0,
            description: targetGroup.description || "Premium Conversation Channel",
          });
        }
      } catch (error) {
        console.error("Error fetching group details metadata:", error);
      }
    };

    if (groupId) {
      fetchGroupDetails();
    }
  }, [api, groupId]);

  // --- 2. FETCH HISTORICAL MESSAGES ---
  useEffect(() => {
    const fetchGroupHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${api}/group/message/${groupId}`, {
          withCredentials: true,
        });

        if (response.data && Array.isArray(response.data.messages)) {
          setMessages(response.data.messages);
        } else if (Array.isArray(response.data)) {
          setMessages(response.data);
        }
      } catch (error) {
        console.error("Error fetching group chat histories:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroupHistory();
    }
  }, [api, groupId]);

  // --- 3. LOCAL SOCKET LIFE-CYCLE INSTANTIATION ---
  useEffect(() => {
    if (!groupId) return;

    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Group Socket connected:", socket.id);
      socket.emit("join-group", { groupId });
    });

    socket.on("group-details", (payload) => {
      if (payload && payload._id === groupId) {
        setGroupDetails({
          name: payload.name || "Group Room",
          groupPics: payload.groupPics || "",
          membersCount: payload.users?.length || payload.members?.length || 0,
          description: payload.description || "Premium Conversation Channel",
        });
      }
    });

    socket.on("receive-group-message", (incomingMessage) => {
      if (incomingMessage.groupId === groupId) {
        setMessages((prev) => [...prev, incomingMessage]);
        
        const senderId = incomingMessage.sender?._id || incomingMessage.sender;
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[senderId];
          return updated;
        });
      }
    });

    socket.on("group-user-typing", (data) => {
      if (data.groupId === groupId && data.userId?.toString() !== currentUserId?.toString()) {
        setTypingUsers((prev) => ({
          ...prev,
          [data.userId]: data.username,
        }));
      }
    });

    socket.on("group-user-stop-typing", (data) => {
      if (data.groupId === groupId) {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[data.userId];
          return updated;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [groupId, currentUserId]);

  // --- 4. INPUT INTERACTION & TYPING EMITS ---
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (socketRef.current) {
      socketRef.current.emit("group-typing", { groupId });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("group-stop-typing", { groupId });
      }
    }, 1500);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    clearTimeout(typingTimeoutRef.current);
    if (socketRef.current) {
      socketRef.current.emit("group-stop-typing", { groupId });
      socketRef.current.emit("send-group-message", {
        groupId,
        message: newMessage.trim(),
      });
    }

    setNewMessage("");
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await axios.delete(`${api}/messages/group/${messageId}`, {
        withCredentials: true,
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.error("Error clearing message entry:", error);
    }
  };

  const handleLeaveGroupAction = () => {
    if (window.confirm("Are you sure you want to exit this group room?")) {
      if (socketRef.current) {
        socketRef.current.emit("leave-group", { groupId });
      }
      navigate("/dashboard");
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderTypingText = () => {
    const names = Object.values(typingUsers);
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    return "Multiple people are typing...";
  };

  return (
    <div className="w-full px-4 md:px-6 flex items-center justify-center font-sans">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes bounce-custom { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .dot-animation { animation: bounce-custom 1.2s infinite ease-in-out; }
        .dot-delay-1 { animation-delay: 0.2s; }
        .dot-delay-2 { animation-delay: 0.4s; }
      `}</style>

      <div
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col relative"
        style={{ height: "calc(100vh - 11.25rem)" }}
      >
        {/* HEADER */}
        <div className="px-6 py-4 bg-white text-slate-800 flex items-center justify-between border-b border-slate-100 shadow-sm flex-shrink-0 relative z-20">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="text-slate-500 hover:text-indigo-600 transition p-2 rounded-xl hover:bg-slate-50 text-base flex-shrink-0"
            >
              <FaArrowLeft />
            </button>

            {groupDetails.groupPics ? (
              <img
                src={groupDetails.groupPics}
                alt={groupDetails.name}
                className="w-11 h-11 rounded-2xl object-cover border border-slate-100 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl border border-indigo-100 shadow-inner bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                <FaUsers className="text-xl" />
              </div>
            )}

            <div className="min-w-0">
              <h1 className="text-base font-extrabold text-slate-800 tracking-tight leading-tight truncate">
                {groupDetails.name}
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                {groupDetails.membersCount} active members
              </p>
            </div>
          </div>

          {/* DROPDOWN OPTIONS */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`text-slate-400 hover:text-slate-700 transition p-2.5 rounded-xl text-base ${showDropdown ? "bg-slate-50 text-indigo-600" : "hover:bg-slate-50"}`}
            >
              <FaEllipsisV />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100/80 p-1.5 z-50">
                {/* FIXED: Routes to group/:groupId route details page on click */}
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate(`/dashboard/group/${groupId}`);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-all duration-150"
                >
                  <FaInfoCircle className="text-base text-slate-400" />
                  <span>Group Info</span>
                </button>
                
                <div className="h-px bg-slate-100 my-1 mx-2" />

                <button
                  onClick={handleLeaveGroupAction}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-150"
                >
                  <FaSignOutAlt className="text-base opacity-90" />
                  <span>Leave Group</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CHAT VIEWPORT */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-gradient-to-b from-slate-50/40 to-white flex flex-col z-10">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <FaSpinner className="animate-spin text-2xl text-indigo-600" />
              <p className="text-xs font-semibold tracking-wide">Syncing chat logs...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-2xl shadow-inner">
                <FaRegComments />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-700 tracking-tight">No messages yet</h3>
                <p className="text-xs text-slate-400 max-w-xs font-medium">
                  Be the first to say something and kickstart the conversation context inside this room!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 w-full flex-1">
              {messages.map((msg) => {
                const senderData = msg.sender || {};
                const senderId = senderData._id || senderData;
                
                // FIXED: Strict string matching evaluation protects layout assignments cleanly
                const isMe = senderId?.toString() === currentUserId?.toString() || msg.isSenderMe === true; 
                const displayName = senderData.username || msg.senderUsername || "Member";
                const displayPic = senderData.profilePicture || msg.senderPics;

                return (
                  <div
                    key={msg._id || msg.id}
                    className={`flex w-full ${isMe ? "justify-end" : "justify-start"} items-end gap-2.5 group`}
                  >
                    {!isMe && (
                      displayPic ? (
                        <img
                          src={displayPic}
                          alt={displayName}
                          className="w-8 h-8 rounded-xl object-cover border border-slate-100 shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )
                    )}

                    <div className="relative flex flex-col max-w-[70%]">
                      {!isMe && (
                        <span className="text-[11px] font-bold text-slate-400 mb-1 ml-1 tracking-tight">
                          {displayName}
                        </span>
                      )}

                      <div className={`relative flex items-center gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        {isMe && (
                          <button
                            onClick={() => handleDeleteMessage(msg._id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-opacity duration-200 text-xs p-1"
                            title="Delete Message"
                          >
                            <FaTrash />
                          </button>
                        )}

                        <div
                          className={`px-4.5 py-3 rounded-2xl shadow-sm border ${
                            isMe
                              ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-indigo-600 rounded-br-none"
                              : "bg-white text-slate-800 border-slate-100 rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap tracking-wide font-medium">
                            {msg.message}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] text-slate-400 font-bold mt-1 px-1 block ${isMe ? "text-right" : "text-left"}`}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* TYPING INDICATORS */}
              {Object.keys(typingUsers).length > 0 && (
                <div className="flex w-full justify-start items-center gap-2.5 transition-all duration-300">
                  <div className="bg-slate-100/80 text-slate-500 px-4 py-2.5 rounded-2xl rounded-bl-none border border-slate-200/40 shadow-sm flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full dot-animation"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full dot-animation dot-delay-1"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full dot-animation dot-delay-2"></span>
                    </div>
                    <span className="text-xs font-bold tracking-tight text-slate-400 italic">
                      {renderTypingText()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* CONTROLS FOOTER */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3 flex-shrink-0 z-20">
          <input
            type="text"
            placeholder="Broadcast a message to the group..."
            value={newMessage}
            disabled={loading}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 px-5 py-3.5 border border-slate-200 rounded-2xl bg-slate-50/50 focus:border-indigo-500 focus:bg-white focus:outline-none transition text-sm text-slate-800 placeholder-slate-400 font-medium disabled:opacity-60"
          />

          <button
            onClick={handleSendMessage}
            disabled={newMessage.trim() === ""}
            className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-2xl shadow-md shadow-indigo-100 transition-all duration-200 flex items-center justify-center gap-2 font-bold text-sm flex-shrink-0"
          >
            <FaPaperPlane className="text-xs" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumGroupChatPage;