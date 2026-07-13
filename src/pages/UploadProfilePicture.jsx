import { useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaUpload, FaImage } from "react-icons/fa";
import axios from "axios";

const UploadProfilePicture = () => {
  const [file, setFile] = useState(null);
  const [buttonText, setButtonText] = useState("Upload picture");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const url = import.meta.env.VITE_BACKEND_URL;

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please choose a profile picture before uploading.");
      setMessageType("error");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      setButtonText("Uploading picture...");
      const response = await axios.post(
        `${url}/uploadProfilePicture`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );
      console.log(formData);
      console.log(response);

      setMessage(
        response.data?.message || "Profile picture uploaded successfully.",
      );
      setMessageType("success");
      console.log("upload response:", response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Upload failed. Please try again.",
      );
      setMessageType("error");
      console.error("Upload error:", error);
    } finally {
      setButtonText("Upload picture");
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
                Profile Photo
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-gray-900">
                Upload Profile Picture
              </h1>
              <p className="mt-2 text-gray-500">
                Choose a high-quality image and upload it to update your avatar.
              </p>
            </div>
            <div className="rounded-3xl bg-gray-50 p-4 text-gray-700 shadow-sm sm:w-80">
              <p className="text-sm uppercase tracking-[0.18em] text-gray-500">
                Premium avatar
              </p>
              <p className="mt-3 text-3xl font-semibold text-gray-900">
                High-quality upload
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Use JPG, PNG or WEBP for the best results.
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

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm">
                  <FaImage className="text-green-600 text-2xl" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Upload your avatar
                  </p>
                  <p className="text-sm text-gray-500">
                    Recommended size: 400x400, max 5MB.
                  </p>
                </div>
              </div>

              <label className="mt-6 flex cursor-pointer items-center justify-center rounded-3xl border border-dashed border-green-300 bg-white px-4 py-5 text-center text-sm text-green-700 transition hover:border-green-400 hover:bg-green-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span>{file ? file.name : "Choose profile picture"}</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-3xl bg-green-600 px-5 py-4 text-base font-semibold text-white shadow-md transition hover:bg-green-700"
            >
              {buttonText}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadProfilePicture;
