"use client";

import React from "react";

interface TranscriptPanelProps {
  transcript: string;
  onCopy: () => void;
  onClear: () => void;
  onDownloadTxt: () => void;
}

export default function TranscriptPanel({
  transcript,
  onCopy,
  onClear,
  onDownloadTxt,
}: TranscriptPanelProps) {
  return (
    <div className="w-full bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 text-left">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">🗒️ Transcription</h2>

      <textarea
        value={transcript || "No transcription yet."}
        readOnly
        onFocus={(e) => e.currentTarget.blur()}
        className="w-full min-h-[120px] bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg p-4 resize-none select-text caret-transparent border border-gray-200 dark:border-gray-600"
        placeholder="Your transcription will appear here..."
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onCopy}
          disabled={!transcript}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Copy
        </button>
        <button
          onClick={onDownloadTxt}
          disabled={!transcript}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Download
        </button>
        <button
          onClick={onClear}
          disabled={!transcript}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
