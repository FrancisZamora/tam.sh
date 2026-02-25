"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Segment } from "@/lib/types";
import { buildDotArray, formatNumber } from "@/lib/utils";

interface DotGridProps {
  segments: Segment[];
  totalPopulation: number;
  dotCount: number;
}

export default function DotGrid({
  segments,
  totalPopulation,
  dotCount,
}: DotGridProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const gridRef = useRef<HTMLDivElement>(null);

  const cols = Math.ceil(Math.sqrt(dotCount));

  const dots = useMemo(
    () => buildDotArray(segments, totalPopulation, dotCount),
    [segments, totalPopulation, dotCount]
  );

  const hoveredSegment = hoveredIndex !== null ? dots[hoveredIndex] : null;
  const total = segments.reduce((sum, s) => sum + s.count, 0);

  const handleMouseEnter = useCallback(
    (index: number, e: React.MouseEvent) => {
      setHoveredIndex(index);
      const rect = gridRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltipPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  return (
    <div className="relative" ref={gridRef}>
      <div
        className="grid gap-[1px] sm:gap-[2px] w-full max-w-[700px] mx-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {dots.map((segment, i) => (
          <motion.div
            key={i}
            className="aspect-square rounded-[1px] cursor-pointer"
            style={{ backgroundColor: segment.color }}
            whileHover={{ scale: 1.8, zIndex: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onMouseEnter={(e) => handleMouseEnter(i, e)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>

      <AnimatePresence>
        {hoveredSegment && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 pointer-events-none bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl"
            style={{
              left: Math.min(tooltipPos.x + 12, 300),
              top: tooltipPos.y - 60,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: hoveredSegment.color }}
              />
              <span className="text-white font-medium text-sm">
                {hoveredSegment.name}
              </span>
            </div>
            <div className="text-gray-400 text-xs">
              {formatNumber(hoveredSegment.count)} people (
              {((hoveredSegment.count / total) * 100).toFixed(
                hoveredSegment.count / total < 0.01 ? 2 : 0
              )}
              %)
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
