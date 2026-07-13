import React, { useState, useEffect, useCallback } from "react";
import { FaUser, FaUsers, FaCompass } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

const Users = ({ socket, directUsers = [] }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chats");
  const [groups, setGroups] = useState([]);
  const [chats, setChats] = useState([]);

  const handleChatClick = useCallback(async (friendId, chatId) => {
   console.log(`${backendUrl}/read-message`);
    try {
      const response = await axios.post(
        `${backendUrl}/read-message`,
        {
          friendId: friendId // REFACTORED: Receives the correct partner ID instead of the last message sender's ID
        },
        {
          withCredentials: true,
        },
      );

      console.log(response);
      if (socket) {
        socket.emit("get-chat-info");
      }
    } catch (error) {
      console.error("Error marking messages as read via axios:", error);
    } finally {
      navigate(`/dashboard/chat/user/${chatId}`);
    }
  }, [socket, navigate]);

  // NEW LOGIC: Callback to mark all group messages as read, refresh UI context, and execute layout navigation safely.
  const handleGroupClick = useCallback(async (groupId) => {
    try {
      await axios.post(
        `${backendUrl}/group/messages/read`,
        { groupId },
        { withCredentials: true }
      );
      if (socket) {
        socket.emit("get-group-info");
      }
    } catch (error) {
      console.error("Error marking group messages as read via axios:", error);
    } finally {
      navigate(`/dashboard/groupChat/${groupId}`);
    }
  }, [socket, navigate]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("get-group-info");
    socket.emit("get-chat-info");

    socket.on("group-info", (data) => {
      if (data.success) {
        setGroups(data.groups || []);
      }
    });

    socket.on("group-error", (err) => {
      console.error("Backend validation group error:", err);
    });

    socket.on("chat-info", (data) => {
      if (data.success) {
        setChats(data.chats || []);
      }

      console.log(data.chats)
    });

    socket.on("chat-error", (err) => {
      console.error("Backend validation chat error:", err);
    });

    return () => {
      socket.off("group-info");
      socket.off("group-error");
      socket.off("chat-info");
      socket.off("chat-error");
    };
  }, [socket]);

  const displayChats = chats.length > 0 ? chats : directUsers;

  return (
    <div className="font-poppins h-full flex flex-col bg-slate-50 overflow-hidden selection:bg-indigo-200">
      <div className="p-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex-shrink-0">
        <div className="flex bg-slate-100/80 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab("chats");
              if (socket) socket.emit("get-chat-info");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
              activeTab === "chats"
                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <FaUser className="text-xs" />
            <span>Direct Messages</span>
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
              activeTab === "groups"
                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <FaUsers className="text-sm" />
            <span>Group Rooms</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-2">
        {/* Direct Messages Tab */}
        {activeTab === "chats" && (
          <>
            {displayChats.length > 0 ? (
              <ul className="flex flex-col gap-2.5">
                {displayChats.map((chat) => {
                  const chatId = chat.chatId || chat.id;
                  const profilePic = chat.profilePicture;
                  const displayName = chat.username || chat.name;
                  
                  // REFACTORED: Always target the conversation partner using explicit fields populated by the backend 
                  // instead of inferring it incorrectly from the last message sender.
                  const friendId = chat.friendId || chat.chatId || chat.id;

                  const hasMessage =
                    !!chat.lastMessage?.message || !!chat.message;
                  const messageText =
                    chat.lastMessage?.message ||
                    chat.message ||
                    "No messages yet";
                  const timeStamp = chat.lastMessage?.createdAt
                    ? formatTime(chat.lastMessage.createdAt)
                    : chat.time || "";
                  const unread =
                    chat.unreadCount !== undefined
                      ? chat.unreadCount
                      : chat.unread || 0;
                  const onlineStatus =
                    chat.isOnline !== undefined ? chat.isOnline : chat.online;

                  return (
                    <li
                      key={chatId}
                      onClick={() => handleChatClick(friendId, chatId)}
                      className="group flex items-center gap-4 rounded-2xl bg-white p-3.5 border border-slate-100/50 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:bg-slate-50 hover:shadow-md cursor-pointer"
                    >
                      <div className="relative flex-shrink-0">
                        {profilePic ? (
                          <img
                            src={profilePic}
                            alt={displayName}
                            className="h-12 w-12 rounded-full object-cover border border-slate-100 shadow-sm"
                          />
                        ) : (
                          <div
                            className={`bg-gradient-to-br ${chat.color || "from-slate-600 to-slate-800"} rounded-full p-3.5 shadow-inner`}
                          >
                            <FaUser className="text-xl text-white" />
                          </div>
                        )}

                        {onlineStatus && (
                          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm animate-pulse"></span>
                        )}

                        {unread > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-5.5 min-w-[22px] items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1.5 text-[10px] font-black text-white shadow-sm">
                            {unread}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <h2 className="truncate text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-200">
                            {displayName}
                          </h2>
                          <span className="whitespace-nowrap text-xs font-medium text-slate-400">
                            {timeStamp}
                          </span>
                        </div>
                        <p
                          className={`truncate text-sm font-medium text-slate-500 ${!hasMessage ? "italic text-slate-400" : ""}`}
                        >
                          {messageText}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center text-center px-4 py-12 mt-4 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-500 mb-4">
                  <FaCompass className="text-3xl" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  No Active Chats
                </h3>
                <p className="text-slate-500 text-xs max-w-[220px] leading-relaxed">
                  Start a conversation to see your private messages here.
                </p>
              </div>
            )}
          </>
        )}

        {/* Group Rooms Tab */}
        {activeTab === "groups" && (
          <>
            {groups.length > 0 ? (
              <ul className="flex flex-col gap-2.5">
                {groups.map((group) => {
                  const hasLastMessage = !!group.lastMessage;
                  const senderName =
                    group.lastMessage?.senderUsername || "System";
                  const cleanMessageText =
                    group.lastMessage?.message ||
                    "No messages yet in this group";

                  return (
                    <li
                      key={group.groupId}
                      // NEW LOGIC: Updated the onClick handler to route through the new handleGroupClick action wrapper.
                      onClick={() => handleGroupClick(group.groupId)}
                      className="group flex items-center gap-4 rounded-2xl bg-white p-3.5 border border-slate-100/50 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:bg-slate-50 hover:shadow-md cursor-pointer"
                    >
                      <div className="relative flex-shrink-0">
                        {group.groupPics ? (
                          <img
                            src={group.groupPics}
                            alt={group.groupName}
                            className="h-12 w-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                          />
                        ) : (
                          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3.5 shadow-inner">
                            <FaUsers className="text-xl text-white" />
                          </div>
                        )}

                        {group.unreadCount > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-5.5 min-w-[22px] items-center justify-center rounded-full border-2 border-white bg-indigo-600 px-1.5 text-[10px] font-black text-white shadow-sm">
                            {group.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <h2 className="truncate text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-200">
                            {group.groupName}
                          </h2>
                          <span className="whitespace-nowrap text-xs font-medium text-slate-400">
                            {hasLastMessage
                              ? formatTime(group.lastMessage.createdAt)
                              : ""}
                          </span>
                        </div>

                        <p className="truncate text-sm font-medium text-slate-500 max-w-full">
                          {hasLastMessage && (
                            <span className="text-slate-700 font-semibold mr-1">
                              {senderName}:
                            </span>
                          )}
                          <span
                            className={
                              !hasLastMessage ? "italic text-slate-400" : ""
                            }
                          >
                            {cleanMessageText}
                          </span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center text-center px-4 py-12 mt-4 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-500 mb-4 animate-bounce">
                  <FaCompass className="text-3xl" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  No Groups Joined
                </h3>
                <p className="text-slate-500 text-xs max-w-[220px] mb-5 leading-relaxed">
                  You aren't a member of any communication channels yet.
                </p>
                <a
                  href="/dashboard/group"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 rounded-xl shadow-md shadow-indigo-200 active:scale-95"
                >
                  <FaCompass className="text-xs" />
                  <span>Explore Rooms</span>
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Users;