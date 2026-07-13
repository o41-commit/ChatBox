import { Link } from "react-router-dom";
import { FaChevronLeft, FaLock, FaShieldAlt } from "react-icons/fa";
import axios from "axios";
import { useState } from "react";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    OldPassword: "",
    ConfirmPassword: "",
  });
  const [button, setButton] = useState("Save password");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const url = import.meta.env.VITE_BACKEND_URL;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setButton("Saving password");
      const response = await axios.post(`${url}/changePassword`, formData, {
        withCredentials: true,
      });

      setMessage(response.data?.message || "Password updated");
      setMessageType("success");
      console.log("formData:", formData);
      console.log("response data:", response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to update password. Please try again.",
      );
      setMessageType("error");
      console.error("Error when updating Profile", error);
    } finally {
      setButton("Save password");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 font-poppins p-4">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/dashboard/settings"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition"
        >
          <FaChevronLeft />
          Back to Settings
        </Link>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                Security Center
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-gray-900">
                Change Password
              </h1>
              <p className="mt-2 text-gray-500">
                Strengthen your account with a fresh password. Use a combination
                of letters, numbers, and symbols for best protection.
              </p>
            </div>
            <div className="rounded-3xl bg-gray-50 p-4 text-gray-700 shadow-sm sm:w-80">
              <p className="text-sm uppercase tracking-[0.18em] text-gray-500">
                Strong
              </p>
              <p className="mt-3 text-3xl font-semibold text-gray-900">
                Password health
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Your current password is secure, but renewing it regularly is
                best practice.
              </p>
            </div>
          </div>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            {message ? (
              <div
                className={`rounded-3xl px-5 py-4 text-sm ${
                  messageType === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            ) : null}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current password
              </label>
              <input
                type="password"
                name="OldPassword"
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-3 w-full rounded-3xl border border-gray-300 bg-gray-100 px-4 py-4 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                name="newPassword"
                onChange={handleChange}
                className="mt-3 w-full rounded-3xl border border-gray-300 bg-gray-100 px-4 py-4 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                type="password"
                placeholder="Repeat new password"
                name="ConfirmPassword"
                onChange={handleChange}
                className="mt-3 w-full rounded-3xl border border-gray-300 bg-gray-100 px-4 py-4 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              />
            </div>
            <div className="rounded-3xl bg-green-50 p-5 text-green-700">
              <div className="flex items-center gap-3 text-sm">
                <FaShieldAlt className="text-green-600" />
                <span>
                  Use at least 12 characters and avoid reusing old passwords.
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-3xl bg-green-600 px-5 py-4 text-base font-semibold text-white shadow-md transition hover:bg-green-700"
            >
              {button}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
