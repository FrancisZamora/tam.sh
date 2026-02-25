"use client";

import { Segment } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface LegendProps {
  segments: Segment[];
}

export default function Legend({ segments }: LegendProps) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center mt-6">
      {segments.map((segment) => {
        const pct = (segment.count / total) * 100;
        return (
          <div key={segment.id} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-gray-300">{segment.name}</span>
            <span className="text-gray-500">
              ~{formatNumber(segment.count)} ({pct < 1 ? `~${pct.toFixed(1)}` : `${Math.round(pct)}`}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}
