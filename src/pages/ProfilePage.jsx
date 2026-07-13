import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  FaCheckCircle, 
  FaPhone, 
  FaClock, 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt,
  FaSpinner,
  FaShareAlt,
  FaCheck
} from "react-icons/fa";
import axios from "axios";

const ProfilePage = () => {
  const { id } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        // GET request to /profile/:id (No withCredentials needed as requested)
        const response = await axios.get(`${backendUrl}/user/${id}`);
        setUser(response.data.user || response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || "Failed to load profile details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserProfile();
  }, [id, backendUrl]);

  const handleShareProfile = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (loading) {
    return (
      <div className="font-poppins min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-xs w-full">
          <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="font-poppins min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-2xl shadow-sm font-medium max-w-md w-full text-center">
          {error || "User profile not found"}
        </div>
      </div>
    );
  }

  // Helper formatting for lastSeen date fallback string
  const formatLastSeen = () => {
    if (user.isOnline) return "Active now";
    if (!user.lastSeen) return "Offline";
    return new Date(user.lastSeen).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="font-poppins min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800">
      <div className="max-w-3xl mx-auto">
        
        {/* Profile Card Container */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200/80">
          
          {/* Premium Gradient Banner */}
          <div className="h-40 bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 relative">
            {/* Share Button located inside banner corner context cleanly */}
            <button 
              onClick={handleShareProfile}
              className={`absolute top-4 right-4 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition duration-200 shadow-sm border ${
                copied 
                  ? "bg-emerald-500/90 text-white border-emerald-400" 
                  : "bg-white/20 hover:bg-white/30 text-white border-white/10"
              }`}
            >
              {copied ? <FaCheck className="text-xs" /> : <FaShareAlt />}
              <span>{copied ? "Copied!" : "Share Profile"}</span>
            </button>
          </div>

          {/* Main Profile Info Section */}
          <div className="px-6 sm:px-8 pb-8">
            <div className="relative z-10 flex flex-col sm:flex-row gap-5 -mt-16 sm:-mt-20 mb-6 items-start sm:items-end">
              
              {/* Profile Picture with Online Status Indicator */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-400 font-bold overflow-hidden bg-white">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-full h-full object-cover z-40"
                    />
                  ) : (
                    <FaUser className="text-5xl text-slate-400" />
                  )}
                </div>

                {/* Status Indicator Dot mapped to `isOnline` */}
                <span className={`absolute -bottom-1 z-60 -right-1 w-5 h-5 rounded-full border-4 border-white ${
                  user.isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`} title={user.isOnline ? "Online" : "Offline"} />
              </div>

              {/* Text Meta Info mapped to backend User Schema keys */}
              <div className="flex-1 w-full pt-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                      {user.name}
                    </h1>
                    {user.verified && (
                      <FaCheckCircle className="text-blue-500 text-xl sm:text-2xl" title="Verified Account" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-400">
                    @{user.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Core Data Details Grid */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Phone Number Item */}
              <div className="flex items-center gap-4 p-4 bg-slate-50/60 rounded-2xl border border-slate-100/80">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaPhone />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{user.phoneNumber || "Not provided"}</p>
                </div>
              </div>

              {/* Last Seen / Active Status Item */}
              <div className="flex items-center gap-4 p-4 bg-slate-50/60 rounded-2xl border border-slate-100/80">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  user.isOnline ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                }`}>
                  <FaClock />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Activity Status</p>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {formatLastSeen()}
                  </p>
                </div>
              </div>

              {/* Email Address Item */}
              <div className="flex items-center gap-4 p-4 bg-slate-50/60 rounded-2xl border border-slate-100/80">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaEnvelope />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                </div>
              </div>

              {/* Registration Date Item (Maps from schema timestamps) */}
              <div className="flex items-center gap-4 p-4 bg-slate-50/60 rounded-2xl border border-slate-100/80">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaCalendarAlt />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Member Since</p>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {user.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) 
                      : "N/A"
                    }
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;