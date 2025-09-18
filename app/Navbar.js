"use client";

import { useState } from "react";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-900 w-full z-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-white">
              VisitorApp
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-300 hover:text-white px-4 py-2 rounded-md font-medium">
              Home
            </Link>
            <Link href="/adminlogin" className="text-gray-300 hover:text-white px-4 py-2 rounded-md font-medium">
              Manage Reservations
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden mt-2 space-y-2 px-2">
            <Link href="/" className="block text-gray-300 hover:text-white px-4 py-2 rounded-md">
              Home
            </Link>
            <Link href="/adminlogin" className="block text-gray-300 hover:text-white px-4 py-2 rounded-md">
              Manage Reservations
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
