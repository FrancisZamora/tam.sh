import { Segment } from "./types";

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) {
    const val = n / 1_000_000_000;
    return val % 1 === 0 ? `${val}B` : `~${val.toFixed(1)}B`;
  }
  if (n >= 1_000_000) {
    const val = n / 1_000_000;
    return val % 1 === 0 ? `${val}M` : `~${val.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const val = n / 1_000;
    return val % 1 === 0 ? `${val}K` : `~${val.toFixed(0)}K`;
  }
  return n.toString();
}

export function buildDotArray(
  segments: Segment[],
  totalPopulation: number,
  dotCount: number
): Segment[] {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  const dotSegments: Segment[] = [];

  // Calculate dots per segment proportionally
  let remainingDots = dotCount;
  const dotCounts: { segment: Segment; dots: number }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const proportion = segment.count / total;
    const dots =
      i === segments.length - 1
        ? remainingDots
        : Math.round(proportion * dotCount);
    const actualDots = Math.max(
      segment.count > 0 ? 1 : 0,
      Math.min(dots, remainingDots)
    );
    dotCounts.push({ segment, dots: actualDots });
    remainingDots -= actualDots;
  }

  // Build array: largest segments first (they go at the top of the grid)
  // Reverse so smallest segments are at bottom-left like the reference
  for (const { segment, dots } of dotCounts) {
    for (let j = 0; j < dots; j++) {
      dotSegments.push(segment);
    }
  }

  return dotSegments;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
