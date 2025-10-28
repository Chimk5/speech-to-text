"use client";

import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-6 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
