"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login"); // 🔁 Redirect to login page
      } else {
        setAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();

    // ✅ Listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
      else setAuthenticated(true);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 dark:text-gray-200">
        Checking authentication...
      </div>
    );

  if (!authenticated) return null;

  return <>{children}</>;
}
