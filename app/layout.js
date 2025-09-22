"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar";
import { UserContext } from "./UserContext";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [openHistory, setOpenHistory] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const sessionData = localStorage.getItem("session");
    if (sessionData) {
      // Don't redirect if user is on the details page to complete their profile
      if (pathname === "/details") {
        setLoggedIn(true);
        return;
      }
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
    "/",
    "/login",
    "/details",
    "/userpage",
    "/userpage/visit",
    "/userpage/pitch",
    "/userpage/interview",
    "/userpage/tech",
  ];
  const showNav = !noNavPaths.includes(pathname);

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
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
