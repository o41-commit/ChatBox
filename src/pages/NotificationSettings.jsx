import { Link } from "react-router-dom";
import { FaBell, FaChevronLeft, FaMoon } from "react-icons/fa";

const NotificationSettings = () => {
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
                Smart Alerts
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-gray-900">
                Notification Settings
              </h1>
              <p className="mt-2 text-gray-500">
                Control which notifications reach you across messages, groups,
                and friend requests.
              </p>
            </div>
            <div className="rounded-3xl bg-gray-50 p-4 text-gray-700 shadow-sm sm:w-80">
              <p className="text-sm uppercase tracking-[0.18em] text-gray-500">
                Focus mode
              </p>
              <p className="mt-3 text-3xl font-semibold text-gray-900">
                Do not disturb
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Quiet mode silences all alerts instantly.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {[
              { label: "Message alerts", value: true },
              { label: "Friend requests", value: true },
              { label: "Group updates", value: false },
              { label: "Mention alerts", value: true },
            ].map((item, index) => (
              <div key={index} className="rounded-3xl bg-gray-50 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {item.label}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                      {item.value ? "Enabled" : "Muted"}
                    </p>
                  </div>
                  <div
                    className={
                      item.value
                        ? "rounded-full bg-green-100 px-4 py-2 text-green-700"
                        : "rounded-full bg-gray-200 px-4 py-2 text-gray-500"
                    }
                  >
                    {item.value ? "On" : "Off"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl bg-green-50 p-6 text-green-700">
            <div className="flex items-center gap-3 text-sm">
              <FaMoon className="text-green-600" />
              <span>
                Enable "Do not disturb" to pause notifications during work or
                sleep hours.
              </span>
            </div>
          </div>

          <button className="mt-8 w-full rounded-3xl bg-green-600 px-5 py-4 text-base font-semibold text-white shadow-md transition hover:bg-green-700">
            Save notification preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
