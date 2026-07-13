import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { applyTheme } from "../utils/theme";

const Login = () => {
  const [formData, setFormData] = useState({ userName: "", Password: "" });
  const [error, setError] = useState(""); // State to store backend error messages
  const navigate = useNavigate();
  const [button, setButton] = useState("Sign in");
  const url = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButton("Signing in...");
    setError(""); // Clear previous errors on new attempt

    // Trim whitespace from the username before sending
    const payload = {
      userName: formData.userName.trim(),
      Password: formData.Password,
    };

    try {
      const response = await axios.post(`${url}/login`, payload, {
        withCredentials: true,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        if (response.data.theme) applyTheme(response.data.theme);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Grab the error message sent from your backend if available
      const backendMessage = error.response?.data?.message || "Incorrect username or password. Please try again.";
      setError(backendMessage);
    } finally {
      setButton("Sign in");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#052e16_40%,_#0f172a_100%)] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-slate-950/75 shadow-[0_35px_90px_rgba(2,8,23,0.72)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-500/20 via-slate-900 to-lime-500/20 p-10 lg:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.15)_0%,_transparent_70%)]" />
            <div className="relative max-w-md">
              <p className="mb-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200">
                Premium conversations
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white">
                Welcome back to your ChatBox.
              </h1>
              <p className="mt-4 text-lg text-slate-300">
                Sign in to continue chatting, sharing updates, and building your
                network.
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-10 lg:p-12">
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-sm shadow-emerald-500/10">
                <span className="text-lg font-bold text-white">ChatBox</span>
                <span className="text-emerald-200">Premium messaging hub</span>
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
                Welcome back
              </p>
              <h2 className="mt-3 text-4xl font-semibold text-white">
                Sign in to ChatBox
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Securely log in and continue your premium conversations.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-300"
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="userName"
                  type="text"
                  value={formData.userName}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
                  required
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-300"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="Password"
                  type="password"
                  value={formData.Password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
                  required
                />
              </div>

              {/* Error Message Box */}
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:opacity-90"
              >
                {button}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-emerald-300 transition hover:text-emerald-200"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;