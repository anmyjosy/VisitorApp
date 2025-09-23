"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef(null);
  const inputsRef = useRef([]);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("session");
    setShowDetailsForm(false);
    setShowOtpForm(false);
    setEmail("");
    setDigits(["", "", "", ""]);
    setMessage("You have been logged out.");
  };

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const sessionData = localStorage.getItem("session");
      if (sessionData) {
        const { email, timestamp } = JSON.parse(sessionData);
        const tenMinutes = 10 * 60 * 1000;
        if (Date.now() - timestamp < tenMinutes) {
          // Session is valid, now check if profile is complete
          const { data: user, error } = await supabase
            .from("users")
            .select("name, company, address, dob")
            .eq("email", email)
            .single();

          if (user && user.name && user.company && user.address) {
            router.replace("/userpage");
          } else if (user) {
            // User exists but profile is incomplete, show details form
            setEmail(email);
            setName(user.name || "");
            setCompany(user.company || "");
            setAddress(user.address || "");
            setDob(user.dob || "");
            setShowDetailsForm(true);
            setShowOtpForm(true); // Keep this true to bypass the email form
          }
          // If profile is not complete, do nothing, allowing the login page to render
          // The user will be prompted to log in again, which will lead to the details form.
        } else {
          localStorage.removeItem("session");
        }
      } else {
        setShowOtpForm(false);
      }
    };
    checkSession();
  }, [router]);

  // Timer effect
  useEffect(() => {
    if (timer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [timer]);

  // Email submit handler
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("Sending OTP...");

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error } = await supabase.from("users").upsert(
      { email, otp_code: otp, otp_expires_at: expiresAt },
      { onConflict: "email" }
    );

    if (error) {
      setMessage("Error saving user: " + error.message);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) throw new Error("Failed to send OTP email.");
      setMessage("An OTP has been sent to your email.");
      setShowOtpForm(true);
      setTimer(60); // Start 60-second timer

      setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 120);
    } catch (apiError) {
      setMessage("Error sending OTP: " + apiError.message);
    }

    setLoading(false);
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (loading) return;
    setLoading(true);
    setMessage("Resending OTP...");

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error } = await supabase.from("users").upsert(
      { email, otp_code: otp, otp_expires_at: expiresAt },
      { onConflict: "email" }
    );

    if (error) {
      setMessage("Error resending OTP: " + error.message);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/send-otp', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      if (!response.ok) throw new Error("Failed to resend OTP email.");
      setMessage('A new OTP has been sent.');
      setTimer(60); // Restart timer
    } catch (apiError) {
      setMessage("Error resending OTP: " + apiError.message);
    }
    setLoading(false);
    // After resending, clear the OTP input fields and focus the first one
    setDigits(["", "", "", ""]);
    inputsRef.current[0]?.focus();

  };

  // OTP submit handler
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const enteredOtp = digits.join("");
    if (enteredOtp.length < 4) {
      setMessage("Please enter the 4-digit OTP.");
      setLoading(false);
      return;
    }

    setMessage("Verifying OTP...");

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      setMessage("Error verifying OTP. Please try again.");
      setLoading(false);
      return;
    }

    if (user.otp_code !== enteredOtp) {
      setMessage("Invalid OTP. Please try again.");
      setLoading(false);
      return;
    }

    if (new Date(user.otp_expires_at) < new Date()) {
      setMessage("OTP has expired. Please request a new one.");
      setShowOtpForm(false);
      setDigits(["", "", "", ""]);
      setLoading(false);
      return;
    }

    localStorage.setItem(
      "session",
      JSON.stringify({ email, timestamp: Date.now() })
    );

    if (!user.name || !user.company || !user.address) {
      setName(user.name || "");
      setCompany(user.company || "");
      setAddress(user.address || "");
      setDob(user.dob || "");
      setShowDetailsForm(true);
      setMessage("Please complete your profile to continue.");
      setLoading(false);
    } else {
      router.push("/userpage");
      setLoading(false);
    }
  };

  // Details submit handler
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("Saving your details...");

    const { error } = await supabase
      .from("users")
      .update({
        name,
        company,
        address,
        dob,
        created_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (error) {
      setMessage("Error saving details: " + error.message);
      setLoading(false);
      return;
    }

    setMessage("Profile updated successfully!");
    router.push("/userpage");
    setLoading(false);
  };

  // OTP digit handlers
  const handleDigitChange = (e, idx) => {
    const raw = e.target.value.replace(/\D/g, "");
    const val = raw.slice(-1);
    const next = [...digits];
    next[idx] = val;
    setDigits(next);

    if (val && idx < 3) inputsRef.current[idx + 1]?.focus();
  };

  const handleDigitKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[idx]) {
        next[idx] = "";
        setDigits(next);
      } else if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
        next[idx - 1] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < 3) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!paste) return;
    const newDigits = paste.split("");
    while (newDigits.length < 4) newDigits.push("");
    setDigits(newDigits);
    const firstEmpty = newDigits.findIndex((d) => d === "");
    const focusIdx = firstEmpty === -1 ? 3 : firstEmpty;
    setTimeout(() => inputsRef.current[focusIdx]?.focus(), 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="relative sticky top-0 z-50 flex justify-between items-center px-6 md:px-20 py-6 bg-[#552483] shadow-md">
        <h1 className="text-xl font-bold text-white">VisitorApp</h1>

        <div className="hidden md:flex space-x-8 text-white">
          <Link href="/">Home</Link>
          <Link href="/about">About us</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <div className="hidden md:flex space-x-4">
          {showDetailsForm ? (
            <button
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <Link href="/adminlogin" className="text-white">
              Manage Reservations
            </Link>
          )}
        </div>

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
              <Link href="/about">About us</Link>
              <Link href="/contact">Contact</Link>
              {showDetailsForm ? (
                <button
                  onClick={handleLogout}
                >
                  Logout
                </button>
              ) : (
                <Link href="/adminlogin">Manage Reservations</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Content */}
      <div className="flex flex-1 flex-col md:flex-row relative">
        {/* Left Image */}
        <div className="relative h-64 md:h-auto md:w-3/5">
          <Image
            src="https://images.unsplash.com/photo-1616001089004-04948fc0e6c1?q=80&w=870&auto=format&fit=crop"
            alt="People working in an office"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              Sign in to VisitorApp
            </h2>
            <p className="text-white/80 text-sm max-w-md">
              Quick, secure access to your reservations.
            </p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="flex flex-1 items-start md:items-center justify-center w-full md:w-2/5 bg-transparent p-6 md:p-12 relative z-10 -mt-12 md:mt-0">
          <div
            className={`w-full max-w-md bg-white shadow-xl rounded-xl p-6 md:p-8 space-y-6 border border-gray-100 md:mt-0 ${
              showDetailsForm ? "-mt-[180px]" : ""
            }`}
          >
            <h2 className="text-2xl font-bold text-center text-[#552483]">
              {showDetailsForm
                ? "Complete Your Profile"
                : showOtpForm
                ? "Enter OTP"
                : "Login"}
            </h2>

            {/* Forms */}
            {!showOtpForm ? (
              <form className="space-y-6" onSubmit={handleEmailSubmit}>
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
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-4 py-2 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#552483] hover:bg-black focus:ring-[#552483]"
                  }`}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            ) : !showDetailsForm ? (
              <form className="space-y-6" onSubmit={handleOtpSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    One-Time Password
                  </label>
                  <div
                    className="flex justify-center gap-3 mt-1"
                    onPaste={handlePaste}
                  >
                    {digits.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => (inputsRef.current[i] = el)}
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleDigitChange(e, i)}
                        onKeyDown={(e) => handleDigitKeyDown(e, i)}
                        className="w-12 h-12 md:w-14 md:h-14 text-center text-black text-lg md:text-xl font-semibold bg-transparent border-0 border-b-2 border-gray-300 focus:border-[#552483] outline-none transition-colors"
                      />
                    ))}
                  </div>
                </div>
                <div className="text-center text-sm">
                  {timer > 0 ? (
                    <p className="text-gray-500">Resend OTP in {timer}s</p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-medium text-[#552483] hover:text-black disabled:text-gray-400 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-4 py-2 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#552483] hover:bg-black focus:ring-[#552483]"
                  }`}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
              </form>
            ) : (
              <form
  className="
    space-y-4 
    max-h-[80vh] 
    overflow-y-auto 
    scrollbar-thin scrollbar-thumb-gray-300 
    px-2 sm:px-4
  "
  onSubmit={handleDetailsSubmit}
>
  {/* One column on mobile, two on md and above */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Email always full width */}
    <div className="md:col-span-2">
      <label className="block text-base sm:text-sm font-medium text-gray-700">
        Email
      </label>
      <input
        type="email"
        value={email}
        readOnly
        className="
          w-full px-3 py-3 sm:py-2 mt-1 
          text-gray-500 bg-gray-200 
          border border-gray-300 rounded-lg cursor-not-allowed 
          text-base sm:text-sm
        "
      />
    </div>

    <div>
      <label className="block text-base sm:text-sm font-medium text-gray-700">
        Full Name
      </label>
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="
          w-full px-3 py-3 sm:py-2 mt-1 
          text-black bg-gray-100 
          border border-gray-300 rounded-lg 
          focus:ring-[#552483] focus:border-[#552483] outline-none
          text-base sm:text-sm
        "
      />
    </div>

    <div>
      <label className="block text-base sm:text-sm font-medium text-gray-700">
        Company
      </label>
      <input
        type="text"
        required
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="
          w-full px-3 py-3 sm:py-2 mt-1 
          text-black bg-gray-100 
          border border-gray-300 rounded-lg 
          focus:ring-[#552483] focus:border-[#552483] outline-none
          text-base sm:text-sm
        "
      />
    </div>

    <div>
      <label className="block text-base sm:text-sm font-medium text-gray-700">
        Address
      </label>
      <input
        type="text"
        required
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="
          w-full px-3 py-3 sm:py-2 mt-1 
          text-black bg-gray-100 
          border border-gray-300 rounded-lg 
          focus:ring-[#552483] focus:border-[#552483] outline-none
          text-base sm:text-sm
        "
      />
    </div>

    <div>
      <label className="block text-base sm:text-sm font-medium text-gray-700">
        Date of Birth
      </label>
      <input
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        className="
          w-full px-3 py-3 sm:py-2 mt-1 
          text-black bg-gray-100 
          border border-gray-300 rounded-lg 
          focus:ring-[#552483] focus:border-[#552483] outline-none
          text-base sm:text-sm
        "
      />
    </div>
  </div>

  <button
    type="submit"
    disabled={loading}
    className={`
      w-full 
      px-4 py-3 sm:py-2 
      text-white rounded-lg transition-colors 
      text-base sm:text-sm 
      focus:outline-none focus:ring-2 focus:ring-offset-2 
      ${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-[#552483] hover:bg-black focus:ring-[#552483]"
      }
    `}
  >
    {loading ? "Saving..." : "Save & Continue"}
  </button>
</form>

            )}

            {message && (
              <p className="mt-2 text-center text-sm text-[#552483]">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}