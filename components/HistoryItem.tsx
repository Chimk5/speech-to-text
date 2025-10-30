"use client";

import { Trash2 } from "lucide-react";

interface HistoryItemProps {
  id: number;
  text: string;
  date: string;
  onDelete: () => void;
  onLoad: () => void;
}

export default function HistoryItem({ text, date, onDelete, onLoad }: HistoryItemProps) {
  return (
    <div
      className="bg-gray-100 dark:bg-gray-600 p-4 rounded-xl flex justify-between items-start border border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-500 transition-all cursor-pointer"
      onClick={onLoad}
    >
      <div className="flex-1">
        <p className="text-gray-900 dark:text-gray-100 line-clamp-2">{text}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{date}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="ml-4 text-red-500 hover:text-red-400 transition-colors"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
