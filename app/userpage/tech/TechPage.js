"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function TechEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // form fields
  const [eventName, setEventName] = useState("");
  const [eventDateTime, setEventDateTime] = useState("");
  const [roleOfInterest, setRoleOfInterest] = useState("");

  const [currentEvent, setCurrentEvent] = useState(null);

  useEffect(() => {
    if (!email) {
      router.push("/login");
      return;
    }

    const fetchCurrentEvent = async () => {
      const { data, error } = await supabase
        .from("tech_events")
        .select("*")
        .eq("user_email", email)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setCurrentEvent(data[0]);
      } else {
        setCurrentEvent(null);
      }
      setLoading(false);
    };

    fetchCurrentEvent();
  }, [email, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Saving event...");

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("name")
      .eq("email", email)
      .single();
    if (userError || !userData) {
      setMessage("Error fetching user details: " + (userError?.message || "User not found."));
      return;
    }
    const userName = userData.name;

    const creationTime = new Date(); // Create a single timestamp
    const { data, error } = await supabase.from("tech_event").insert([
      {
        user_email: email,
        event_name: eventName,
        event_date_time: eventDateTime,
        role_of_interest: roleOfInterest,
        created_at: new Date(),
        created_at: creationTime,
        check_in: null,
        check_out: null,
      },
    ]);

    const { error: recentError } = await supabase.from("recent").insert([
      {
        email: email,
        name: userName,
        purpose: "tech",
        status: "Pending",
        created_at: new Date(),
        created_at: creationTime,
        check_in: null,
        check_out: null,
      },
    ]);

    if (error) {
      setMessage("Error saving event: " + error.message);
    } else {
      setMessage("Event saved successfully!");
      router.push(`/userpage?email=${encodeURIComponent(email)}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white text-xl font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Back Arrow */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 z-20 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 transition-colors"
        aria-label="Go back"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
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
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl">
        <h2 className="text-3xl font-extrabold text-center text-white">
          Attend Tech Event
        </h2>
        <p className="text-center text-gray-400">
          Fill out the details to register.
        </p>

        {currentEvent ? (
          <div className="bg-gray-700 text-white p-4 rounded-lg shadow-md space-y-2">
            <p>
              <strong>Event:</strong> {currentEvent.event_name}
            </p>
            <p>
              <strong>Date & Time:</strong>{" "}
              {new Date(currentEvent.event_date_time).toLocaleString()}
            </p>
            <p>
              <strong>Role:</strong> {currentEvent.role_of_interest}
            </p>
            <p className="text-green-400 font-semibold pt-2">
              You have registered for this event.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
            <input
              type="datetime-local"
              placeholder="Event Date & Time"
              value={eventDateTime}
              onChange={(e) => setEventDateTime(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
            <input
              type="text"
              placeholder="Role / Interest"
              value={roleOfInterest}
              onChange={(e) => setRoleOfInterest(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              type="submit"
              className="w-full px-4 py-3 text-white bg-purple-600 rounded-xl font-semibold hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
            >
              Register Event
            </button>
          </form>
        )}

        {message && (
          <p className="text-center text-sm text-purple-400 mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}
