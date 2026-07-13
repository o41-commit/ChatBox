import { Link } from "react-router-dom";
import { FaChevronLeft, FaShieldAlt, FaLock } from "react-icons/fa";

const PrivacySecurity = () => {
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
                Privacy Hub
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-gray-900">
                Privacy & Security
              </h1>
              <p className="mt-2 text-gray-500">
                Review your privacy controls, session settings, and trusted
                devices to keep your profile protected.
              </p>
            </div>
            <div className="rounded-3xl bg-gray-50 p-4 text-gray-700 shadow-sm sm:w-80">
              <p className="text-sm uppercase tracking-[0.18em] text-gray-500">
                Safety
              </p>
              <p className="mt-3 text-3xl font-semibold text-gray-900">
                Secure
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Your account is protected by email verification and device
                monitoring.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-gray-50 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Data visibility
              </h2>
              <p className="mt-3 text-gray-500">
                Choose who can see your profile details and activity status.
              </p>
              <div className="mt-5 space-y-3">
                {[
                  "Profile visible to friends only",
                  "Activity status hidden",
                  "Searchable by email disabled",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-gray-200 bg-white p-4 text-sm text-gray-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-gray-50 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Secure sessions
              </h2>
              <p className="mt-3 text-gray-500">
                Manage active logins and sign out from devices remotely.
              </p>
              <div className="mt-5 space-y-3">
                {[
                  "Active on iPhone 12",
                  "Last used: 2 hours ago",
                  "Location: New York, US",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-gray-200 bg-white p-4 text-sm text-gray-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-green-50 p-6 text-green-700">
            <div className="flex items-center gap-3 text-sm">
              <FaLock className="text-green-600" />
              <span>
                We recommend enabling two-factor authentication and reviewing
                trusted devices every month.
              </span>
            </div>
          </div>

          <button className="mt-8 w-full rounded-3xl bg-green-600 px-5 py-4 text-base font-semibold text-white shadow-md transition hover:bg-green-700">
            Update privacy preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySecurity;
