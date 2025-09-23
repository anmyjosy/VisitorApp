"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="relative sticky top-0 z-50 flex justify-between items-center px-6 md:px-20 py-6 bg-[#552483] shadow-md text-white">
        {/* Desktop Menu */}
        <div className="hidden md:flex w-full justify-between items-center">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">VisitorApp</h1>
          </div>
          <div className="flex-1 flex justify-center space-x-8">
            <Link href="/">Home</Link>
            <Link href="/about">About us</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="flex-1 flex justify-end">
            <Link href="/adminlogin" className="text-white">
              Manage Reservations
            </Link>
          </div>
        </div>

        {/* Mobile Title */}
        <div className="md:hidden">
          <h1 className="text-xl font-bold text-white">VisitorApp</h1>
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
              <Link href="/adminlogin">Manage Reservations</Link>
            </div>
          </div>
        )}
      </nav>


      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between px-6 md:px-20 py-12 lg:py-20">
        {/* Left Content */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="lg:w-1/2 text-center lg:text-left"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black leading-tight">
            Welcome to the <br />
            <span className="text-[#552483]">
              Visitor Reservation App
            </span>
          </h1>

          <p className="mt-4 text-gray-700 text-lg max-w-md mx-auto lg:mx-0">
            Streamline your visitor management process with ease. Book a new visit
            for your guests quickly and efficiently.
          </p>

          {/* Button with animated arrow */}
          <div className="mt-6 flex justify-center lg:justify-start">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-[#552483] text-white rounded-lg text-lg font-medium shadow-md 
                        transform transition-all duration-300 hover:bg-[#431c68] hover:scale-105 hover:shadow-xl hover:shadow-[#552483]/40"
            >
              Make a Reservation
              {/* Animated arrow */}
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
                animate={{
                  x: [0, 5, 0], // moves arrow right then back
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
              </motion.svg>
            </Link>
          </div>
        </motion.div>

        {/* Right Content */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center lg:justify-end"
        >
          <Image
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80"
            alt="App illustration"
            width={500}
            height={500}
            className="object-contain"
          />
        </motion.div>
      </div>

      {/* Features Section */}
      <section className="bg-gray-50 py-12 lg:py-20">
        <div className="max-w-7xl justify-center mx-auto px-6 md:px-20 text-center">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-extrabold text-black">
              How It Works
            </h2>
            <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
              A simple, secure, and efficient process for managing visitors.
            </p>
          </motion.div>

          <div className="mt-12 justify-center grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="p-8 bg-white rounded-xl shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold text-[#552483]">1. Register & Verify</h3>
              <p className="mt-2 text-gray-500">
                Users sign in quickly with a secure, one-time password (OTP) sent to their email. No passwords to remember.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="p-8 bg-white rounded-xl shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold text-[#552483]">2. Create Reservation</h3>
              <p className="mt-2 text-gray-500">
                Fill in the details for your visit, whether it's for an interview, a business pitch, or meeting a friend.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="p-8 bg-white rounded-xl shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold text-[#552483]">3. Check-In & Out</h3>
              <p className="mt-2 text-gray-500">
                Use your generated visitor pass to check in upon arrival and check out when you leave, all from your device.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#552483] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-20 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className="text-lg font-bold">VisitorApp</h3>
              <p className="mt-2 text-gray-300 text-sm">
                The modern solution for seamless visitor management.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold">Quick Links</h3>
              <ul className="mt-2 space-y-2 text-sm">
                <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
                <li><Link href="/adminlogin" className="text-gray-300 hover:text-white">Admin</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold">Contact Us</h3>
              <p className="mt-2 text-gray-300 text-sm">
                123 Visitor Lane, Tech City, 12345
              </p>
              <p className="text-gray-300 text-sm">
                contact@visitorapp.com
              </p>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-600 pt-6 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} VisitorApp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
