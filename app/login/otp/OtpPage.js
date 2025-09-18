"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";

export default function OtpPage() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email"); // Email passed from login page

  const handleVerify = async (e) => {
    e.preventDefault();

    // Get user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      setMessage("User not found");
      return;
    }

    // Check OTP and expiry
    if (user.otp_code === otp && new Date(user.otp_expires_at) > new Date()) {
      // Clear OTP
      await supabase
        .from("users")
        .update({ otp_code: null, otp_expires_at: null })
        .eq("email", email);

      // ✅ Check if profile details are filled
      if (!user.name || !user.company || !user.address || !user.dob) {
        // Not filled → go to details page
        router.push(`/details?email=${encodeURIComponent(email)}`);
      } else {
        // Already filled → go to user page
        router.push(`/userpage?email=${encodeURIComponent(email)}`);
      }
    } else {
      setMessage("Invalid or expired OTP");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-extrabold text-center text-white">
          Enter OTP
        </h2>
        <form className="space-y-6" onSubmit={handleVerify}>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              OTP Code
            </label>
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 cursor-pointer"
          >
            Verify OTP
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-purple-400">{message}</p>
        )}
      </div>
    </div>
  );
}
