import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaUserPlus } from "react-icons/fa";

const Suggestion = () => {
  const url = import.meta.env.VITE_BACKEND_URL || "";
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingIds, setAddingIds] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${url}/allUser`, {
          withCredentials: true,
        });

        const data = res.data;

        // If your backend returns an array
        if (Array.isArray(data)) {
          if (mounted) setUsers(data);
        }
        // If your backend returns { users: [...] }
        else if (Array.isArray(data.users)) {
          if (mounted) setUsers(data.users);
        } else {
          if (mounted) setUsers([]);
        }
      } catch (err) {
        console.error(err);

        if (err.response?.status === 401) {
          navigate("/login");
          return;
        }

        if (mounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load users"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      mounted = false;
    };
  }, [url, navigate]);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 2);
  };

  const handleAdd = async (id) => {
    if (addingIds.includes(id)) return;

    setAddingIds((prev) => [...prev, id]);

    try {
      await axios.post(
        `${url}/addFriend/${id}`,
        {},
        {
          withCredentials: true,
        }
      );

      // Remove the user after adding
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to add friend"
      );
    } finally {
      setAddingIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const visibleUsers = users.slice(0, visibleCount);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold  text-grey-800  pb-2">
          Suggestions
        </h2>

        <p className="text-sm text-gray-500 ">
          People you may know
        </p>
      </div>

      {loading ? (
        <div className="text-gray-500 ">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-sm">{error}</div>
      ) : visibleUsers.length === 0 ? (
        <div className="text-gray-500 ">
          No suggestions available.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white  rounded-2xl shadow-sm hover:shadow-md transition p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-gray-400 to-gray-600 w-12 h-12 rounded-full flex items-center justify-center">
                  <FaUser className="text-white text-lg" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 ">
                    {user.username}
                  </h3>

                  <p className="text-xs text-gray-500 ">
                    Suggested friend
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleAdd(user._id)}
                disabled={addingIds.includes(user._id)}
                className={`flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm transition-all duration-200 ${
                  addingIds.includes(user._id)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 active:scale-95"
                }`}
              >
                <FaUserPlus />
                {addingIds.includes(user._id) ? "Adding..." : "Add"}
              </button>
            </div>
          ))}
        </div>
      )}

      {visibleCount < users.length && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMore}
            className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-xl text-sm"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Suggestion;