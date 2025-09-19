"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-start justify-start overflow-hidden pt-48">
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

      {/* Content */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center lg:text-left max-w-2xl px-6 sm:px-8 md:px-12 lg:px-20"
      >
        <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl 
                       font-extrabold text-white leading-snug lg:leading-tight">
          Welcome to the <br />
          <span className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl text-purple-400">
            Visitor Reservation App
          </span>
        </h1>

        <p className="mt-4 sm:mt-6 text-gray-300 
                      text-sm sm:text-base md:text-lg max-w-lg mx-auto lg:mx-0">
          Streamline your visitor management process with ease. Book a new visit
          for your guests quickly and efficiently.
        </p>

        <div className="mt-6 sm:mt-8 flex justify-center lg:justify-start">
          <Link
            href="/login"
            className="px-6 sm:px-8 py-3 sm:py-4
                       text-sm sm:text-base md:text-lg
                       font-medium text-white
                       bg-purple-600
                       hover:bg-purple-700
                       rounded-full shadow-xl 
                       transition-transform transform hover:scale-110"
          >
            Make a Reservation
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
