"use client";

import HistoryItem from "./HistoryItem";

interface HistoryListProps {
  items: { id: number; text: string; date: string }[];
  onDelete: (id: number) => void;
  onLoad: (text: string) => void;
}

export default function HistoryList({ items, onDelete, onLoad }: HistoryListProps) {
  return (
    <div className="w-full space-y-4 overflow-y-auto max-h-96">
      {items.length > 0 ? (
        items.map((item) => (
          <HistoryItem
            key={item.id}
            id={item.id}
            text={item.text}
            date={item.date}
            onDelete={() => onDelete(item.id)}
            onLoad={() => onLoad(item.text)}
          />
        ))
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">No transcripts yet.</p>
      )}
    </div>
  );
}
