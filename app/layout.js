"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar";
import { UserContext } from "./UserContext";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [openHistory, setOpenHistory] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const sessionData = localStorage.getItem("session");
    if (sessionData) {
      const { timestamp } = JSON.parse(sessionData);
      const tenMinutes = 10 * 60 * 1000;
      if (Date.now() - timestamp < tenMinutes) {
        setLoggedIn(true);
      } else {
        localStorage.removeItem("session");
        setLoggedIn(false);
      }
    }
  }, [pathname]); // Re-check session on route change

  const noNavPaths = [
    "/userpage/visit",
    "/userpage/pitch",
    "/userpage/interview",
    "/userpage/tech",
  ];
  const showNav = !noNavPaths.includes(pathname);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserContext.Provider
          value={{ loggedIn, setLoggedIn, openHistory, setOpenHistory }}
        >
          {showNav && <Navbar />}
          <main>{children}</main>
        </UserContext.Provider>
      </body>
    </html>
  );
}
