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
        .select("*")
        .eq("user_email", email)
        .order("created_at", { ascending: false })
        .limit(1);

      const { data: pitches } = await supabase
        .from("business_pitch")
        .select("*")
        .eq("user_email", email)
        .order("created_at", { ascending: false })
        .limit(1);

      const { data: interview } = await supabase
        .from("interview")
        .select("*")
        .eq("user_email", email)
        .order("created_at", { ascending: false })
        .limit(1);

      const { data: techEvents } = await supabase
        .from("tech_event")
        .select("*")
        .eq("user_email", email)
        .order("created_at", { ascending: false })
        .limit(1);

      let active = null;
      if (visits && visits.length > 0 && !visits[0].check_out) {
        active = { type: "visit", data: visits[0] };
      } else if (pitches && pitches.length > 0 && !pitches[0].check_out) {
        active = { type: "pitch", data: pitches[0] };
      } else if (interview && interview.length > 0 && !interview[0].check_out) {
        active = { type: "interview", data: interview[0] };
      } else if (techEvents && techEvents.length > 0 && !techEvents[0].check_out) {
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-lg space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-white">
          {currentReservation ? "Your Reservation" : "Select Your Visit Type"}
        </h2>

        {/* === Ticket UI === */}
        {currentReservation ? (
          <div className="ticket-shape bg-white overflow-hidden border border-gray-300 shadow-xl">
            <div className="flex flex-col md:flex-row">
              {/* Left side (Details) */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-purple-600 uppercase tracking-widest mb-2">
                    {currentReservation.type} Pass
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {currentReservation.type === "visit" && currentReservation.data.purpose}
                    {currentReservation.type === "pitch" && currentReservation.data.pitch_title}
                    {currentReservation.type === "interview" && currentReservation.data.position}
                    {currentReservation.type === "tech" && currentReservation.data.event_name}
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    {currentReservation.type === "visit" && (
                      <p>
                        Visiting: <strong>{currentReservation.data.friend_name}</strong>
                      </p>
                    )}
                    {currentReservation.type === "pitch" && (
                      <p>
                        Company: <strong>{currentReservation.data.company_name}</strong>
                      </p>
                    )}
                    {currentReservation.type === "interview" && (
                      <>
                        <p>
                          Company: <strong>{currentReservation.data.company}</strong>
                        </p>
                        <p>
                          Time:{" "}
                          <strong>
                            {new Date(currentReservation.data.date_time).toLocaleString()}
                          </strong>
                        </p>
                      </>
                    )}
                    {currentReservation.type === "tech" && (
                      <>
                        <p>
                          Role: <strong>{currentReservation.data.role_of_interest}</strong>
                        </p>
                        <p>
                          Time:{" "}
                          <strong>
                            {new Date(currentReservation.data.event_date_time).toLocaleString()}
                          </strong>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side (QR Code placeholder) */}
              <div className="flex md:w-48 items-center justify-center bg-gray-100 p-6">
                <div className="bg-white p-2 rounded">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=reservation"
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-100 px-6 py-4">
              {!currentReservation.data.check_in ? (
                <button
                  onClick={handleCheckIn}
                  className="w-full px-4 py-3 text-white bg-green-600 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Check In
                </button>
              ) : !currentReservation.data.check_out ? (
                <button
                  onClick={handleCheckOut}
                  className="w-full px-4 py-3 text-white bg-red-600 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Check Out
                </button>
              ) : (
                <p className="text-center text-gray-600 font-semibold">
                  Reservation Completed
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {visitOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleVisitClick(option.value)}
                className="w-full px-4 py-4 rounded-xl text-lg font-medium border bg-gray-700 text-white border-gray-600 shadow-md transition-all transform hover:bg-purple-600 hover:border-purple-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {message && (
          <p
            className={`text-center text-sm ${
              message.includes("Error") ? "text-red-400" : "text-green-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
