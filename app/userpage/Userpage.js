"use client";
import { useState, useEffect, useContext } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { UserContext } from "../UserContext";

export default function Userpage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [currentReservation, setCurrentReservation] = useState(null);
  const [pastReservations, setPastReservations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const { setLoggedIn, setOpenHistory } = useContext(UserContext);

  useEffect(() => {
    // Expose the function to fetch history to the context
    setOpenHistory(() => fetchPastReservations);
  }, [setOpenHistory]);

  useEffect(() => {
    const sessionData = localStorage.getItem("session");
    if (!sessionData) {
      router.push("/login");
      return;
    }

    const { timestamp } = JSON.parse(sessionData);
    const tenMinutes = 10 * 60 * 1000;
    if (Date.now() - timestamp > tenMinutes) {
      localStorage.removeItem("session");
      router.push("/login");
      return;
    }

    if (setLoggedIn) {
      setLoggedIn(true);
    }

    const fetchData = async () => {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("name, company, address, dob")
        .eq("email", email)
        .single();

      if (userError || !user) {
        setMessage("Could not retrieve user information.");
        setLoading(false);
        return;
      }

      if (!user.name || !user.company || !user.address || !user.dob) {
        router.push(`/details?email=${encodeURIComponent(email)}`);
        return;
      }

      const { data: visits } = await supabase
        .from("visitlogs")
        .select("*", { count: "exact" })
        .eq("user_email", email)
        .is("check_out", null)
        .order("created_at", { ascending: false })
        .limit(1);

      const { data: pitches } = await supabase
        .from("business_pitch")
        .select("*", { count: "exact" })
        .eq("user_email", email)
        .is("check_out", null)
        .order("created_at", { ascending: false })
        .limit(1);

      const { data: interview } = await supabase
        .from("interview")
        .select("*", { count: "exact" })
        .eq("user_email", email)
        .is("check_out", null)
        .order("created_at", { ascending: false })
        .limit(1);

      const { data: techEvents } = await supabase
        .from("tech_event")
        .select("*", { count: "exact" })
        .eq("user_email", email)
        .is("check_out", null)
        .order("created_at", { ascending: false })
        .limit(1);

      let active = null;
      if (visits && visits.length > 0) {
        active = { type: "visit", data: visits[0] };
      } else if (pitches && pitches.length > 0) {
        active = { type: "pitch", data: pitches[0] };
      } else if (interview && interview.length > 0) {
        active = { type: "interview", data: interview[0] };
      } else if (techEvents && techEvents.length > 0) {
        active = { type: "tech", data: techEvents[0] };
      }

      setCurrentReservation(active);
      setLoading(false);
    };

    fetchData();

    return () => {
      if (setLoggedIn) {
        setLoggedIn(false);
      }
    };
  }, [email, router, setLoggedIn]);

  const handleCheckIn = async () => {
    if (!currentReservation) return;
    const tableMap = {
      visit: "visitlogs",
      pitch: "business_pitch",
      interview: "interview",
      tech: "tech_event",
    };
    const table = tableMap[currentReservation.type];
    if (!table) return;

    const now = new Date();

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("name")
      .eq("email", email)
      .single();
    if (userError || !userData) {
      setMessage("Error fetching user name: " + (userError?.message || ""));
      return;
    }

    const userName = userData.name;

    const { error: updateError } = await supabase
      .from(table)
      .update({ check_in: now })
      .eq("id", currentReservation.data.id);
    if (updateError) {
      setMessage("Error checking in: " + updateError.message);
      return;
    }

    const { error: recentError } = await supabase.from("recent").insert({
      email: email,
      name: userName,
      check_in: now,
      status: "Checked In",
      purpose: currentReservation.type,
      created_at: currentReservation.data.created_at,
    });
    if (recentError) {
      setMessage("Error logging recent activity: " + recentError.message);
      return;
    }

    setMessage("Checked in successfully!");
    setCurrentReservation({
      ...currentReservation,
      data: { ...currentReservation.data, check_in: now },
    });
  };

  const handleCheckOut = async () => {
    if (!currentReservation) return;
    const tableMap = {
      visit: "visitlogs",
      pitch: "business_pitch",
      interview: "interview",
      tech: "tech_event",
    };
    const table = tableMap[currentReservation.type];
    if (!table) return;

    const now = new Date();

    const { error: updateError } = await supabase
      .from(table)
      .update({ check_out: now })
      .eq("id", currentReservation.data.id);
    if (updateError) {
      setMessage("Error checking out: " + updateError.message);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("name")
      .eq("email", email)
      .single();
    if (userError || !userData) {
      setMessage("Error fetching user name: " + (userError?.message || ""));
      return;
    }
    const userName = userData.name;

    await supabase.from("recent").insert({
      email: email,
      name: userName,
      check_in: currentReservation.data.check_in,
      check_out: now,
      status: "Checked Out",
      purpose: currentReservation.type,
      created_at: currentReservation.data.created_at,
    });

    setMessage("Checked out successfully!");
    setCurrentReservation(null);
  };

  const fetchPastReservations = async () => {
    if (!email) return;
    setLoading(true);

    const tables = [
      { name: "visitlogs", type: "Visit" },
      { name: "business_pitch", type: "Pitch" },
      { name: "interview", type: "Interview" },
      { name: "tech_event", type: "Tech Event" },
    ];

    try {
      const promises = tables.map((table) =>
        supabase
          .from(table.name)
          .select("*")
          .eq("user_email", email)
          .not("check_out", "is", null)
          .then(({ data, error }) => {
            if (error) throw error;
            return data.map((item) => ({ ...item, type: table.type }));
          })
      );

      const results = await Promise.all(promises);
      const allPast = results.flat();
      allPast.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setPastReservations(allPast);
    } catch (error) {
      setMessage("Error fetching past reservations: " + error.message);
      console.error("Error fetching past reservations:", error);
    } finally {
      setLoading(false);
      setIsSidebarOpen(true);
    }
  };

  const handleVisitClick = (type) => {
    if (type === "friend") {
      router.push(`/userpage/visit?email=${encodeURIComponent(email)}`);
    } else if (type === "official") {
      router.push(`/userpage/pitch?email=${encodeURIComponent(email)}`);
    } else if (type === "interview") {
      router.push(`/userpage/interview?email=${encodeURIComponent(email)}`);
    } else if (type === "tech") {
      router.push(`/userpage/tech?email=${encodeURIComponent(email)}`);
    } else {
      router.push(`/userpage?email=${encodeURIComponent(email)}`);
    }
  };

  const visitOptions = [
    { label: "Visit a Friend", value: "friend" },
    { label: "Business Pitch", value: "official" },
    { label: "Interview", value: "interview" },
    { label: "Attend Tech Event", value: "tech" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl font-semibold">
        Loading...
      </div>
    );
  }

  const formatKey = (key) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatValue = (key, value) => {
    if (value === true) return "Yes";
    if (value === false) return "No";
    if (
      (key.includes("_at") || key.includes("date")) &&
      !isNaN(new Date(value))
    ) {
      return new Date(value).toLocaleString();
    }
    return String(value);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1448932223592-d1fc686e76ea?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="People working in an office"
          layout="fill"
          objectFit="cover"
          quality={80}
          priority
          className="animate-fade-in"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/75"></div>
      </div>

      {/* Page Content */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {currentReservation ? (
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
          {/* Left Section: Ticket Details */}
          <div className="flex-1 p-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
              Visitor Pass
            </h2>
            <p className="uppercase text-indigo-600 font-bold tracking-wide mb-6">
              {currentReservation.type}
            </p>

            {/* Reservation Details */}
            <div className="space-y-3">
              {Object.entries(currentReservation.data).map(([key, value]) => {
                if (value === null || value === "" || key === "id" || key === "user_email")
                  return null;
                return (
                  <div key={key} className="grid grid-cols-3 gap-2 text-sm">
                    <span className="col-span-1 font-medium text-gray-500">
                      {formatKey(key)}:
                    </span>
                    <span className="col-span-2 font-semibold text-gray-800 text-right">
                      {formatValue(key, value)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Status Tag */}
            <div className="mt-6">
              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold ${
                  !currentReservation.data.check_in
                    ? "bg-yellow-100 text-yellow-700"
                    : !currentReservation.data.check_out
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {!currentReservation.data.check_in
                  ? "Pending"
                  : !currentReservation.data.check_out
                  ? "Checked In"
                  : "Completed"}
              </span>
            </div>
          </div>

          {/* Divider with semi-circle perforation */}
          <div className="hidden md:flex relative flex-col items-center w-1 bg-transparent">
            {/* dotted line */}
            <div className="absolute top-0 bottom-0 border-l-2 border-dotted border-gray-300"></div>

            {/* top semi-circle */}
            <div className="w-6 h-6 bg-gray-900 rounded-full absolute -left-3 -top-3"></div>

            {/* bottom semi-circle */}
            <div className="w-6 h-6 bg-gray-900 rounded-full absolute -left-3 -bottom-3"></div>
          </div>

          {/* Right Section: QR + Action */}
          <div className="w-full md:w-64 flex flex-col justify-center items-center p-8 bg-gray-50">
            {/* QR Code */}
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VisitorPass"
              alt="QR Code"
              className="w-32 h-32 rounded-lg shadow-md mb-6"
            />

            {/* Action Button */}
            {!currentReservation.data.check_in ? (
              <button
                onClick={handleCheckIn}
                className="group w-full px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <span>Check In</span>
                <span className="transform transition-transform duration-200 group-hover:translate-x-1">
                  &gt;&gt;
                </span>
              </button>
            ) : !currentReservation.data.check_out ? (
              <button
                onClick={handleCheckOut}
                className="group w-full px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                Check Out
                <span className="transform transition-transform duration-200 group-hover:translate-x-1">
                  &gt;&gt;
                </span>
              </button>
            ) : (
              <p className="text-gray-600 font-semibold">
                Reservation Completed
              </p>
            )}
          </div>
        </div>
        ) : (
          <div className="w-full max-w-2xl p-8 space-y-6 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome!</h2>
              <p className="text-gray-400 mb-8">
                You have no active reservation. Please select a reason for your visit.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {visitOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleVisitClick(option.value)}
                    className="group bg-white p-6 rounded-xl shadow-lg text-left w-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold text-gray-900">{option.label}</p>
                      <span className="text-2xl text-gray-900 font-bold transform transition-transform duration-200 group-hover:translate-x-2">
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Past Reservations Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-30 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Past Reservations</h3>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-400 hover:text-white text-3xl"
              aria-label="Close history"
            >
              &times;
            </button>
          </div>
          <div className="flex-grow overflow-y-auto">
            {loading ? (
              <p className="text-gray-400">Loading history...</p>
            ) : pastReservations.length > 0 ? (
              <ul className="space-y-4">
                {pastReservations.map((res) => (
                  <li
                    key={res.id}
                    className="bg-gray-700/50 p-4 rounded-lg"
                  >
                    <p className="font-bold text-white">{res.type}</p>
                    <p className="text-sm text-gray-300">
                      {new Date(res.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Checked In:{" "}
                      {new Date(res.check_in).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      Checked Out:{" "}
                      {new Date(res.check_out).toLocaleTimeString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No past reservations found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
