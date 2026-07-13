import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  FaUser,
  FaUserFriends,
  FaBell,
  FaComments,
  FaUsers,
  FaCog,
} from "react-icons/fa";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [active, setActive] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const [hasUnreadChats, setHasUnreadChats] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  
  // Track the live socket instance locally so click handlers can use it
  const [socketInstance, setSocketInstance] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const api = import.meta.env.VITE_BACKEND_URL;

    const socket = io(api, {
      withCredentials: true,
    });

    setSocketInstance(socket);

    socket.on("connect", () => {
      setActive(true);
      socket.emit("get-badge-status");
    });

    socket.on("user_authenticated", (data) => {
      if (data && data.profilePic) {
        setProfilePic(data.profilePic);
      }
    });

    socket.on("badge-status", (data) => {
      setHasUnreadChats(data.hasUnreadChats);
      setHasUnreadNotifications(data.hasUnreadNotifications);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection failed:", err.message);
      if (err.message.includes("401") || err.message.toLowerCase().includes("unauthorized")) {
        socket.disconnect(); 
        navigate("/login");
      }
    });

    socket.on("disconnect", () => {
      setActive(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  // Click Trigger functions with hard browser reloads
  const handleChatsClick = (e) => {
    e.preventDefault(); // Stop standard router behavior
    if (socketInstance) {
      socketInstance.emit("navbar-click-chats");
    }
    // Hard refresh to the chats dashboard URL
    window.location.href = "/dashboard";
  };

  const handleNotificationsClick = (e) => {
    e.preventDefault(); // Stop standard router behavior
    if (socketInstance) {
      socketInstance.emit("navbar-click-notifications");
    }
    // Hard refresh to the notifications dashboard URL
    window.location.href = "/dashboard/notification";
  };

  return (
    <>
      {/* Top Header */}
      <section className="fixed top-0 left-0 right-0 flex justify-between p-4 bg-white shadow-sm border-b border-gray-200 items-center z-50 ">
        <div>
          <h1 className="font-poppins">
            <span className="font-bold text-2xl text-green-400">ChatBox</span>
          </h1>
        </div>
        
        <div className={active ? "relative bg-gray-200 w-10 h-10 rounded-full border-2 border-green-600 flex items-center justify-center" : "relative bg-gray-200 w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center"}>
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="w-full h-full object-cover rounded-full" />
          ) : (
            <FaUser className="text-xl text-gray-50" />
          )}
          <span className={active ? "absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-lg" : "absolute bottom-0 right-0 w-3.5 h-3.5 bg-gray-400 border-2 border-white rounded-full"}></span>
        </div>
      </section>

      {/* Navigation Footer */}
      <section className="fixed bottom-5 left-0 right-0 p-3 bg-white mx-2 mb-2 rounded-full text-gray-600 border border-gray-200 shadow-lg z-50">
        <div>
          <ul className="flex justify-between items-center px-2">
            <li>
              <Link className="flex items-center flex-col gap-2 text-gray-600 hover:text-green-400 transition" to="/dashboard/groups">
                <FaUsers className="text-lg" />
                <span>Groups</span>
              </Link>
            </li>
            
            <li>
              <Link className="flex items-center flex-col gap-2 text-gray-600 hover:text-green-400 transition" to="/dashboard/friends">
                <FaUserFriends className="text-lg" />
                <span>Friends</span>
              </Link>
            </li>

            {/* CHATS WITH REFRESH ON CLICK */}
            <li>
              <a 
                onClick={handleChatsClick} 
                className="relative flex items-center flex-col gap-2 text-gray-600 hover:text-green-400 transition cursor-pointer" 
                href="/dashboard"
              >
                <div className="relative">
                  <FaComments className="text-lg" />
                  {hasUnreadChats && (
                    <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />
                  )}
                </div>
                <span>Chats</span>
              </a>
            </li>

            {/* NOTIFICATIONS WITH REFRESH ON CLICK */}
            <li>
              <a 
                onClick={handleNotificationsClick} 
                className="relative flex items-center flex-col gap-2 text-gray-600 hover:text-green-400 transition cursor-pointer" 
                href="/dashboard/notification"
              >
                <div className="relative">
                  <FaBell className="text-lg" />
                  {hasUnreadNotifications && (
                    <span className="absolute -top-1.5 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />
                  )}
                </div>
                <span>Notifications</span>
              </a>
            </li>

            <li>
              <Link className="flex items-center flex-col gap-2 text-gray-600 hover:text-green-400 transition" to="/dashboard/settings">
                <FaCog className="text-lg" />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
};

export default Navbar;