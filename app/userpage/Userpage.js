"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";

export default function VisitPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [currentReservation, setCurrentReservation] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.push("/login");
      return;
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
  }, [email, router]);

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

  return (
    <div className="min-h-screen bg-gray-900 flex items-start justify-center p-4 pt-16">
      {currentReservation ? (
        <div className="ticket-shape bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xl max-w-sm w-full mx-auto">
          <div className="flex flex-col">
            {/* Details side */}
            <div className="flex-1 p-6 flex flex-col justify-between border-b border-dashed border-gray-300">
              <div>
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest mb-2">{currentReservation.type} Pass</p>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">
                  {currentReservation.type === "visit" && currentReservation.data.purpose}
                  {currentReservation.type === "pitch" && currentReservation.data.pitch_title}
                  {currentReservation.type === "interview" && currentReservation.data.position}
                  {currentReservation.type === "tech" && currentReservation.data.event_name}
                </h3>
                <div className="text-gray-700 text-sm leading-relaxed">
                  {/* Info rows here, as before */}
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold text-xs shadow-sm">
                    {currentReservation.type}
                  </span>
                  <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-medium text-xs">
                    {new Date(currentReservation.data.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            {/* QR Code side */}
            <div className="flex items-center justify-center bg-gray-50 p-4">
              <div className="bg-white p-2 rounded-lg ring-2 ring-gray-300 shadow-lg flex items-center justify-center">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=reservation&bgcolor=FFFFFF&color=000000"
                  alt="QR Code"
                  className="w-28 h-28"
                />
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="bg-gray-100 px-6 py-4">
            {!currentReservation.data.check_in ? (
              <button
                onClick={handleCheckIn}
                className="w-full px-5 py-3 text-lg font-bold bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition-all duration-150 transform hover:scale-105"
              >
                Check In
              </button>
            ) : !currentReservation.data.check_out ? (
              <button
                onClick={handleCheckOut}
                className="w-full px-5 py-3 text-lg font-bold bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition-all duration-150 transform hover:scale-105"
              >
                Check Out
              </button>
            ) : (
              <p className="text-center text-gray-600 font-semibold text-lg">
                Reservation Completed
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">No Active Reservation</h2>
          <p className="text-gray-400 mb-8">Please select a reason for your visit.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            {visitOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleVisitClick(option.value)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
