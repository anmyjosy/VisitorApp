"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1️⃣ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min expiry

    // 2️⃣ Save / update user with OTP
    const { error } = await supabase.from("users").upsert(
      {
        email,
        phone,
        otp_code: otp,
        otp_expires_at: expiresAt,
      },
      { onConflict: "email" }
    );

    if (error) {
      setMessage("Error saving user: " + error.message);
      return;
    }
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    /*if (!user.name || !user.company || !user.address || !user.dob) {
        // Not filled → go to details page
        router.push(`/details?email=${encodeURIComponent(email)}`);
      } else {
        // Already filled → go to user page
        router.push(`/userpage?email=${encodeURIComponent(email)}`);
      }*/
    // 3️⃣ Send OTP email
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP email.");
      }

      setMessage("OTP sent to your email!");
      router.push(`/login/otp?email=${encodeURIComponent(email)}`);
    } catch (apiError) {
      setMessage("Error sending OTP: " + apiError.message);
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
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl">
        <h2 className="text-3xl font-extrabold text-center text-white">
          Sign in to your account
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Phone number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 cursor-pointer"
          >
            Send OTP
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-purple-400">{message}</p>
        )}
      </div>
    </div>
  );
}
