"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import RecorderPanel from "../components/RecorderPanel";
import HistoryList from "../components/HistoryList";
import { useRouter } from "next/navigation";

interface Transcript {
  id: number;
  text: string;
  created_at: string;
  user_id: string;
}

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [history, setHistory] = useState<Transcript[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // ✅ Demo credentials
  const DEMO_EMAIL = "demospeakify@gmail.com";
  const DEMO_PASSWORD = "demospeakify";

  // ✅ Automatically log in demo evaluator if no session exists
  const ensureDemoUser = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        console.log("🧑‍💻 Logging in demo user...");
        const { data, error } = await supabase.auth.signInWithPassword({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        });

        if (error) {
          console.error("❌ Demo login failed:", error.message);
          setErrorMessage("Demo login failed. Please verify demo credentials in Supabase.");
          return null;
        }

        console.log("✅ Demo user logged in!");
        return data.session?.user || null;
      } else {
        return sessionData.session.user;
      }
    } catch (err: any) {
      console.error("❌ Unexpected error during demo login:", err);
      setErrorMessage(err.message);
      return null;
    }
  };

  // ✅ Fetch user & transcripts
  useEffect(() => {
    const init = async () => {
      console.log("🔍 Checking Supabase session...");
      setLoading(true);
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        let currentUser = session?.user || null;
        if (!currentUser) {
          currentUser = await ensureDemoUser();
        }

        if (currentUser) {
          setUser(currentUser);
          await fetchHistory(currentUser.id);
        } else {
          router.push("/auth/login");
        }
      } catch (err: any) {
        console.error("❌ Error initializing user:", err);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();

    // ✅ Watch for auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        if (session?.user) {
          setUser(session.user);
          await fetchHistory(session.user.id);
        } else {
          setUser(null);
          setHistory([]);
        }
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, [router]);

  // ✅ Fetch transcripts for user
  const fetchHistory = async (userId: string) => {
    console.log("📦 Fetching transcripts for user:", userId);
    try {
      const { data, error } = await supabase
        .from("transcripts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (err: any) {
      console.error("❌ Error fetching transcripts:", err);
      setErrorMessage(err.message);
    }
  };

  // ✅ Handlers
  const handleNewTranscription = async (text: string) => {
    setTranscript(text);
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("transcripts")
        .insert([
          {
            text,
            user_id: user.id,
            filename: "recording.webm",
            duration: 0,
            language: "en",
          },
        ])
        .select();

      if (error) throw error;
      if (data?.[0]) setHistory((prev) => [data[0], ...prev]);
    } catch (err: any) {
      console.error("❌ Error saving transcript:", err);
      setErrorMessage("Failed to save transcript.");
    }
  };

  const handleDeleteTranscript = async (id: number) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("transcripts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      console.error("❌ Error deleting transcript:", err);
      setErrorMessage("Failed to delete transcript.");
    }
  };

  // ✅ UI Helper Functions
  const handleLoadTranscript = (text: string) => setTranscript(text);
  const handleCopy = () => transcript && navigator.clipboard.writeText(transcript);
  const handleClear = () => setTranscript("");
  const handleDownloadTxt = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "transcript.txt";
    a.click();
  };

  // ✅ UI States
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 text-center px-4">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          🔒 Please Log In
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          You need to log in to access the transcription tool.
        </p>

        {/* ✅ Visible demo credentials for evaluator */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-inner text-left">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Demo Credentials:
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Email:</strong> {DEMO_EMAIL}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Password:</strong> {DEMO_PASSWORD}
          </p>
        </div>

        <button
          onClick={() => router.push("/auth/login")}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // ✅ Main Logged-in Page
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <RecorderPanel
        transcript={transcript}
        onTranscription={handleNewTranscription}
        onCopy={handleCopy}
        onClear={handleClear}
        onDownloadTxt={handleDownloadTxt}
      />

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          📝 Transcription History
        </h2>
        <HistoryList
          items={history.map((item) => ({
            id: item.id,
            text: item.text,
            date: new Date(item.created_at).toLocaleString(),
          }))}
          onDelete={handleDeleteTranscript}
          onLoad={handleLoadTranscript}
        />
      </div>
    </div>
  );
}
