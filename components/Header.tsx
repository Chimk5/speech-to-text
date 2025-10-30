"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ThemeToggle from "./ThemeToggle";
import { useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
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
    setToastMessage('Logged out successfully');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // Hide toast after 3 seconds
    router.push("/auth/login"); // redirect to login after logout
    router.refresh();
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
          {user ? (
            <>
              <ThemeToggle />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/auth/login")}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Login
              </button>
              <button
                onClick={() => router.push("/auth/signup")}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Signup
              </button>
            </>
          )}
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}
    </header>
  );
}
