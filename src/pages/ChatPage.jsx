import React, { useState, useEffect, useRef } from "react";
import {
  FaArrowLeft,
  FaEllipsisV,
  FaPaperPlane,
  FaUser,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

const PremiumChatPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dynamic tracking for friend & self metadata from socket payload
  const [peerDetails, setPeerDetails] = useState({
    username: "Friend",
    profilePicture: "",
    isOnline: false,
    lastSeen: null,
  });
  const [currentUserDetails, setCurrentUserDetails] = useState({
    profilePicture: "",
  });

  const socketRef = useRef(null);
  const typingTimeout = useRef(null);
  const messagesEndRef = useRef(null);
  const api = import.meta.env.VITE_BACKEND_URL;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isFriendTyping]);

  // --- FETCH HISTORICAL REST MESSAGES ---
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${api}/messages/${userId}`, {
          withCredentials: true,
        });

        let loadedMessages = [];
        if (response.data && Array.isArray(response.data.messages)) {
          loadedMessages = response.data.messages;
        } else if (Array.isArray(response.data)) {
          loadedMessages = response.data;
        }

        setMessages(loadedMessages);

        // Safely extract the friend's details out of the payload if populated
        const sampleFriendMsg = loadedMessages.find(
          (m) => typeof m.sender === "object" && m.sender?._id === userId,
        );
        if (sampleFriendMsg && sampleFriendMsg.sender) {
          setPeerDetails((prev) => ({
            ...prev,
            username: sampleFriendMsg.sender.username || "Friend",
            profilePicture: sampleFriendMsg.sender.profilePicture || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching chat histories:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchChatHistory();
    }
  }, [api, userId]);

  // --- SOCKET LIFECYCLE & LIVE META STREAM ---
  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Emit event requesting user information explicitly with { userId: receiverId } structure
    socket.on("connect", () => {
      socket.emit("get-chat-user", { userId: userId });
      console.log("Socket connected:", socket.id);
    });

    // Handle full layout state distribution from backend setup
    socket.on("chat-user", (payload) => {
      if (payload?.receiver && payload.receiver.userId === userId) {
        setPeerDetails({
          username: payload.receiver.username || "Friend",
          profilePicture: payload.receiver.profilePicture || "",
          isOnline: payload.receiver.isOnline,
          lastSeen: payload.receiver.lastSeen,
        });
      }
      if (payload?.sender) {
        setCurrentUserDetails({
          profilePicture: payload.sender.profilePicture || "",
        });
      }
    });

    socket.on("chat-user-error", (err) => {
      console.error("Socket Meta Resolution Failure:", err.message);
    });

    socket.on("typing", (data) => {
      const incomingSenderId = data.userId || data.findUser?._id;
      if (incomingSenderId === userId) {
        setIsFriendTyping(true);
        if (data.findUser) {
          setPeerDetails((prev) => ({
            ...prev,
            username: data.findUser.username || "Friend",
            profilePicture: data.findUser.profilePicture || "",
          }));
        }
      }
    });

    socket.on("stop-typing", () => {
      setIsFriendTyping(false);
    });

    socket.on("receive-message", (incomingMessage) => {
      const senderId =
        typeof incomingMessage.sender === "object"
          ? incomingMessage.sender._id
          : incomingMessage.sender;
      if (senderId === userId) {
        setMessages((prev) => [...prev, incomingMessage]);
        setIsFriendTyping(false);
        if (
          typeof incomingMessage.sender === "object" &&
          incomingMessage.sender?.profilePicture
        ) {
          setPeerDetails((prev) => ({
            ...prev,
            username: incomingMessage.sender.username || "Friend",
            profilePicture: incomingMessage.sender.profilePicture,
          }));
        }
      }
    });

    socket.on("message-sent", (confirmedMessage) => {
      setMessages((prev) => [...prev, confirmedMessage]);
    });

    socket.on("message-error", (err) => {
      console.error("Socket Message Error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [api, userId]);

  // --- TYPING EMIT HANDLERS ---
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (socketRef.current) {
      socketRef.current.emit("typing", { client: userId });
    }

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("stop-typing", { client: userId });
      }
    }, 1500);
  };

  // --- SEND HANDLER ---
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    clearTimeout(typingTimeout.current);
    if (socketRef.current) {
      socketRef.current.emit("stop-typing", { client: userId });

      socketRef.current.emit("send-message", {
        reciver: userId,
        message: newMessage.trim(),
      });
    }

    setNewMessage("");
  };

  // --- DELETE HANDLER ---
  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${api}/messages/${messageId}`, {
        withCredentials: true,
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.error("Error erasing message target:", error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Formats fallback text structure for inactive users cleanly
  const renderStatusText = () => {
    if (peerDetails.isOnline) {
      return (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-pulse"></span>
          Active Now
        </>
      );
    }
    if (peerDetails.lastSeen) {
      const date = new Date(peerDetails.lastSeen);
      return (
        <>
          <span className="w-2 h-2 rounded-full bg-gray-300 block"></span>
          Last seen {date.toLocaleDateString()} at{" "}
          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </>
      );
    }
    return (
      <>
        <span className="w-2 h-2 rounded-full bg-gray-300 block"></span>
        Offline
      </>
    );
  };

  return (
    <div className="w-full px-4 md:px-6 flex items-center justify-center">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes bounce-custom { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .dot-animation { animation: bounce-custom 1.2s infinite ease-in-out; }
        .dot-delay-1 { animation-delay: 0.2s; }
        .dot-delay-2 { animation-delay: 0.4s; }
      `}</style>

      <div
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
        style={{ height: "calc(100vh - 11.25rem)" }}
      >
        {/* --- HEADER --- */}
        <div className="px-8 py-4 bg-white text-gray-800 flex items-center justify-between border-b border-gray-100 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-emerald-600 transition text-lg"
            >
              <FaArrowLeft />
            </button>

            {peerDetails.profilePicture ? (
              <img
                src={peerDetails.profilePicture}
                alt={peerDetails.username}
                className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 shadow-sm bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-base overflow-hidden flex-shrink-0">
                {peerDetails.username.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="text-lg font-bold text-gray-800 tracking-tight leading-tight">
                {peerDetails.username}
              </h1>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                {renderStatusText()}
              </p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-50">
            <FaEllipsisV className="text-base" />
          </button>
        </div>

        {/* --- CHAT CANVAS --- */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-gradient-to-b from-gray-50/50 to-white flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-gray-400">
              <FaSpinner className="animate-spin text-2xl text-emerald-600" />
              <p className="text-xs font-medium tracking-wide">
                Syncing secure data stream...
              </p>
            </div>
          ) : (
            <div className="space-y-6 w-full flex-1">
              {(Array.isArray(messages) ? messages : []).map((msg) => {
                const msgSenderId =
                  typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
                const isUser = msgSenderId !== userId;
                const incomingProfilePic =
                  typeof msg.sender === "object"
                    ? msg.sender?.profilePicture
                    : null;

                return (
                  <div
                    key={msg._id || msg.id}
                    className={`flex w-full ${isUser ? "justify-end" : "justify-start"} items-end gap-3 group`}
                  >
                    {/* Receiver Avatar Stack */}
                    {!isUser &&
                      (incomingProfilePic || peerDetails.profilePicture ? (
                        <img
                          src={incomingProfilePic || peerDetails.profilePicture}
                          alt="Receiver"
                          className="w-8 h-8 rounded-full object-cover border shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 flex-shrink-0 text-xs font-semibold">
                          {peerDetails.username.charAt(0).toUpperCase()}
                        </div>
                      ))}

                    <div className="relative flex flex-col max-w-[75%]">
                      <div
                        className={`relative flex items-center gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {isUser && (
                          <button
                            onClick={() => handleDeleteMessage(msg._id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity duration-200 text-xs p-1"
                            title="Delete message"
                          >
                            <FaTrash />
                          </button>
                        )}

                        <div
                          className={`px-5 py-3 rounded-2xl shadow-sm border ${
                            isUser
                              ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-emerald-600 rounded-br-none"
                              : "bg-white text-gray-800 border-gray-100 rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap tracking-wide font-medium">
                            {msg.message}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] text-gray-400 font-semibold mt-1 px-1 block ${isUser ? "text-right" : "text-left"}`}
                      >
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>

                    {/* Sender (Current User) Avatar Stack */}
                    {isUser &&
                      (currentUserDetails.profilePicture ? (
                        <img
                          src={currentUserDetails.profilePicture}
                          alt="Sender"
                          className="w-8 h-8 rounded-full object-cover border shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200 flex-shrink-0 text-xs">
                          <FaUser className="text-[10px]" />
                        </div>
                      ))}
                  </div>
                );
              })}

              {/* Typing Bubble */}
              {isFriendTyping && (
                <div className="flex w-full justify-start items-end gap-3 transition-all duration-300 transform translate-y-0 opacity-100">
                  {peerDetails.profilePicture ? (
                    <img
                      src={peerDetails.profilePicture}
                      alt="Friend Typing"
                      className="w-8 h-8 rounded-full object-cover border shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 flex-shrink-0 text-xs font-semibold">
                      {peerDetails.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="bg-white text-gray-500 border border-gray-100 px-5 py-3.5 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full dot-animation"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full dot-animation dot-delay-1"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full dot-animation dot-delay-2"></span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* --- FOOTER INPUT BAR --- */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-4 flex-shrink-0">
          <input
            type="text"
            placeholder="Write a message..."
            value={newMessage}
            disabled={loading}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 px-5 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:border-emerald-500 focus:bg-white focus:outline-none transition text-sm text-gray-800 placeholder-gray-400 disabled:opacity-60"
          />

          <button
            onClick={handleSendMessage}
            disabled={newMessage.trim() === ""}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 text-white disabled:text-gray-400 rounded-xl shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center gap-2 font-semibold text-sm flex-shrink-0"
          >
            <FaPaperPlane className="text-xs" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumChatPage;
