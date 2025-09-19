"use client";
import { useState, useEffect, useContext } from "react";
import { supabase } from "../../../lib/supabaseClient"; // adjust if path differs
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { UserContext } from "../../UserContext";

export default function BusinessPitchPage() {
  const [companyName, setCompanyName] = useState("");
  const [pitchTitle, setPitchTitle] = useState("");
  const [pitchDescription, setPitchDescription] = useState("");
  const [message, setMessage] = useState("");
  const { setLoggedIn } = useContext(UserContext) || {};

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email"); // logged-in user email

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyName || !pitchTitle || !pitchDescription) {
      setMessage("Please fill in all fields.");
      return;
    }

    setMessage("Saving your business pitch...");
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

    // Insert into business_pitch table
    const { error } = await supabase.from("business_pitch").insert([
      {
        user_email: email,
        company_name: companyName,
        pitch_title: pitchTitle,
        pitch_description: pitchDescription,
        created_at: new Date(),
        check_in: null,
        check_out: null,
      },
    ]);

    const { error: recentError } = await supabase.from("recent").insert([
      {
        email: email,
        name: userName,
        purpose: "pitch",
        status: "Pending",
        created_at: new Date(),
        check_in: null,
        check_out: null,
      },
    ]);

    if (error) {
      setMessage("Error saving pitch: " + error.message);
      return;
    }

    setMessage("Business pitch submitted successfully!");
    // redirect to userpage
    router.push(`/userpage?email=${encodeURIComponent(email)}`);
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
          Submit Your Business Pitch
        </h2>
        <p className="text-center text-gray-400">Please provide your pitch details below.</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your company name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Pitch Title
            </label>
            <input
              type="text"
              value={pitchTitle}
              onChange={(e) => setPitchTitle(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter a short pitch title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Pitch Description
            </label>
            <textarea
              value={pitchDescription}
              onChange={(e) => setPitchDescription(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Describe your pitch"
              rows={5}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 text-white bg-purple-600 rounded-xl font-semibold hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
          >
            Submit Pitch
          </button>
        </form>

        {message && (
          <p className="text-center text-sm text-purple-400 mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}
