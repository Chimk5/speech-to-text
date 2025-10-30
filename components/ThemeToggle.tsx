"use client";

import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setDark(initialDark);
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="relative w-12 h-12 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 transition-all duration-300 hover:scale-110"
    >
      <div
        className={`absolute inset-0 flex items-center justify-center text-2xl transition-transform duration-300 ${
          dark ? "transform translate-x-full" : "transform translate-x-0"
        }`}
      >
        ☀️
      </div>
      <div
        className={`absolute inset-0 flex items-center justify-center text-2xl transition-transform duration-300 ${
          dark ? "transform translate-x-0" : "transform -translate-x-full"
        }`}
      >
        🌙
      </div>
    </button>
  );
}
