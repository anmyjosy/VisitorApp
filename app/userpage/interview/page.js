"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company || !position || !dateTime) {
      setMessage("Please fill all fields.");
      return;
    }
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

    setLoading(true);
    const { error } = await supabase.from("interview").insert([
      {
        user_email: email,
        company: company,
        position: position,
        date_time: dateTime, // Supabase can take ISO string from datetime-local
        created_at: new Date(),
        check_in: null,
        check_out: null,
      },
    ]);
    const { error: recentError } = await supabase.from("recent").insert([
      {
        email: email,
        name: userName,
        purpose: "interview",
        status: "Pending",
        created_at: new Date(),
        check_in: null,
        check_out: null,
      },
    ]);

    if (error) {
      setMessage("Error submitting interview: " + error.message);
    } else {
      setMessage("Interview details submitted successfully!");
      router.push(`/userpage?email=${encodeURIComponent(email)}`);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 from-gray-900 to-purple-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-extrabold text-center text-white">
          Schedule Interview
        </h2>
        <p className="text-center text-gray-400">
          Please provide your interview details below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-300">
              Company Name
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="block w-full px-4 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter company name"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-300">
              Position
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="block w-full px-4 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter position"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-300">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="block w-full px-4 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-white bg-purple-600 rounded-xl font-semibold hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Interview"}
          </button>
        </form>

        {message && (
          <p className="text-center text-sm text-purple-400">{message}</p>
        )}
      </div>
    </div>
  );
}
