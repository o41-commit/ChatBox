import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaImage, FaSpinner, FaTimes } from "react-icons/fa";
import axios from "axios";

const CreateGroup = () => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    groupType: "public",
    profilePicture: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profilePicture: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      profilePicture: null,
    }));
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Group name is required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Group description is required");
      return;
    }

    try {
      setLoading(true);

      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("groupType", formData.groupType);
      if (formData.profilePicture) {
        form.append("profilePicture", formData.profilePicture);
      }

      const response = await axios.post(`${backendUrl}/createGroup`, form, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Navigate to add members page with the new group ID
      navigate(`/dashboard/group/${response.data.groupId}/add-members`, {
        state: { groupName: formData.name },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
      console.error("Error creating group:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-poppins min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard/groups")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 transition"
        >
          <FaArrowLeft /> Back to Groups
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Create a New Group
          </h1>
          <p className="text-gray-600">
            Build a community and connect with like-minded people
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-start gap-4">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Picture Upload */}
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
            <label className="block font-semibold text-gray-800 mb-4">
              Group Picture
            </label>

            {preview ? (
              <div className="relative w-full max-w-xs mx-auto mb-6">
                <img
                  src={preview}
                  alt="Group preview"
                  className="w-full aspect-square rounded-2xl object-cover border-4 border-blue-600"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition shadow-lg"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <label className="relative block w-full max-w-xs mx-auto mb-6 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="border-4 border-dashed border-blue-300 rounded-2xl p-12 text-center hover:border-blue-600 hover:bg-blue-50 transition">
                  <FaImage className="text-5xl text-blue-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold">
                    Click to upload group picture
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </label>
            )}
          </div>

          {/* Group Name */}
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
            <label className="block font-semibold text-gray-800 mb-3">
              Group Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Web Developers Community"
              maxLength="50"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-600 focus:outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-2">
              {formData.name.length}/50 characters
            </p>
          </div>

          {/* Group Description */}
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
            <label className="block font-semibold text-gray-800 mb-3">
              Group Description <span className="text-red-600">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what this group is about..."
              maxLength="300"
              rows="5"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-600 focus:outline-none transition resize-none"
            ></textarea>
            <p className="text-xs text-gray-500 mt-2">
              {formData.description.length}/300 characters
            </p>
          </div>

          {/* Group Type */}
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
            <label className="block font-semibold text-gray-800 mb-4">
              Group Type <span className="text-red-600">*</span>
            </label>
            <div className="space-y-3">
              <label
                className="flex items-center p-4 border-2 border-gray-200 rounded-2xl hover:border-blue-600 hover:bg-blue-50 cursor-pointer transition"
                style={{
                  borderColor: formData.groupType === "public" ? "#2563eb" : "",
                }}
              >
                <input
                  type="radio"
                  name="groupType"
                  value="public"
                  checked={formData.groupType === "public"}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600"
                />
                <div className="ml-4">
                  <p className="font-semibold text-gray-800">Public</p>
                  <p className="text-sm text-gray-600">
                    Anyone can discover and join this group
                  </p>
                </div>
              </label>

              <label
                className="flex items-center p-4 border-2 border-gray-200 rounded-2xl hover:border-blue-600 hover:bg-blue-50 cursor-pointer transition"
                style={{
                  borderColor:
                    formData.groupType === "private" ? "#2563eb" : "",
                }}
              >
                <input
                  type="radio"
                  name="groupType"
                  value="private"
                  checked={formData.groupType === "private"}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600"
                />
                <div className="ml-4">
                  <p className="font-semibold text-gray-800">Private</p>
                  <p className="text-sm text-gray-600">
                    Only invited members can access this group
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/groups")}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-4 rounded-2xl font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" /> Creating...
                </>
              ) : (
                "Create Group"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
