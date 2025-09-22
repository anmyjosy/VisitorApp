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
      <nav className="relative sticky top-0 z-50 flex justify-between items-center px-6 md:px-20 py-6 bg-[#552483] shadow-md">
        <h1 className="text-xl font-bold text-white">VisitorApp</h1>

        <div className="hidden md:flex space-x-8 text-white">
          <Link href="#" className="hover:text-gray-200">Home</Link>
          <Link href="#" className="hover:text-gray-200">About us</Link>
          <Link href="#" className="hover:text-gray-200">Contact</Link>
        </div>

        <div className="hidden md:flex space-x-4">
          <Link
            href="/adminlogin"
            className="text-white hover:text-gray-200"
          >
            Manage Reservations
          </Link>
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
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#552483] md:hidden shadow-lg">
            <div className="flex flex-col items-center space-y-4 py-4 text-white">
              <Link href="#" className="hover:text-gray-200">Home</Link>
              <Link href="#" className="hover:text-gray-200">About us</Link>
              <Link href="#" className="hover:text-gray-200">Contact</Link>
              <Link href="/adminlogin" className="hover:text-gray-200">Manage Reservations</Link>
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
    </div>
  );
}
