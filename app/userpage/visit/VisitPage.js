"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";

export default function VisitFriendPage() {
  const [company, setCompany] = useState("");
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email"); // Logged-in user email

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!company || !friendName || !friendEmail || !purpose) {
      setMessage("Please fill in all fields.");
      return;
    }

    setMessage("Saving visit details...");

    // 1. Fetch user's name for the 'recent' table
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

    // 2. Insert into visitlogs table
    const { error } = await supabase.from("visitlogs").insert([
      {
        user_email: email,   // the logged-in user's email
        company: company,
        friend_name: friendName,
        friend_email: friendEmail,
        purpose: purpose, // fixed purpose
        created_at: new Date(),
        check_in: null,
        check_out: null,
      },
    ]);

    // 3. Insert into recent table
    const { error: recentError } = await supabase.from("recent").insert([
      {
        email: email,
        name: userName,
        purpose: "Visit a Friend",
        status: "Pending",
        created_at: new Date(),
        check_in: null,
        check_out: null,
      },
    ]);

    if (error || recentError) {
      setMessage("Error saving visit: " + error.message);
      return;
    }

    setMessage("Visit logged successfully!");
    router.push(`/userpage?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 from-gray-900 to-purple-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-extrabold text-center text-white">
          Visit a Friend
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Company Name
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter company name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Friend's Name
            </label>
            <input
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter friend's name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Friend's Email
            </label>
            <input
              type="email"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter friend's email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Purpose
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter Purpose of Visit"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 text-white bg-purple-600 rounded-xl font-semibold hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
          >
            Log Visit
          </button>
        </form>
        {message && (
          <p className="text-center text-sm text-purple-400 mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}
