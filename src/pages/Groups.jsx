import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaSpinner, FaPlus } from "react-icons/fa";
import axios from "axios";

const Groups = () => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  const [myGroups, setMyGroups] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myLimit, setMyLimit] = useState(3);
  const [suggestLimit, setSuggestLimit] = useState(3);
  const [joined, setJoined] = useState([]);
  const [joiningId, setJoiningId] = useState(null);

  // Fetch groups on mount
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      const [myGroupsRes, suggestedRes] = await Promise.all([
        axios.get(`${backendUrl}/groups`, {
          withCredentials: true,
        }),
        axios.get(`${backendUrl}/publicGroups`, {
          withCredentials: true,
        }),
      ]);

      // Ensure arrays are always stored
      setMyGroups(
        Array.isArray(myGroupsRes.data?.groups) ? myGroupsRes.data.groups : [],
      );

      setSuggestedGroups(
        Array.isArray(suggestedRes.data?.groups)
          ? suggestedRes.data.groups
          : [],
      );
    } catch (err) {
      console.error(err);

      // If unauthorized, redirect straight away
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setMyGroups([]);
      setSuggestedGroups([]);
      setError(err.response?.data?.message || "Failed to fetch groups.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (groupId) => {
    try {
      setJoiningId(groupId);
      await axios.post(
        `${backendUrl}/joinPublicGroup`,
        { groupId },
        {
          withCredentials: true,
        },
      );

      // Add to local joined state array immediately
      setJoined((prev) => [...prev, groupId]);
      
      // Refresh database records (this shifts the group from backend suggested response to myGroups)
      fetchGroups(); 
    } catch (err) {
      console.error("Error joining group:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      alert(err.response?.data?.message || "Failed to join group");
    } finally {
      setJoiningId(null);
    }
  };

  // Create a Set of all joined group IDs for quick lookup filtering
  const myGroupIds = new Set(myGroups.map((group) => group._id));
  
  // Filter out any suggested group that is already in My Groups or just joined locally
  const cleanSuggestedGroups = suggestedGroups.filter(
    (group) => !myGroupIds.has(group._id) && !joined.includes(group._id)
  );

  return (
    <div className="font-poppins min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              Groups & Communities
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Join and explore communities to connect with like-minded people
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/create-group")}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg w-full md:w-auto self-start md:self-auto"
          >
            <FaPlus /> Create Group
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col sm:flex-row items-center justify-center py-16 gap-3">
            <FaSpinner className="text-4xl text-blue-600 animate-spin" />
            <p className="text-gray-600 text-sm sm:text-base">Loading groups...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* MY GROUPS */}
            <div className="mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                My Groups
              </h2>

              {myGroups.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200 p-4">
                  <FaUsers className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm sm:text-base">
                    No groups yet. Create or join one!
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {myGroups.slice(0, myLimit).map((group) => (
                      <div
                        key={group._id}
                        className="bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-lg transition border-l-4 border-blue-600 gap-4"
                      >
                        <div
                          className="flex items-center gap-3 sm:gap-4 flex-1 cursor-pointer min-w-0"
                          onClick={() =>
                            navigate(`/dashboard/group/${group._id}`)
                          }
                        >
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                            {group.groupPics ? (
                              <img
                                src={group.groupPics}
                                alt={group.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <FaUsers className="text-white text-lg sm:text-xl" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate">
                              {group.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                              {group.description || "No description"}
                            </p>
                            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                              {group.users?.length || 0} members •{" "}
                              {group.type || "Private"}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            navigate(`/dashboard/group/${group._id}`)
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition w-full sm:w-auto text-center"
                        >
                          Open
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* LOAD MORE MY GROUPS */}
                  {myLimit < myGroups.length && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => setMyLimit(myLimit + 3)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 sm:py-3 rounded-xl text-sm font-semibold transition shadow-lg w-full sm:w-auto"
                      >
                        Load More Groups
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* SUGGESTED GROUPS */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                Suggested Communities
              </h2>

              {cleanSuggestedGroups.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200 p-4">
                  <FaUsers className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm sm:text-base">No suggested groups available</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {cleanSuggestedGroups.slice(0, suggestLimit).map((group) => (
                      <div
                        key={group._id}
                        className="bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-lg transition border-l-4 border-green-600 gap-4"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                            {group.groupPics ? (
                              <img
                                src={group.groupPics}
                                alt={group.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <FaUsers className="text-white text-lg sm:text-xl" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate">
                              {group.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                              {group.description || "No description"}
                            </p>
                            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                              {group.users?.length || 0} members •{" "}
                              {group.type || "Public"}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleJoin(group._id)}
                          disabled={joiningId === group._id || joined.includes(group._id)}
                          className="px-5 py-2 rounded-lg text-sm font-semibold transition w-full sm:w-auto text-center flex items-center justify-center bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {joiningId === group._id ? (
                            <FaSpinner className="animate-spin" />
                          ) : joined.includes(group._id) ? (
                            "Joined"
                          ) : (
                            "Join"
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* LOAD MORE SUGGESTED */}
                  {suggestLimit < cleanSuggestedGroups.length && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => setSuggestLimit(suggestLimit + 3)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 sm:py-3 rounded-xl text-sm font-semibold transition shadow-lg w-full sm:w-auto"
                      >
                        Load More Communities
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Groups;