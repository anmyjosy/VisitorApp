"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sessionData = localStorage.getItem("admin_session");
    if (sessionData) {
      const { timestamp } = JSON.parse(sessionData);
      const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
      if (Date.now() - timestamp < tenMinutes) {
        // If session is valid, redirect to admin page
        router.replace("/adminlogin/adminpage");
      } else {
        // If session expired, remove it
        localStorage.removeItem("admin_session");
      }
    }
  }, [router]);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data: admin, error } = await supabase
      .from("admin")
      .select("email, password")
      .eq("email", email)
      .single();

    if (error || !admin) {
      setMessage("Invalid email or password.");
      setLoading(false);
      return;
    }

    // IMPORTANT: Storing and comparing plain-text passwords is not secure.
    // Consider using a secure method like Supabase Auth with roles or a password hashing library.
    if (admin.password === password) {
      setMessage("Login successful! Redirecting...");
      // Set admin session in local storage
      localStorage.setItem(
        "admin_session",
        JSON.stringify({ email: admin.email, timestamp: Date.now() })
      );
      router.push("/adminlogin/adminpage");
    } else {
      setMessage("Invalid email or password.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="relative sticky top-0 z-50 flex justify-between items-center px-6 md:px-20 py-6 bg-[#552483] shadow-md">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">VisitorApp</h1>
        </div>

        <div className="hidden md:flex flex-1 justify-center space-x-8 text-white">
          <Link href="/">Home</Link>
          <Link href="#">About us</Link>
          <Link href="#">Contact</Link>
        </div>
        <div className="hidden md:flex flex-1 justify-end"></div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16m-7 6h7"
                }
              />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#552483] md:hidden shadow-lg">
            <div className="flex flex-col items-center space-y-4 py-4 text-white">
              <Link href="/">Home</Link>
              <Link href="#">About us</Link>
              <Link href="#">Contact</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Content */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left Side Image */}
        <div className="relative h-64 md:h-auto md:w-3/5">
          <Image
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2073&auto=format&fit=crop"
            alt="Admin dashboard"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Right Side Login Form */}
        <div className="flex flex-1 items-center justify-center w-full md:w-2/5 bg-white p-6 md:p-12">
          <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8 space-y-6 border border-gray-100">
            <h2 className="text-3xl font-extrabold text-center text-[#552483]">
              Admin Login
            </h2>
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 mt-1 text-black bg-gray-100 border border-gray-300 rounded-md focus:ring-[#552483] focus:border-[#552483] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 mt-1 text-black bg-gray-100 border border-gray-300 rounded-md focus:ring-[#552483] focus:border-[#552483] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full px-4 py-2 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#552483] hover:bg-black focus:ring-[#552483]"}`}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            {message && (
              <p className="mt-4 text-center text-sm text-red-600">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
