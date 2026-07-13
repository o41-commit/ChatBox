import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUsers,
  FaSpinner,
  FaUserShield,
  FaUser,
  FaSignOutAlt,
  FaUserPlus,
  FaTrashAlt,
  FaCalendarAlt,
  FaGlobe,
  FaCheckCircle,
} from "react-icons/fa";
import axios from "axios";

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  // const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [membersLimit, setMembersLimit] = useState(6);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState("member");

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${backendUrl}/group/${groupId}`, {
        withCredentials: true,
      });

      const fetchedGroup = response.data.group;
      const fetchedMembers = fetchedGroup?.users || [];

      setGroup(fetchedGroup);
      setMembers(fetchedMembers);

      // Get the role directly from the backend
      setCurrentUserRole(response.data.userType || "member");
    } catch (err) {
      console.error("Error fetching group:", err);
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to fetch group details");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;

    try {
      setActionLoading(true);
      await axios.post(
        `${backendUrl}/leaveGroup`,
        { groupId },
        { withCredentials: true },
      );
      navigate("/dashboard/groups");
    } catch (err) {
      console.error("Error leaving group:", err);
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      alert(err.response?.data?.message || "Failed to leave group");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    console.log(groupId)
    if (
      !window.confirm(
        "CRITICAL WARNING: Are you absolutely sure you want to delete this group? This cannot be undone.",
      )
    )
      return;

    try {
      setActionLoading(true);
      await axios.delete(`${backendUrl}/deleteGroup/${groupId}`,  {
        withCredentials: true,
      });
      navigate("/dashboard/groups");
    } catch (err) {
      console.error("Error deleting group:", err);
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      alert(err.response?.data?.message || "Failed to delete group");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="font-poppins min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-xs w-full">
          <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="font-poppins min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/dashboard/groups")}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-semibold mb-6 group transition duration-200"
          >
            <FaArrowLeft className="transform group-hover:-translate-x-1 transition duration-200" />{" "}
            Back to Groups
          </button>
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-2xl shadow-sm font-medium">
            {error || "Group not found"}
          </div>
        </div>
      </div>
    );
  }

  const groupType = group.type?.toLowerCase();
  const shouldShowAddUser =
    groupType === "public" ||
    (groupType === "private" && currentUserRole === "admin");
  const isAdmin = currentUserRole === "admin";

  return (
    <div className="font-poppins min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard/groups")}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-semibold mb-6 group transition duration-200"
        >
          <FaArrowLeft className="transform group-hover:-translate-x-1 transition duration-200" />{" "}
          Back to Groups
        </button>

        {/* Group Card Header */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-6 md:mb-8 border border-slate-200/80">
          <div className="h-40 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 relative"></div>

          <div className="px-6 sm:px-8 pb-8">
            {/* Added relative and z-10 context to prevent background elements from breaking layers */}
            <div className="relative z-10 flex flex-col md:flex-row gap-5 -mt-14 md:-mt-16 mb-6 items-start md:items-end">
              {/* Profile Image Wrapper */}
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0 overflow-hidden bg-white">
                {group.groupPics ? (
                  <img
                    src={group.groupPics}
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUsers className="text-4xl text-white" />
                )}
              </div>

              {/* Info Block and Buttons Container */}
              <div className="flex-1 w-full pt-2">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      {group.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                      <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                        <FaUsers className="text-slate-500" />{" "}
                        {group.users?.length || 0} Members
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full font-semibold capitalize ${
                          groupType === "public"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {group.type}
                      </span>
                    </div>
                  </div>

                  {/* Actions Panel - Swapped to vertical block stacking on small screens */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                    {shouldShowAddUser && (
                      <button
                        onClick={() =>
                          navigate(`/dashboard/group/${groupId}/add-members`)
                        }
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition duration-200 text-sm"
                      >
                        <FaUserPlus className="text-base" />
                        <span>Add User</span>
                      </button>
                    )}

                    {isAdmin ? (
                      <button
                        onClick={handleDeleteGroup}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-3 rounded-xl font-semibold transition duration-200 text-sm disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTrashAlt />
                        )}
                        <span>
                          {actionLoading ? "Deleting..." : "Delete Group"}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={handleLeaveGroup}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-5 py-3 rounded-xl font-semibold transition duration-200 text-sm disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaSignOutAlt />
                        )}
                        <span>
                          {actionLoading ? "Leaving..." : "Leave Group"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About / Description */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                About Group
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                {group.description ||
                  "No description provided for this community."}
              </p>
            </div>
          </div>
        </div>

        {/* Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaCalendarAlt />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Created On
              </p>
              <p className="text-sm font-bold text-slate-800">
                {new Date(group.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaGlobe />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Privacy Mode
              </p>
              <p className="text-sm font-bold text-slate-800 capitalize">
                {group.type || "Public"}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaCheckCircle />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                System Status
              </p>
              <p className="text-sm font-bold text-slate-800">Active</p>
            </div>
          </div>
        </div>

        {/* Members Management Display Container */}
        <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 border border-slate-200/80">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <FaUsers className="text-blue-600" /> Community Members{" "}
            <span className="text-sm font-medium text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {members.length}
            </span>
          </h2>

          {members.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
              <FaUsers className="text-5xl text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">
                No members in this group yet
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.slice(0, membersLimit).map((member) => (
                  <div
                    key={member.userId?.id || member.userId?._id}
                    className="flex items-center justify-between p-4 bg-slate-50/60 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-sm transition duration-200"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-base shadow-sm overflow-hidden">
                        {member.userId?.profilePicture ? (
                          <img
                            src={member.userId.profilePicture}
                            alt={member.userId.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          member.userId?.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 truncate text-sm sm:text-base">
                          {member.userId?.username || "Unknown User"}
                        </p>
                        <div className="mt-0.5">
                          {member.userType === "admin" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-md">
                              <FaUserShield /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-md">
                              <FaUser className="text-[10px]" /> Member
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button Wrapper */}
              {membersLimit < members.length && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setMembersLimit(membersLimit + 6)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold transition duration-200"
                  >
                    Load More Members
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;