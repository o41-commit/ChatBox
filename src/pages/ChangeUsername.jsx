import { Link, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaUserAlt } from "react-icons/fa";
import axios from "axios";
import { useState, useEffect } from "react";

const ChangeUsername = () => {
  const [formData, setFormData] = useState();
  const [button, setButton] = useState("Save new username");
  const [message, setMessage] = useState("");
  const [data, setData] = useState("");
  const [messageType, setMessageType] = useState("success");
  const url = import.meta.env.VITE_BACKEND_URL;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const navigate = useNavigate();

  const getInfo = async () => {
    try {
      const response = await axios.get(`${url}/profile`, {
        withCredentials: true,
      });

      setData(response.data);
      // console.log(data);
    } catch (error) {
      console.error(error);

      if (error.response.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setButton("Saving username");
      const response = await axios.post(`${url}/changeInfo`, formData, {
        withCredentials: true,
      });
      setMessage(response.data?.message || "Username updated successfully.");
      setMessageType("success");
      //   console.log("formData:", formData);
      //   console.log("response data:", response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to update username. Please try again.",
      );
      setMessageType("error");
      console.error("Error when updating Profile", error);
    } finally {
      setButton("Save new username");
    }
  };

  useEffect(() => {
    getInfo();
  }, []);
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
                Premium Settings
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-gray-900">
                Change Username
              </h1>
              <p className="mt-2 text-gray-500">
                Give your profile a stronger presence by choosing a fresh
                username.
              </p>
            </div>
            <div className="rounded-3xl bg-gray-50 p-4 text-gray-700 shadow-sm sm:w-72">
              <p className="text-sm uppercase tracking-[0.18em] text-gray-500">
                Profile signal
              </p>
              <p className="mt-3 text-2xl font-semibold text-gray-900">
                Active
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Your display name is visible to friends and groups.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-gray-50 p-6">
              <p className="text-sm font-medium text-gray-600">
                Current username
              </p>
              <div className="mt-3 cursor-not-allowed rounded-2xl bg-white px-4 py-3 text-gray-900">
                {data.username || "no username found"}
              </div>
            </div>
            <div className="rounded-3xl bg-gray-50 p-6">
              <p className="text-sm font-medium text-gray-600">
                Suggested handle
              </p>
              <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-gray-900">
                @dev.nado
              </div>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                New username
              </label>
              <input
                type="text"
                placeholder="Enter new username"
                name="UserName"
                onChange={handleChange}
                className="mt-3 w-full rounded-3xl border border-gray-300 bg-gray-50 px-4 py-4 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              />
            </div>

            <div className="rounded-3xl bg-green-50 p-4 text-green-700">
              <p className="text-sm font-semibold">Tips</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>• Keep it short and memorable.</li>
                <li>• Use letters, numbers, and dots.</li>
                <li>• Avoid special characters for best compatibility.</li>
              </ul>
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

export default ChangeUsername;
