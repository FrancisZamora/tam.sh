"use client";

import { Segment } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface SegmentEditorProps {
  segments: Segment[];
  totalPopulation: number;
  onSegmentsChange: (segments: Segment[]) => void;
  onTotalChange: (total: number) => void;
}

const COLORS = [
  "#6b7280",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#8b5cf6",
];

export default function SegmentEditor({
  segments,
  totalPopulation,
  onSegmentsChange,
  onTotalChange,
}: SegmentEditorProps) {
  const updateSegment = (id: string, field: keyof Segment, value: string | number) => {
    onSegmentsChange(
      segments.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addSegment = () => {
    const colorIndex = segments.length % COLORS.length;
    onSegmentsChange([
      ...segments,
      {
        id: generateId(),
        name: "New Segment",
        count: 0,
        color: COLORS[colorIndex],
      },
    ]);
  };

  const removeSegment = (id: string) => {
    if (segments.length <= 1) return;
    onSegmentsChange(segments.filter((s) => s.id !== id));
  };

  return (
    <div className="w-full max-w-[700px] mx-auto mt-8 space-y-4">
      <h2 className="text-lg font-semibold text-white">Configure Segments</h2>

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-400 shrink-0">Total Population:</label>
        <input
          type="text"
          value={totalPopulation.toLocaleString()}
          onChange={(e) => {
            const val = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
            if (!isNaN(val)) onTotalChange(val);
          }}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm w-48 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        {segments.map((segment) => (
          <div
            key={segment.id}
            className="flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-lg p-2"
          >
            <input
              type="color"
              value={segment.color}
              onChange={(e) => updateSegment(segment.id, "color", e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={segment.name}
              onChange={(e) => updateSegment(segment.id, "name", e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm flex-1 min-w-0 focus:outline-none focus:border-blue-500"
              placeholder="Segment name"
            />
            <input
              type="text"
              value={segment.count.toLocaleString()}
              onChange={(e) => {
                const val = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
                if (!isNaN(val)) updateSegment(segment.id, "count", val);
              }}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm w-32 focus:outline-none focus:border-blue-500"
              placeholder="Count"
            />
            <button
              onClick={() => removeSegment(segment.id)}
              className="text-gray-500 hover:text-red-400 transition-colors px-1 text-lg"
              title="Remove segment"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addSegment}
        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        + Add Segment
      </button>
    </div>
  );
}
