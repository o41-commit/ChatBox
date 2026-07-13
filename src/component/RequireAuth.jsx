import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const RequireAuth = ({ children }) => {
  const url = import.meta.env.VITE_BACKEND_URL || "";
  const authCheck = import.meta.env.VITE_AUTH_CHECK || `${url}/session`;
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          if (mounted) {
            setAuthed(true);
            setLoading(false);
          }
          return;
        }

        // If no token, try server-side cookie session check if endpoint provided
        if (!authCheck) {
          if (mounted) {
            setAuthed(false);
            setLoading(false);
          }
          return;
        }

        const res = await axios.get(authCheck, { withCredentials: true });
        if (mounted) setAuthed(res.status === 200);
      } catch (err) {
        if (mounted) setAuthed(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, [authCheck, url]);

  if (loading) return <div className="p-4">Checking authentication...</div>;
  if (!authed) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default RequireAuth;
