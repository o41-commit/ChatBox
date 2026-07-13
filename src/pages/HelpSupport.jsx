import { Link } from "react-router-dom";
import { FaChevronLeft, FaQuestionCircle, FaLifeRing } from "react-icons/fa";

const HelpSupport = () => {
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
                Support Center
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-gray-900">
                Help & Support
              </h1>
              <p className="mt-2 text-gray-500">
                Need assistance? Access help guides, support channels, and
                troubleshooting resources.
              </p>
            </div>
            <div className="rounded-3xl bg-gray-50 p-4 text-gray-700 shadow-sm sm:w-80">
              <p className="text-sm uppercase tracking-[0.18em] text-gray-500">
                Available
              </p>
              <p className="mt-3 text-3xl font-semibold text-gray-900">24/7</p>
              <p className="mt-2 text-sm text-gray-500">
                Reach our support team anytime for fast help.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {[
              { title: "FAQ", desc: "Find quick answers to common questions." },
              {
                title: "Live chat",
                desc: "Chat with support agents instantly.",
              },
              {
                title: "Report issue",
                desc: "Send a ticket for bugs or account problems.",
              },
            ].map((item, idx) => (
              <div key={idx} className="rounded-3xl bg-gray-50 p-6 shadow-sm">
                <div className="flex items-center gap-3 text-gray-900">
                  <FaLifeRing className="text-green-600" />
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                </div>
                <p className="mt-4 text-gray-500">{item.desc}</p>
                <button className="mt-6 rounded-3xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700">
                  Open
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl bg-green-50 p-6 text-green-700">
            <div className="flex items-center gap-3 text-sm">
              <FaQuestionCircle className="text-green-600" />
              <span>
                Our support team is ready to help with setup, billing, or
                feature questions.
              </span>
            </div>
          </div>

          <button className="mt-8 w-full rounded-3xl bg-green-600 px-5 py-4 text-base font-semibold text-white shadow-md transition hover:bg-green-700">
            Contact support
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
