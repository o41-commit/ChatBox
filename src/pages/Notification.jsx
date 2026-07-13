import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaHeart,
  FaComment,
  FaUserPlus,
  FaCheck,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";
import axios from "axios";

const Notification = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  const maxMessageLength = 80;

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${backendUrl}/notifications`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Handle different API response formats
      const data = response.data;

      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else if (Array.isArray(data.data)) {
        setNotifications(data.data);
      } else {
        setNotifications([]);
        console.error("Expected an array but got:", data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message || "Failed to fetch notifications"
      );
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      setActionLoading(notificationId);
      await axios.put(
        `${backendUrl}/markAsRead`,
        { notificationId: notificationId },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      // Update local state to reflect read status
      setNotifications(
        notifications.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif,
        ),
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      alert("Failed to mark as read");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      setActionLoading(notificationId);

      const response = await axios.delete(
        `${backendUrl}/deleteNotification`,
        {
          data: { notificationId: notificationId },
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response) {
        fetchNotifications();
      }

      // Remove notification from local state
      setNotifications(
        notifications.filter((notif) => notif.id !== notificationId),
      );

    } catch (err) {
      console.error("Error deleting notification:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      alert("Failed to delete notification");
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle expanded message
  const toggleExpanded = (notificationId) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  // Get truncated message with read more option
  const getTruncatedMessage = (message, notificationId) => {
    const isExpanded = expandedIds.has(notificationId);
    if (message.length <= maxMessageLength) {
      return message;
    }
    return isExpanded
      ? message
      : message.substring(0, maxMessageLength) + "...";
  };

  // Icon mapper
  const getIcon = (type) => {
    switch (type) {
      case "like":
        return <FaHeart className="text-red-500" />;
      case "comment":
        return <FaComment className="text-blue-500" />;
      case "friend":
        return <FaUserPlus className="text-green-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  // Get gradient color based on notification type
  const getAvatarGradient = (type) => {
    switch (type) {
      case "like":
        return "from-red-400 to-pink-600";
      case "comment":
        return "from-blue-400 to-blue-600";
      case "friend":
        return "from-green-400 to-emerald-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="font-poppins min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-poppins min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Notifications
          </h1>
          <p className="text-gray-600">
            You have{" "}
            <span className="font-semibold text-blue-600">
              {notifications.length}
            </span>{" "}
            notification{notifications.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Empty State */}
        {notifications.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg">No notifications yet</p>
            <p className="text-gray-500">Check back later for updates</p>
          </div>
        )}

        {/* Notification List */}
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-5 border-l-4 ${
                notif.isRead ? "border-gray-300" : "border-blue-600"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon Container */}
                <div className="flex-shrink-0">
                  <div
                    className="w-12 h-12 flex items-center justify-center bg-gradient-to-br rounded-full text-xl shadow-md"
                    style={{
                      background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                    }}
                  >
                    <div
                      className={`bg-gradient-to-br ${getAvatarGradient(notif.type)} w-12 h-12 flex items-center justify-center rounded-full shadow-md`}
                    >
                      {getIcon(notif.type)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {notif.name}
                      </p>
                      <p className="text-sm text-gray-700 mt-1 leading-relaxed break-words">
                        {getTruncatedMessage(notif.message, notif._id)}
                      </p>

                      {/* Read More Button */}
                      {notif.message.length > maxMessageLength && (
                        <button
                          onClick={() => toggleExpanded(notif._id)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 hover:underline"
                        >
                          {expandedIds.has(notif._id)
                            ? "Read less"
                            : "Read more"}
                        </button>
                      )}

                      <p className="text-xs text-gray-500 mt-2"> {new Date(notif.createdAt).toLocaleDateString()}</p>
                    </div>

                    {/* Unread Indicator */}
                    {!notif.isRead && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 mt-1 shadow-sm"></div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif._id)}
                        disabled={actionLoading === notif._id}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === notif._id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaCheck />
                        )}
                        {actionLoading === notif._id
                          ? "Processing..."
                          : "Mark as Read"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notif._id)}
                      disabled={actionLoading === notif._id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === notif._id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTrash />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notification;