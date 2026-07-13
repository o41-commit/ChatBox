import { Link } from "react-router-dom";
import { FaChevronLeft, FaEnvelope, FaShieldAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";

const ChangeEmail = () => {
  const [Email, setEmail] = useState({ Email: "" });
  const [data, setData] = useState(null)
  const [button, setButton] = useState("Update Profile");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const url = import.meta.env.VITE_BACKEND_URL;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmail((prev) => ({ ...prev, [name]: value }));
  };

  const getInfo = async () => {
    try {
      const response = await axios.get(`${url}/profile`, {
        withCredentials: true,
      });

      setData(response.data)
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setButton("Updating Profile");
      const response = await axios.post(`${url}/changeInfo`, Email, {
        withCredentials: true,
      });
      setMessage(response.data?.message || "Email updated successfully.");
      setMessageType("success");

      if(response.status === 200){
        getInfo()
      }

      // console.log("formData:", Email);
      // console.log("response data:", response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to update email. Please try again.",
      );
      setMessageType("error");
      console.error("Error when updating Profile", error);
    } finally {
      setButton("Update Profile");
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
                Secure Email
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-gray-900">
                Change Email Address
              </h1>
              <p className="mt-2 text-gray-500">
                Update your login email and keep your inbox secure. We’ll
                preserve your account history while you change contact details.
              </p>
            </div>
            <div className="rounded-3xl bg-gray-50 p-4 text-gray-700 shadow-sm sm:w-80">
              <p className="text-sm uppercase tracking-[0.18em] text-gray-500">
                Protected
              </p>
              <p className="mt-3 text-3xl font-semibold text-gray-900">
                2-step verification
              </p>
              <p className="mt-2 text-sm text-gray-500">
                A confirmation email will be sent after changing your address.
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
                Current email
              </label>
              <input
                type="Email"
                value={data?.email || ""}
                readOnly
                className="mt-3 w-full cursor-not-allowed rounded-3xl border border-gray-300 bg-gray-100 px-4 py-4 text-gray-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New email address
              </label>
              <input
                type="email"
                placeholder="you@domain.com"
                name="Email"
                onChange={handleChange}
                className="mt-3 w-full rounded-3xl border border-gray-300 bg-gray-100 px-4 py-4 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              />
            </div>
            <div className="rounded-3xl bg-green-50 p-5 text-green-700">
              <div className="flex items-center gap-3 text-sm">
                <FaShieldAlt className="text-green-600" />
                <span>Verification link expires in 24 hours.</span>
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

export default ChangeEmail;
