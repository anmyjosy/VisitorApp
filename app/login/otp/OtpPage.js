"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

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

      // ✅ Set login state in localStorage
      localStorage.setItem(
        "session",
        JSON.stringify({
          timestamp: Date.now(),
        })
      );
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
    <div className="relative min-h-screen flex items-center justify-center p-4">
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
