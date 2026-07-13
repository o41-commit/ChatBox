import React, { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";

const Followers = () => {
  const api = import.meta.env.VITE_BACKEND_URL || "";

  const [users, setUsers] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchFollowers = async () => {
      try {
        const res = await axios.get(`${api}/friends`, {
          withCredentials: true,
        });

        if (mounted) {
          setUsers(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load followers",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchFollowers();

    return () => {
      mounted = false;
    };
  }, [api]);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 2);
  };

  const visibleUsers = users.slice(0, visibleCount);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Friends</h2>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl p-5 shadow">
          <h3 className="font-semibold text-gray-800">No friends yet</h3>

          <p className="text-sm text-gray-500 mt-1">
            You haven't added any friends yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-400 flex items-center justify-center">
                  {user.friendId?.profilePicture ? (
                    <img
                      src={user.friendId.profilePicture}
                      alt={user.friendId.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-white text-xl" />
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">
                    {user.friendId?.username}
                  </h3>

                  <p className="text-xs text-gray-500">Friend</p>
                </div>
              </div>

              <Link to={`/dashboard/profile/${user.friendId?._id}`} className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm transition">
                View
              </Link>
            </div>
          ))}
        </div>
      )}

      {visibleCount < users.length && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMore}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
};

export default Followers;
