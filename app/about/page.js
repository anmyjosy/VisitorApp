"use client";

import { useState, useEffect, useContext, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
      {/* Content */}
      <main className="flex-1 bg-white">
        <div className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-base font-semibold text-[#552483] tracking-wide uppercase">About Us</h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                Streamlining Your Visitor Management
              </p>
              <p className="mt-5 max-w-2xl mx-auto text-xl text-gray-500">
                VisitorApp is dedicated to providing a seamless and efficient way to manage visitor reservations. Our platform is designed for both administrators and users to have a hassle-free experience.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              <p className="mt-4 text-lg text-gray-500">
                Our mission is to simplify the process of visitor management through modern technology. We aim to create a secure, reliable, and user-friendly environment for businesses and their guests, ensuring every visit is smooth and well-documented.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative h-64 rounded-lg overflow-hidden shadow-lg"
            >
                <Image
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2138&auto=format&fit=crop"
                    alt="Our Mission"
                    fill
                    className="object-cover"
                />
            </motion.div>
          </div>
        </div>

        <div className="py-16 md:py-20">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="text-center"
                >
                    <h3 className="text-2xl font-bold text-gray-900">Why Choose VisitorApp?</h3>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-500">
                        We focus on delivering a powerful yet simple solution for visitor management. Here’s what makes us different:
                    </p>
                </motion.div>
                <div className="mt-12 grid gap-8 md:grid-cols-3 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex justify-center items-center h-12 w-12 rounded-full bg-[#552483]/10 mx-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#552483]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-[#552483]">Secure OTP Login</h4>
                        <p className="mt-2 text-gray-500">Passwordless authentication for enhanced security and user convenience.</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex justify-center items-center h-12 w-12 rounded-full bg-[#552483]/10 mx-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#552483]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-[#552483]">Easy Administration</h4>
                        <p className="mt-2 text-gray-500">A dedicated admin panel to manage all visitor reservations effortlessly.</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      className="p-6 bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex justify-center items-center h-12 w-12 rounded-full bg-[#552483]/10 mx-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#552483]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-[#552483]">Responsive Design</h4>
                        <p className="mt-2 text-gray-500">Access and manage the app from any device, whether on desktop or mobile.</p>
                    </motion.div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
