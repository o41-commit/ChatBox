import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { applyTheme } from "../utils/theme";

const Register = () => {
  const [formData, setFormData] = useState({
    userName: "",
    Name: "",
    email: "",
    Password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(""); // State to hold backend error messages
  const [buttonText, setButtonText] = useState("Create account");
  const navigate = useNavigate();

  const url = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset errors
    setButtonText("Creating account...");

    // Trim whitespace from username before submitting
    const payload = {
      ...formData,
      userName: formData.userName.trim(),
    };

    try {
      const response = await axios.post(`${url}/register`, payload, {
        withCredentials: true,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        if (response.data.theme) applyTheme(response.data.theme);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
      // Grab the response error message from backend (e.g., "Username already taken")
      const backendMessage = error.response?.data?.message || "Registration failed. Please try again.";
      setError(backendMessage);
    } finally {
      setButtonText("Create account");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.16),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#052e16_40%,_#0f172a_100%)] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center">
        <div className="w-full max-w-xl rounded-[2rem] border border-emerald-400/20 bg-slate-950/75 p-8 shadow-[0_35px_90px_rgba(2,8,23,0.72)] backdrop-blur-xl sm:p-10">
          <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-sm shadow-emerald-500/10">
            <span className="text-lg font-bold text-white">ChatBox</span>
            <span className="text-emerald-200">Premium messaging hub</span>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Create account
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-white">
            Join ChatBox today
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Securely register and get started with premium conversations.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                placeholder="Choose a username"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
                required
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-300"
                htmlFor="name"
              >
                Name
              </label>
              <input
                id="name"
                name="Name"
                type="text"
                value={formData.Name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
                required
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-300"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
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
                placeholder="Create a password"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
                required
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-300"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
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
              {buttonText}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-emerald-300 transition hover:text-emerald-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;