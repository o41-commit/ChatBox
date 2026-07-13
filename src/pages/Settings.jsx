import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Imported useNavigate
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaBell,
  FaShieldAlt,
  FaPalette,
  FaQuestionCircle,
  FaCamera,
  FaSignOutAlt,
  FaChevronRight,
  FaUsers,
} from "react-icons/fa";
import axios from "axios";

const settingsItems = [
  {
    icon: <FaUser />,
    title: "Change Username",
    desc: "Update your display name",
    to: "/dashboard/settings/change-username",
  },
  {
    icon: <FaEnvelope />,
    title: "Change Email Address",
    desc: "Manage your email account",
    to: "/dashboard/settings/change-email",
  },
  {
    icon: <FaPhone />,
    title: "Change Phone Number",
    desc: "Update your contact number",
    to: "/dashboard/settings/change-phone",
  },
  {
    icon: <FaCamera />,
    title: "Upload Profile Picture",
    desc: "Update your avatar image",
    to: "/dashboard/settings/upload-profile-picture",
  },
  {
    icon: <FaLock />,
    title: "Change Password",
    desc: "Keep your account secure",
    to: "/dashboard/settings/change-password",
  },
  {
    icon: <FaBell />,
    title: "Notification Settings",
    desc: "Manage notification preferences",
    to: "/dashboard/settings/notification-settings",
  },
  {
    icon: <FaShieldAlt />,
    title: "Privacy & Security",
    desc: "Control your privacy settings",
    to: "/dashboard/settings/privacy-security",
  },
  {
    icon: <FaPalette />,
    title: "Appearance",
    desc: "Customize app appearance",
    to: "/dashboard/settings/appearance",
  },
  {
    icon: <FaUsers />,
    title: "Create a Group",
    desc: "Start a group and connect with friends",
    to: "/dashboard/create-group",
  },
  {
    icon: <FaQuestionCircle />,
    title: "Help & Support",
    desc: "Get assistance and support",
    to: "/dashboard/settings/help-support",
  },
];

const Settings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate(); // Hook initialized

  const getInfo = async () => {
    try {
      const response = await axios.get(`${url}/profile`, {
        withCredentials: true,
      });

      setData(response.data);
      console.log(data)
    } catch (error) {
      console.error(error);
      // Catch 401 unauthenticated responses and redirect to login
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Direct request to backend to wipe the HTTP-only auth cookie
      await axios.post(`${url}/logout`, {}, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Backend logout failed", error);
    } finally {
      // Always redirect to login on completion regardless of network status
      navigate("/login");
    }
  };

  useEffect(() => {
    getInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900  font-poppins p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 rounded-[32px] border border-gray-200 bg-white px-6 py-5 shadow-sm ">
          <h1 className="text-3xl font-semibold text-gray-900 ">Settings</h1>
          <p className="text-gray-600  mt-2 max-w-2xl">
            Manage your account, security, and preferences from one polished
            dashboard.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-[32px] border border-gray-200 bg-green-500 p-6 mb-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ">
          {loading ? (
            <div className="animate-pulse flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                <div className="space-y-3">
                  <div className="h-5 w-40 bg-gray-200 rounded"></div>
                  <div className="h-4 w-56 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="hidden md:block w-full max-w-xs rounded-3xl bg-gray-200 h-28"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 md:flex-row md:items-center  md:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg bg-slate-100 ">
                  {data?.profilePicture ? (
                    <img
                      src={data.profilePicture}
                      alt={data.username}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";

                        const fallback =
                          e.currentTarget.parentElement.querySelector(
                            ".profile-fallback",
                          );

                        if (fallback) {
                          fallback.classList.remove("hidden");
                          fallback.classList.add("flex");
                        }
                      }}
                    />
                  ) : null}

                  <div
                    className={`profile-fallback absolute inset-0 ${
                      data?.profilePicture ? "hidden" : "flex"
                    } items-center justify-center bg-green-600 text-white text-3xl font-bold`}
                  >
                    {data?.username?.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 ">
                    {data?.username}
                  </h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-gray-600 ">
                    <FaEnvelope className="text-white" />
                    {data?.email}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] bg-gray-50 p-5 shadow-sm border border-gray-200 ">
                <p className="text-xs uppercase tracking-[0.3em] text-green-600 ">
                  Account status
                </p>
                <p className="mt-3 text-2xl font-semibold text-gray-900 ">
                  Active
                </p>
                <p className="mt-2 text-sm text-gray-600 ">
                  Your account is secured and ready for all your chat activity.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Settings List */}
        <div className="space-y-3">
          {settingsItems.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="rounded-3xl border border-gray-200 bg-white p-5 flex items-center justify-between gap-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md "
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-green-50 text-green-600 ">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 ">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 ">{item.desc}</p>
                </div>
              </div>
              <FaChevronRight className="text-gray-400" />
            </Link>
          ))}
        </div>

        {/* Logout Button updated with onClick handler */}
        <button 
          onClick={handleLogout}
          className="w-full mt-8 rounded-3xl bg-red-600 px-6 py-4 text-white font-semibold shadow-lg shadow-red-500/20 transition hover:bg-red-700"
        >
          <div className="flex items-center justify-center gap-3">
            <FaSignOutAlt />
            Logout
          </div>
        </button>
      </div>
    </div>
  );
};

export default Settings;