"use client";
import { useState, useEffect, useContext, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserContext } from "../UserContext";
import Link from "next/link";

export default function Userpage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [currentReservation, setCurrentReservation] = useState(null);
  const [pastReservations, setPastReservations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [email, setEmail] = useState(null); // User's email
  const [userDetails, setUserDetails] = useState(null); // User's profile details
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Dropdown state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state

  const router = useRouter();
  const { setLoggedIn, setOpenHistory } = useContext(UserContext);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    setOpenHistory(() => fetchPastReservations);
  }, [setOpenHistory]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const sessionData = localStorage.getItem("session");
    if (!sessionData) {
      router.push("/login");
      return;
    }

    const { email: sessionEmail, timestamp } = JSON.parse(sessionData);
    const tenMinutes = 10 * 60 * 1000;
    if (Date.now() - timestamp > tenMinutes) {
      localStorage.removeItem("session");
      router.push("/login");
      return;
    }

    setEmail(sessionEmail);

    if (setLoggedIn) setLoggedIn(true);

    const fetchData = async () => {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("name, company, address, dob")
        .eq("email", sessionEmail)
        .single();

      if (userError || !user) {
        setMessage("Could not retrieve user information.");
        setLoading(false);
        return;
      }

      setUserDetails(user); // Store user details in state
      if (!user.name || !user.company || !user.address || !user.dob) {
        router.push(`/login`);
        return;
      }

      const tables = ["visitlogs", "business_pitch", "interview", "tech_event"];
      let active = null;

      for (let table of tables) {
        const { data } = await supabase
          .from(table)
          .select("*")
          .eq("user_email", sessionEmail)
          .is("check_out", null)
          .order("created_at", { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const typeMap = {
            visitlogs: "visit",
            business_pitch: "pitch",
            interview: "interview",
            tech_event: "tech",
          };
          active = { type: typeMap[table], data: data[0] };
          break;
        }
      }

      setCurrentReservation(active);
      setLoading(false);
    };

    if (sessionEmail) fetchData();

    return () => setLoggedIn && setLoggedIn(false);
  }, [router, setLoggedIn]); // email dependency removed to prevent re-fetches

  // Effect to handle clicks outside the profile dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuRef]);

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
      email,
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
      email,
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
      console.error(error);
    } finally {
      setLoading(false);
      setIsSidebarOpen(true);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("session");
    if (setLoggedIn) {
      setLoggedIn(false);
    }
    // Redirect to login after logout
    router.push("/login");
  };

  const handleVisitClick = (type) => {
    const routes = {
      friend: "/userpage/visit",
      official: "/userpage/pitch",
      interview: "/userpage/interview",
      tech: "/userpage/tech",
    };
    router.push(routes[type] || "/userpage");
  };

  const visitOptions = [
    { label: "Visit a Friend", value: "friend" },
    { label: "Business Pitch", value: "official" },
    { label: "Interview", value: "interview" },
    { label: "Attend Tech Event", value: "tech" },
  ];

  const formatKey = (key) =>
    key
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const formatValue = (key, value) => {
    if (value === true) return "Yes";
    if (value === false) return "No";
    if ((key.includes("_at") || key.includes("date")) && !isNaN(new Date(value)))
      return new Date(value).toLocaleString();
    return String(value);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Main Content */}
      <nav className="sticky top-0 z-50 flex justify-between items-center px-6 md:px-20 py-4 bg-[#552483] shadow-md text-white">
        <h1 className="text-xl font-bold text-white">VisitorApp</h1>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/">Home</Link>
            {!isSidebarOpen && (
              <button onClick={fetchPastReservations} className="hover:text-gray-200">History</button>
            )}
            <a href="#" className="hover:text-gray-200">About us</a>
            <Link href="#" className="hover:text-gray-200">Contact</Link>
          </div>
          {/* Profile Dropdown */}
          <div className="relative hidden md:block" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
            >
              {email}
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-72 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-black">
                <div className="p-4">
                  <p className="text-base font-bold text-[#552483]">{userDetails?.name}</p>
                  <p className="text-sm text-gray-500 mb-2">{email}</p>
                  <div className="text-xs space-y-1 text-gray-700">
                    <p><strong>Company:</strong> {userDetails?.company}</p>
                    <p><strong>Address:</strong> {userDetails?.address}</p>
                    <p><strong>DOB:</strong> {userDetails?.dob}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100"></div>
                <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-black hover:bg-gray-100 hover:text-red-600 font-medium">
                  Logout
                </button>
              </div>
            )}
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-[#552483] md:hidden shadow-lg text-white">
              <div className="p-4 space-y-4">
                {/* Profile Info */}
                <div className="p-4 bg-white/10 rounded-lg">
                  <p className="text-base font-bold">{userDetails?.name}</p>
                  <div className="text-xs space-y-1 text-gray-300">
                    <p><strong>Company:</strong> {userDetails?.company}</p>
                    <p><strong>Address:</strong> {userDetails?.address}</p>
                    <p><strong>DOB:</strong> {userDetails?.dob}</p>
                  </div>
                </div>

                {/* Links */}
                <div className="flex flex-col items-start space-y-2 border-t border-white/20 pt-4">
                  {!isSidebarOpen && (
                    <button onClick={() => { fetchPastReservations(); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10">
                      History
                    </button>
                  )}
                  <a href="#" className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10">About us</a>
                  <a href="#" className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10">Contact</a>
                </div>

                {/* Logout */}
                <div className="border-t border-white/20 pt-4">
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md hover:bg-red-500/50 font-medium text-black">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
      </nav>
      <div className="w-full flex flex-col items-center justify-center p-6">
        {currentReservation ? (
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-purple-200/50 shadow-xl flex flex-col md:flex-row overflow-hidden border-2 border-[#552483] mt-4 md:mt-12">
            {/* Left Section */}
            <div className="flex-1 p-6 md:p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#552483]">
                    VISITOR PASS
                  </h2>
                  <p className="font-mono text-xs text-gray-500">ADMIT ONE</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-[#552483]">NO. {String(currentReservation.data.id).padStart(6, '0')}</p>
                </div>
              </div>
              <div className="space-y-3 font-mono border-t border-b border-gray-200 py-6 my-6">
                {Object.entries(currentReservation.data).map(([key, value]) => {
                  if (value === null || value === "" || key === "id" || key === "user_email" || key === "created_at")
                    return null;
                  return (
                    <div key={key} className="grid grid-cols-3 gap-2 text-sm">
                      <span className="col-span-1 font-medium text-[#552483]">
                        {formatKey(key)}:
                      </span>
                      <span className="col-span-2 font-semibold text-black text-right">
                        {formatValue(key, value)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-gray-400 font-mono">
                Issued: {new Date(currentReservation.data.created_at).toLocaleString()}
              </div>
              
              <div className="mt-6">
                <span
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${
                    !currentReservation.data.check_in
                      ? "bg-yellow-100 text-yellow-700"
                      : !currentReservation.data.check_out
                      ? "bg-[#552483]/20 text-[#552483]"
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

            {/* Ticket Separator */}
            <div className="hidden md:flex flex-col justify-between items-center relative">
              <div className="absolute top-0 -mt-4 w-8 h-8 bg-white rounded-full border-2 border-r-0 border-[#552483]"></div>
              <div className="h-full w-0 border-l-2 border-dashed border-gray-300"></div>
              <div className="absolute bottom-0 -mb-4 w-8 h-8 bg-white rounded-full border-2 border-r-0 border-[#552483]"></div>
            </div>


            {/* Right Section */}
            <div className="w-full md:w-64 flex flex-col justify-center items-center p-6 md:p-8 bg-[#552483]/10">
               <p className="font-mono text-sm text-center text-[#552483] mb-2">SCAN FOR ENTRY</p>
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VisitorPass"
                alt="QR Code"
                className="w-36 h-36 rounded-lg shadow-md mb-4 p-1 bg-white"
              />
              <p className="font-mono text-xs text-gray-500 mb-4">ID: {currentReservation.data.id}</p>

              {!currentReservation.data.check_in ? (
                <button
                  onClick={handleCheckIn}
                  className="group w-full px-4 py-2 bg-[#8B5CF6] text-white font-bold rounded-lg hover:bg-[#6D28D9] transition flex items-center justify-center gap-2"
                >
                  <span>Check In</span>
                  <span className="transform transition-transform duration-200 group-hover:translate-x-1">
                    &gt;&gt;
                  </span>
                </button>
              ) : !currentReservation.data.check_out ? (
                <button
                  onClick={handleCheckOut}
                  className="group w-full px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-[#552483] transition flex items-center justify-center gap-2"
                >
                  Check Out
                  <span className="transform transition-transform duration-200 group-hover:translate-x-1">
                    &gt;&gt;
                  </span>
                </button>
              ) : (
                <p className="text-black font-semibold">Reservation Completed</p>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-2xl shadow-purple-200/50 shadow-xl border-2 border-[#552483] mt-4 md:mt-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#552483] mb-2">Welcome!</h2>
              <p className="text-black mb-8">
                You have no active reservation. Please select a reason for your visit.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {visitOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleVisitClick(option.value)}
                    className="group bg-[#8B5CF6] p-6 rounded-xl shadow-lg text-white w-full hover:bg-[#6D28D9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold">{option.label}</p>
                      <span className="text-2xl font-bold transform transition-transform duration-200 group-hover:translate-x-2">
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

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md transform transition-transform duration-300 ease-in-out z-30 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {isSidebarOpen && (
          /* Side Close Button */
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-1/2 -left-12 -translate-y-1/2 p-2 bg-white rounded-l-lg shadow-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Close history"
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {/* Sidebar Content */}
        <div className="h-full w-full bg-white shadow-2xl border-l-2 border-[#552483]">
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[#552483]">Past Reservations</h3>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Close history"
              >
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto">
              {loading ? (
                <p className="text-black">Loading history...</p>
              ) : pastReservations.length > 0 ? (
                <ul className="space-y-4">
                  {pastReservations.map((res, index) => (
                    <li
                      key={`${res.id}-${index}`}
                      className="bg-white border-2 border-purple-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-lg text-[#552483]">
                            {res.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {res.id}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-600">
                          {new Date(res.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-3 border-t border-purple-100 pt-3 text-sm text-gray-700 space-y-1">
                        <p><strong>Checked In:</strong> {new Date(res.check_in).toLocaleString()}</p>
                        <p><strong>Checked Out:</strong> {new Date(res.check_out).toLocaleString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-black">No past reservations found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}