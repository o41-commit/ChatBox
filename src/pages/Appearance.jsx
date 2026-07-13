import { Link } from "react-router-dom";
import { FaChevronLeft, FaPalette, FaAdjust } from "react-icons/fa";
import axios from "axios";
import { useEffect, useState } from "react";
import { applyTheme, getStoredTheme } from "../utils/theme";

const Appearance = () => {
  const url = import.meta.env.VITE_BACKEND_URL;
  const [theme, setTheme] = useState(getStoredTheme() || "light");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedTheme = getStoredTheme() || "light";
    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  const handleThemeChange = async (newTheme) => {
    if (theme === newTheme) return;

    setLoading(true);
    setMessage("");

    let appliedTheme = newTheme;
    try {
      const res = await axios.put(
        `${url}/changeTheme`,
        { theme: newTheme },
        {
          withCredentials: true,
        },
      );

      if (res?.data?.theme) {
        appliedTheme = res.data.theme;
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to update theme on server, applying locally.");
    }

    applyTheme(appliedTheme);
    setTheme(appliedTheme);
    setMessage("Theme updated successfully.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100  dark:text-slate-100 font-poppins p-4">
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
                Design Lab
              </p>

              <h1 className="mt-4 text-3xl font-semibold text-gray-900">
                Appearance
              </h1>

              <p className="mt-2 text-gray-500">
                Personalize your app look and feel with themes, accents and
                layout options.
              </p>
            </div>

            <div className="rounded-3xl bg-gray-50 p-4 shadow-sm sm:w-80">
              <p className="text-sm uppercase tracking-[0.18em] text-gray-500">
                Current Style
              </p>

              <p className="mt-3 text-3xl font-semibold text-gray-900 capitalize">
                {theme} Mode
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {theme === "dark"
                  ? "A premium dark interface that is easy on your eyes."
                  : "A bright, clean interface for everyday use."}
              </p>
            </div>
          </div>

          {message && (
            <div className="mt-6 rounded-xl bg-green-100 dark:bg-green-900/30 px-4 py-3 text-green-700 dark:text-green-300">
              {message}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current Theme
              </p>

              <p className="mt-1 text-xl font-semibold text-gray-500 capitalize">{theme}</p>
            </div>

            <div className="flex gap-3">
              <button
                disabled={loading}
                onClick={() => handleThemeChange("light")}
                className={`rounded-2xl px-5 py-2 font-semibold transition ${
                  theme === "light"
                    ? "bg-green-600 text-white"
                    : "bg-white dark:bg-slate-800 text-gray-800 dark:text-white border"
                }`}
              >
                Light
              </button>

              <button
                disabled={loading}
                onClick={() => handleThemeChange("dark")}
                className={`rounded-2xl px-5 py-2 font-semibold transition ${
                  theme === "dark"
                    ? "bg-green-600 text-white"
                    : "bg-white dark:bg-slate-800 text-gray-800 dark:text-white border"
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-gray-50 dark:bg-[#071224] p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <FaPalette className="text-green-600" />
                <h2 className="text-lg font-semibold">Dark Theme</h2>
              </div>

              <p className="mt-4 text-gray-500 dark:text-gray-400">
                A modern dark interface for comfortable night-time use.
              </p>

              <button
                onClick={() => handleThemeChange("dark")}
                className="mt-6 w-full rounded-2xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700 transition"
              >
                {theme === "dark" ? "Selected" : "Select"}
              </button>
            </div>

            <div className="rounded-3xl bg-gray-50 dark:bg-[#071224] p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <FaPalette className="text-green-600" />
                <h2 className="text-lg font-semibold">Light Theme</h2>
              </div>

              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Bright and clean workspace with maximum readability.
              </p>

              <button
                onClick={() => handleThemeChange("light")}
                className="mt-6 w-full rounded-2xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700 transition"
              >
                {theme === "light" ? "Selected" : "Select"}
              </button>
            </div>

            <div className="rounded-3xl bg-gray-50 dark:bg-[#071224] p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <FaAdjust className="text-green-600" />
                <h2 className="text-lg font-semibold">Adaptive Mode</h2>
              </div>

              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Easily switch themes whenever you want from this page.
              </p>

              <button className="mt-6 w-full rounded-2xl bg-gray-200 dark:bg-slate-700 py-3 font-semibold cursor-default">
                Available
              </button>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-green-50 dark:bg-[#071224] p-6">
            <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
              <FaAdjust />
              <span>
                Your appearance preference is automatically saved and applied
                across your account.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appearance;
