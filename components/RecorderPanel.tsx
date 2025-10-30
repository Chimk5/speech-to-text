"use client";

import { useState, useRef, useEffect } from "react";
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (recording) {
      setTimer(0);
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
        setIsProcessing(true);
        await sendToBackend(audioBlob);
        setIsProcessing(false);
        setIsComplete(true);
        setTimeout(() => setIsComplete(false), 2000);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Error accessing microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const sendToBackend = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transcribe`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.transcript) {
        onTranscription(data.transcript);
      } else {
        console.error("Transcription failed:", data.error);
        alert("Transcription failed. Please try again.");
      }
    } catch (error) {
      console.error("Error sending to backend:", error);
      alert("Error connecting to server. Please try again.");
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
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-full transition-all duration-300 text-center select-none">
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

      {/* ✅ caret-transparent + cursor-default added */}
      <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium select-none caret-transparent cursor-default">
        {isComplete
          ? "✅ Transcription complete"
          : isProcessing
          ? "⏳ Processing..."
          : recording
          ? "🎙️ Listening..."
          : "Click to record"}
      </p>

      {/* Timer display - only show when recording */}
      {recording && (
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm font-mono select-none caret-transparent">
          {formatTime(timer)}
        </p>
      )}

      <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-left w-full shadow-inner select-none caret-transparent cursor-default">
        <h3 className="font-semibold mb-2 text-lg">📝 Transcription</h3>
        <p className="text-gray-600 dark:text-gray-400 min-h-[60px] select-none caret-transparent cursor-default whitespace-pre-wrap">
          {transcript || "No transcription yet."}
        </p>
      </div>

      <div className="mt-4 flex justify-center space-x-3">
        <button
          onClick={onCopy}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isProcessing || !transcript}
        >
          Copy
        </button>
        <button
          onClick={onDownloadTxt}
          className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isProcessing || !transcript}
        >
          Download
        </button>
        <button
          onClick={onClear}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isProcessing || !transcript}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
