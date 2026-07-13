import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Active from "../component/Active";
import Users from "../component/Users";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Establishing dedicated lifecycle runtime channel
    const socketInstance = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    // Catch connection/authorization errors (like a 401 response from the server)
    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      
      // If the server rejects due to authorization/401 credentials
      if (err.data?.status === 401 || err.message?.includes("authenticated") || err.message?.includes("401")) {
        socketInstance.disconnect();
        navigate("/login");
      }
    });

    setSocket(socketInstance);

    // Completely terminate active pipe context once the user leaves this view panel
    return () => {
      socketInstance.disconnect();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        
        <div className="space-y-4">
          {socket && <Active socket={socket} />}
        </div>

        <div className="min-h-[calc(100vh-120px)] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          {socket && <Users socket={socket} />}
        </div>

      </div>
    </div>
  );
};

export default Chat;