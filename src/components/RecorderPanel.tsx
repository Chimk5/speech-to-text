"use client";

import { useState, useRef } from "react";
import { Mic } from "lucide-react";

interface RecorderPanelProps {
  transcript: string;
  onTranscription: (text: string) => void;
  onCopy: () => void;
  onClear: () => void;
  onDownloadTxt: () => void;
}

export default function RecorderPanel({
  transcript,
  onTranscription,
  onCopy,
  onClear,
  onDownloadTxt,
}: RecorderPanelProps) {
  const [recording, setRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // ✅ added
  const [isComplete, setIsComplete] = useState(false); // ✅ added for complete status
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        setIsProcessing(true); // ✅ show processing before sending
        await sendToBackend(audioBlob);
        setIsProcessing(false); // ✅ hide processing after done
        setIsComplete(true); // ✅ show complete status
        setTimeout(() => setIsComplete(false), 2000); // ✅ hide after 2s
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // ✅ UPDATED FUNCTION (integrates backend + Supabase save)
  const sendToBackend = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    try {
      // 1️⃣ Send to Flask backend for transcription
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transcribe`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.transcript) {
        onTranscription(data.transcript);

        // 2️⃣ Save transcript to Supabase via backend
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transcripts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: data.transcript,
            filename: "recording.webm",
            duration: 10, // You can make this dynamic later
            language: "en",
          }),
        });
      } else {
        console.error("Transcription failed:", data.error);
      }
    } catch (error) {
      console.error("Error sending to backend:", error);
    }
  };

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-full transition-all duration-300 text-center">
      <div
        onClick={!isProcessing ? toggleRecording : undefined}
        className={`cursor-pointer mx-auto flex items-center justify-center w-20 h-20 rounded-full text-white text-3xl transition-all duration-300 ${
          isProcessing
            ? "bg-yellow-500 animate-pulse"
            : recording
            ? "bg-red-500 animate-pulse"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {isProcessing ? (
          <span className="text-4xl animate-pulse">⏳</span>
        ) : (
          <Mic className="w-10 h-10" />
        )}
      </div>

      <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">
        {isComplete
          ? "✅ Transcription complete"
          : isProcessing
          ? "⏳ Processing..."
          : recording
          ? "🎙️ Listening..."
          : "Click to record"}
      </p>

      <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-left w-full shadow-inner">
        <h3 className="font-semibold mb-2 text-lg">📝 Transcription</h3>
        <p className="text-gray-600 dark:text-gray-400 min-h-[60px] pointer-events-none cursor-default select-text">
          {transcript || "No transcription yet."}
        </p>
      </div>

      <div className="mt-4 flex justify-center space-x-3">
        <button
          onClick={onCopy}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
          disabled={isProcessing}
        >
          Copy
        </button>
        <button
          onClick={onDownloadTxt}
          className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm"
          disabled={isProcessing}
        >
          Download
        </button>
        <button
          onClick={onClear}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
          disabled={isProcessing}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
