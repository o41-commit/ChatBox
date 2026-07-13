import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaUserPlus,
  FaSpinner,
  FaSearch,
  FaCheck,
} from "react-icons/fa";
import axios from "axios";

const AddMembers = () => {
  const  { groupId }  = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  const groupName = location.state?.groupName || "Group";
console.log(groupId)
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) => {
      const targetName = user.friendUserName || user.friendId?.username || "";
      return targetName.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${backendUrl}/friends`, {
        withCredentials: true,
      });

      setUsers(response.data || []);
      setFilteredUsers(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely extract the string ID from the mixed friendId field
  const getFriendIdString = (user) => {
    if (!user) return null;
    if (typeof user.friendId === "string") {
      return user.friendId;
    }
    if (user.friendId && typeof user.friendId === "object") {
      return user.friendId.id || user.friendId._id;
    }
    return user._id; // absolute fallback
  };

  const toggleMemberSelection = (userId) => {
    if (!userId) return;
    setSelectedMembers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) {
      alert("Please select at least one member to add");
      return;
    }

    try {
      setAdding(true);

      console.log("Sending selected memberIds to backend:", selectedMembers, groupId);

      // FIXED: Property changed to 'memberIds' matching backend, and passed 'selectedMembers' directly without wrapping it in an array again
      await axios.post(
        `${backendUrl}/addMember`,
        {
          groupId,
          memberIds: selectedMembers, 
        },
        {
          withCredentials: true,
        },
      );

      navigate(`/dashboard/group/${groupId}`);
    } catch (err) {
      console.error("Error adding members:", err);
      alert(err.response?.data?.message || "Failed to add members");
    } finally {
      setAdding(false);
    }
  };

  const handleSkip = () => {
    navigate(`/dashboard/group/${groupId}`);
  };

  if (loading) {
    return (
      <div className="font-poppins min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-poppins min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard/groups")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 transition"
        >
          <FaArrowLeft /> Back to Groups
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Add Members to "{groupName}"
          </h1>
          <p className="text-gray-600">Invite people to join your new group</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-200">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-600 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Users Grid */}
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-200">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <FaUserPlus className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm
                      ? "No users found matching your search"
                      : "No users available"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredUsers.map((user) => {
                    const currentId = getFriendIdString(user);
                    const displayName = user.friendUserName || user.friendId?.username || "Unknown User";
                    const profileImg = user.friendId?.profilePicture || user.profilePicture || "";

                    // FIXED: Fallback to user._id as element key if currentId mapping fails
                    return (
                      <button
                        key={currentId || user._id}
                        onClick={() => toggleMemberSelection(currentId)}
                        className={`p-4 rounded-2xl border-2 text-left transition ${
                          selectedMembers.includes(currentId)
                            ? "border-blue-600 bg-blue-50 shadow-md"
                            : "border-gray-200 bg-gray-50 hover:border-blue-400"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                              {profileImg ? (
                                <img
                                  src={profileImg}
                                  alt={displayName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                displayName.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-800 truncate">
                                {displayName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                Friend Status Active
                              </p>
                            </div>
                          </div>

                          {selectedMembers.includes(currentId) && (
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                              <FaCheck className="text-sm" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Selected Members Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-200 sticky top-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Selected Members
              </h3>

              {selectedMembers.length === 0 ? (
                <div className="text-center py-8">
                  <FaUserPlus className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Select members to add to the group
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {selectedMembers.map((memberId) => {
                      const foundUser = users.find((u) => getFriendIdString(u) === memberId);
                      const selectedDisplayName = foundUser?.friendUserName || foundUser?.friendId?.username || "Unknown User";

                      return (
                        <div
                          key={memberId}
                          className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {selectedDisplayName.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-sm font-semibold text-gray-800 truncate flex-1">
                            {selectedDisplayName}
                          </p>
                          <button
                            onClick={() => toggleMemberSelection(memberId)}
                            className="text-red-600 hover:text-red-700 font-bold text-lg px-1"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedMembers.length}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedMembers.length === 1 ? "member" : "members"}{" "}
                      selected
                    </p>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddMembers}
                  disabled={adding || selectedMembers.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {adding ? (
                    <>
                      <FaSpinner className="animate-spin" /> Adding...
                    </>
                  ) : (
                    <>
                      <FaUserPlus /> Add Members
                    </>
                  )}
                </button>
                <button
                  onClick={handleSkip}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-2xl font-semibold transition"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMembers;