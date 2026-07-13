import { FaUser, FaCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Active = ({ socket }) => {
  const [friends, setFriends] = useState([]);
  const [connected, setConnected] = useState(socket ? socket.connected : false);

  useEffect(() => {
    if (!socket) return;

    if (socket.connected) {
      setConnected(true);
    }

    const onConnect = () => {
      setConnected(true);
      socket.emit("get-friends-status");
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onFriendsStatus = (friendsData) => {
      setFriends(friendsData || []);
    };

    const onConnectError = (err) => {
      console.error("Socket Error in Active list:", err.message);
    };

    // Bind event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("friends-status", onFriendsStatus);
    socket.on("connect_error", onConnectError);

    // Dynamic state fetch check
    if (socket.connected) {
      socket.emit("get-friends-status");
    }

    return () => {
      // Unregister handlers gracefully without tearing down the underlying link connection
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("friends-status", onFriendsStatus);
      socket.off("connect_error", onConnectError);
    };
  }, [socket]);

  const sortedFriends = [...friends].sort((a, b) => {
    if (a.active && !b.active) return -1;
    if (!a.active && b.active) return 1;
    return 0;
  });

  const onlineCount = friends.filter((friend) => friend.active).length;

  return (
    <section className="w-full rounded-3xl bg-white border border-slate-100 shadow-sm p-5 md:p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
            Active Friends
          </h2>
          <p className="text-xs md:text-sm text-slate-400 font-semibold mt-0.5">
            {onlineCount} {onlineCount === 1 ? "friend" : "friends"} online
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            connected
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-rose-50 text-rose-700 border-rose-100"
          }`}
        >
          <FaCircle
            className={`text-[8px] ${connected ? "animate-pulse text-emerald-500" : "text-rose-500"}`}
          />
          <span>{connected ? "Live" : "Offline"}</span>
        </div>
      </div>

      {!connected && friends.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-10">
          <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
          <p className="mt-3 text-xs font-semibold text-slate-400">
            Connecting network...
          </p>
        </div>
      ) : sortedFriends.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-3">
            <FaUser className="text-xl" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No Friends Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
            Active connections will pop up right here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto overflow-y-hidden select-none touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-5 md:gap-6 min-w-max px-1 pb-2">
            {sortedFriends.map((friend) => (
              <Link
                key={friend.userId}
                to={`/dashboard/chat/user/${friend.userId}`}
                className="group flex flex-col items-center w-16 sm:w-20 transition-all duration-200"
              >
                <div className="relative">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-[3px] border transition-all duration-300 group-hover:scale-105 shadow-sm ${
                      friend.active
                        ? "border-emerald-400 bg-gradient-to-br from-emerald-400 to-teal-500"
                        : "border-slate-200 bg-slate-100"
                    }`}
                  >
                    <div className="w-full h-full rounded-[11px] overflow-hidden bg-white flex items-center justify-center">
                      {friend.profilePicture ? (
                        <img
                          src={friend.profilePicture}
                          alt={friend.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-slate-300 text-lg sm:text-xl" />
                      )}
                    </div>
                  </div>

                  <span
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                      friend.active
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-slate-400"
                    }`}
                  />
                </div>

                <h3 className="mt-2.5 w-full truncate text-center font-bold text-slate-700 text-xs tracking-tight group-hover:text-slate-900 transition-colors">
                  {friend.userName}
                </h3>

                <span
                  className={`text-[10px] font-semibold tracking-wide scale-95 origin-center ${
                    friend.active ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {friend.active ? "online" : "away"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Active;