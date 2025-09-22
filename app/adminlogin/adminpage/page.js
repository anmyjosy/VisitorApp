"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";
import { supabase } from "../../../lib/supabaseClient";

// Simple stat card component
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center space-x-4">
    <div className="bg-purple-100 text-purple-600 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// Navigation card component
const NavButtonCard = ({ title, icon, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center space-x-4 text-left w-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
  >
    <div className="bg-purple-100 text-purple-600 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-lg font-bold text-gray-900">{title}</p>
    </div>
  </button>
);

ChartJS.register(ArcElement, Tooltip, Legend, Colors);

const pieOptions = {
  plugins: {
    legend: { labels: { color: "#4B5563" } },
  },
};

// Tooltip component to show details on hover
const ActivityTooltip = ({ reservation, children }) => {
  const [show, setShow] = useState(false); // State to control tooltip visibility
  const tooltipRef = useRef(null); // Ref to the tooltip container

  // Function to handle clicks outside the tooltip to close it
  const handleClickOutside = (event) => {
    if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
      setShow(false);
    }
  };

  useEffect(() => {
    // Add event listener when the tooltip is shown
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    // Clean up the event listener when the component unmounts or tooltip is hidden
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show]);

  const renderDetails = () => {
    if (!reservation.details) return <p>No details available.</p>;

    switch (reservation.purpose) {
      case "visit":
        return (
          <>
            <p><strong>Friend:</strong> {reservation.details.friend_name}</p>
            <p><strong>Friend's Email:</strong> {reservation.details.friend_email}</p>
            <p><strong>Purpose:</strong> {reservation.details.purpose}</p>
          </>
        );
      case "pitch":
        return (
          <>
            <p><strong>Company:</strong> {reservation.details.company_name}</p>
            <p><strong>Title:</strong> {reservation.details.pitch_title}</p>
          </>
        );
      case "interview":
        return (
          <>
            <p><strong>Company:</strong> {reservation.details.company}</p>
            <p><strong>Position:</strong> {reservation.details.position}</p>
          </>
        );
      case "tech":
        return (
          <>
            <p><strong>Event:</strong> {reservation.details.event_name}</p>
            <p><strong>Role:</strong> {reservation.details.role_of_interest}</p>
          </>
        );
      default:
        return <p>Details for '{reservation.purpose}'</p>;
    }
  };

  return (
    <div className="relative" ref={tooltipRef}>
      <div onClick={() => setShow(!show)} className="inline-block">
        {children}
      </div>
      {show && (
        <div className="absolute z-10 w-64 p-4 mt-2 text-sm text-gray-800 bg-white border border-gray-200 rounded-lg shadow-xl left-0">
          <h4 className="mb-2 text-md font-bold text-[#552483] capitalize">{reservation.purpose} Details <button onClick={() => setShow(false)} className="float-right font-normal text-gray-500 hover:text-black">✕</button></h4>
          <div className="space-y-1 text-gray-600">{renderDetails()}</div>
        </div>
      )}
    </div>
  );
};

// Reservation Row showing all details
const ReservationRow = ({ reservation }) => {
  // status color
  let statusColor = "text-yellow-400";
  if (reservation.status === "Checked In") statusColor = "text-green-400";
  else if (reservation.status === "Checked Out") statusColor = "text-blue-400";
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="p-4 text-gray-700">
        <ActivityTooltip reservation={reservation}>
          <span className="cursor-pointer">{reservation.email}</span>
        </ActivityTooltip>
      </td>
      <td className="p-4 text-gray-700">{reservation.name}</td>
      <td className="p-4 text-gray-700 capitalize">{reservation.purpose}</td>
      <td className="p-4">
        <span className={`font-semibold ${statusColor}`}>
          {reservation.status}
        </span>
      </td>
      <td className="p-4 text-gray-500">
        {reservation.created_at
          ? new Date(reservation.created_at).toLocaleString()
          : "-"}
      </td>
      <td className="p-4 text-gray-500">
        {reservation.check_in
          ? new Date(reservation.check_in).toLocaleString()
          : "-"}
      </td>
      <td className="p-4 text-gray-500">
        {reservation.check_out
          ? new Date(reservation.check_out).toLocaleString()
          : "-"}
      </td>
    </tr>
  );
};

// User Row for the All Users table
const UserRow = ({ user }) => (
  <tr className="border-b border-gray-200 hover:bg-gray-50">
    <td className="p-4 text-gray-700">{user.name}</td>
    <td className="p-4 text-gray-700">{user.email}</td>
    <td className="p-4 text-gray-700">{user.company}</td>
    <td className="p-4 text-gray-700">{user.address}</td>
    <td className="p-4 text-gray-500">
      {user.created_at ? new Date(user.created_at).toLocaleString() : "-"}
    </td>
  </tr>
);

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [latestActivity, setLatestActivity] = useState([]);
  const [filteredActivity, setFilteredActivity] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [userNameFilter, setUserNameFilter] = useState("");
  const [pieChartData, setPieChartData] = useState({
    labels: [],
    datasets: [],
  });

  // Memoize the filtered recent activity to prevent re-calculation on every render
  const filteredDisplayActivity = useMemo(() => {
    let filtered = recentActivity;

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter((item) => {
        if (!item.created_at) return false;
        // Converts the item's date to 'YYYY-MM-DD' format for comparison
        const itemDate = new Date(item.created_at).toLocaleDateString("en-CA");
        return itemDate === dateFilter;
      });
    }

    // Filter by search term (email)
    if (searchFilter) {
      filtered = filtered.filter((item) =>
        item.email.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }

    return filtered;

  }, [recentActivity, dateFilter, searchFilter]);

  // Memoize the filtered users to prevent re-calculation on every render
  const filteredUsers = useMemo(() => {
    if (!userNameFilter) {
      return allUsers;
    }
    return allUsers.filter((user) =>
      user.name.toLowerCase().includes(userNameFilter.toLowerCase())
    );
  }, [allUsers, userNameFilter]);

  const clearDateFilter = () => {
    setDateFilter("");
  };

  useEffect(() => {
    // This effect now only fetches data. Filtering is handled by useMemo.
    const fetchData = async () => {
      setLoading(true);
      const { count: userCount, data: usersData, error: userError } =
        await supabase.from("users").select("*", { count: "exact" });

      // fetch recent activity (all columns)
      const { data: recentData, error: recentError } = await supabase
        .from("recent")
        .select("*")
        .order("id", { ascending: false })
        .limit(20);

      if (userError) console.error("Error fetching users:", userError);
      if (recentError) console.error("Error fetching recent activity:", recentError);

      let allActivity = recentData || [];

      // Fetch details for each recent activity item
      const tableMap = {
        visit: "visitlogs",
        pitch: "business_pitch",
        interview: "interview",
        tech: "tech_event",
      };

      const detailedActivityPromises = allActivity.map(async (activity) => {
        const tableName = tableMap[activity.purpose];
        if (!tableName) return { ...activity, details: null };

        const { data: details, error: detailsError } = await supabase
          .from(tableName)
          .select("*")
          .eq("user_email", activity.email)
          .eq("created_at", activity.created_at) // Match on the original creation timestamp
          .single();


        return { ...activity, details };
      });

      const detailedActivity = await Promise.all(detailedActivityPromises);

      // Determine the latest status for each user
      const latestUserStatus = new Map();
      // Use detailedActivity here to ensure the latest item has details
      for (const item of detailedActivity) {
        if (!latestUserStatus.has(item.email)) {
          latestUserStatus.set(item.email, item);
        }
      }
      const latestActivityData = Array.from(latestUserStatus.values());
      setLatestActivity(latestActivityData);

      // Process data for Pie Chart
      const statusCounts = latestActivityData.reduce((acc, item) => {
        if (item.status) {
          acc[item.status] = (acc[item.status] || 0) + 1;
        }
        return acc;
      }, {});

      // Filter the list of latest statuses for the "Current Status" view
      setFilteredActivity(latestActivityData.filter((item) => item.status === statusFilter));

      setPieChartData({
        labels: Object.keys(statusCounts),
        datasets: [
          {
            label: "Activity Status",
            data: Object.values(statusCounts),
            backgroundColor: [
              "rgba(251, 191, 36, 0.7)", // Pending (Yellow)
              "rgba(52, 211, 153, 0.7)", // Checked In (Green)
              "rgba(96, 165, 250, 0.7)", // Checked Out (Blue)
              "rgba(156, 163, 175, 0.7)", // Other (Gray)
            ],
            borderColor: "#FFFFFF",
            borderWidth: 2,
          },
        ],
      });

      setStats({
        users: userCount || 0,
      });
      setAllUsers(usersData || []);
      setRecentActivity(detailedActivity); // Use data with details
      setLoading(false);
    };

    fetchData();
  }, []); // Fetch data only once on component mount

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setFilteredActivity(latestActivity.filter((item) => item.status === status));
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    router.push("/adminlogin");
  };

  return (
    <div className="min-h-screen bg-purple-100 text-gray-800">
      <nav className="sticky top-0 z-50 flex justify-between items-center px-6 md:px-20 py-4 bg-[#552483] shadow-md text-white">
        <h1 className="text-xl font-bold text-white">VisitorApp - Admin</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-md text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
        >
          Logout
        </button>
      </nav>

      <div className="p-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left - 2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity Table */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search by email..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-purple-500 focus:border-purple-500 w-full"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-purple-500 focus:border-purple-500 w-full"
                    />
                    {dateFilter && (
                      <button onClick={clearDateFilter} className="text-gray-500 hover:text-black" title="Clear filter">
                        &#x2715;
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto max-h-[374px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase">
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Purpose</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Created At</th>
                      <th className="p-4 font-semibold">Check In</th>
                      <th className="p-4 font-semibold">Check Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center p-8">
                          Loading...
                        </td>
                      </tr>
                    ) : (
                      filteredDisplayActivity.map((item) => (
                        <ReservationRow key={item.id} reservation={item} />
                      ))
                    )}
                    {!loading && filteredDisplayActivity.length === 0 && (
                      <tr><td colSpan="7" className="text-center p-8 text-gray-500">No activities found for the selected filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* All Users Table */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={userNameFilter}
                  onChange={(e) => setUserNameFilter(e.target.value)}
                  className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-auto"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase">
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Company</th>
                      <th className="p-4 font-semibold">Address</th>
                      <th className="p-4 font-semibold">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center p-8">
                          Loading...
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => <UserRow key={user.id} user={user} />)
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar (Right - 1/3 width) */}
          <div className="space-y-8">
            {/* Stat Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              <StatCard
                title="Total Users"
                value={loading ? "..." : stats.users}
                icon={"👥"}
              />
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">
                Activity Distribution
              </h2>
              {loading ? (
                <p>Loading Chart...</p>
              ) : (
                <div className="w-full max-w-[250px] mx-auto">
                  <Pie data={pieChartData} options={pieOptions} />
                </div>
              )}
            </div>

            {/* Status List */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Current Status</h2>
                <div className="flex flex-wrap gap-2">
                  {["Pending", "Checked In", "Checked Out"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusFilterChange(status)}
                      className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                        statusFilter === status
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <ul className="space-y-3 h-64 overflow-y-auto pr-2">
                {loading ? (
                  <p>Loading users...</p>
                ) : filteredActivity.length > 0 ? (
                  filteredActivity.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                    >
                      <span className="font-medium text-gray-800">{item.name}</span>
                      <span className="text-sm text-gray-500">{item.purpose}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 text-center mt-8">No users with status "{statusFilter}"</p>
                )}
              </ul>
            </div>

            {/* Navigation Cards */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">View Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <NavButtonCard
                  title="Visits"
                  icon="🚪"
                  onClick={() => router.push("/adminlogin/adminpage/visits")}
                />
                <NavButtonCard
                  title="Tech Events"
                  icon="💻"
                  onClick={() => router.push("/adminlogin/adminpage/techevents")}
                />
                <NavButtonCard
                  title="Interviews"
                  icon="🎙️"
                  onClick={() => router.push("/adminlogin/adminpage/interviews")}
                />
                <NavButtonCard
                  title="Business Pitches"
                  icon="📈"
                  onClick={() => router.push("/adminlogin/adminpage/pitches")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
