"use client";

import { useState, useEffect } from "react";
import RecorderPanel from "@/components/RecorderPanel";
import HistoryList from "@/components/HistoryList";

export default function HomePage() {
  const [transcript, setTranscript] = useState<string>("");
  const [history, setHistory] = useState<{ id: number; text: string; date: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 🔁 Fetch transcripts
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transcripts`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setHistory(
          data.map((item: any) => ({
            id: Number(item.id),
            text: item.text || "No text",
            date: new Date(item.created_at).toLocaleString(),
          }))
        );
      }
    } catch (err) {
      console.error("❌ Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleTranscription = async (text: string) => {
    setTranscript(text);
    await fetchHistory();
  };

  const handleCopy = async () => {
    if (transcript) {
      await navigator.clipboard.writeText(transcript);
      alert("✅ Copied to clipboard!");
    }
  };

  const handleClear = () => setTranscript("");

  const handleDownloadTxt = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcription.txt";
    a.click();
  };

  // 🗑️ DELETE transcript
  const handleDelete = async (id: number) => {
    if (!confirm("🗑️ Are you sure you want to delete this transcript?")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/transcripts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      } else {
        console.error("❌ Failed to delete transcript");
      }
    } catch (err) {
      console.error("❌ Error deleting transcript:", err);
    }
  };

  const handleLoad = (text: string) => setTranscript(text);

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-950 p-6 space-y-10">
      <div className="w-full max-w-2xl">
        <RecorderPanel
          transcript={transcript}
          onTranscription={handleTranscription}
          onCopy={handleCopy}
          onClear={handleClear}
          onDownloadTxt={handleDownloadTxt}
        />
      </div>

      <div className="w-full max-w-2xl mt-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          🕘 Transcript History
        </h2>
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">Loading...</p>
        ) : (
          <HistoryList items={history} onDelete={handleDelete} onLoad={handleLoad} />
        )}
      </div>
    </main>
  );
}
