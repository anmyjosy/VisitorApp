"use client";
import { useState, useEffect, useContext } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { UserContext } from "../../UserContext";

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const { setLoggedIn } = useContext(UserContext) || {};

  useEffect(() => {
    if (setLoggedIn) {
      setLoggedIn(true);
    }
    return () => {
      if (setLoggedIn) {
        setLoggedIn(false);
      }
    };
  }, [setLoggedIn]);

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
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl">
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
