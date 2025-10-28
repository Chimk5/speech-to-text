"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ThemeToggle from "./ThemeToggle";
import { useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Check current session on load
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    // Listen for login/logout events
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // redirect after logout
  };

  return (
    <header className="w-full bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-4 shadow-md transition-all duration-300">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
        {/* Left side - App name */}
        <h1
          className="text-2xl font-bold tracking-wide select-none cursor-pointer"
          onClick={() => router.push("/")}
        >
          Speakify
        </h1>

        {/* Right side - Theme toggle + Auth buttons */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {user ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Logout
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push("/login")}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Login
              </button>
              <button
                onClick={() => router.push("/signup")}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Signup
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
