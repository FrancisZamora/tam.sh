"use client";

import { useState } from "react";
import { Segment } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface ExportToolbarProps {
  targetRef: React.RefObject<HTMLDivElement>;
  segments: Segment[];
  totalPopulation: number;
  gridSize?: number;
  title?: string;
  tamName?: string;
}

const WATERMARK = "created by github.com/FrancisZamora";

function renderCleanCanvas(
  segments: Segment[],
  totalPopulation: number,
  gridSize: number = 50,
  title?: string,
  tamName?: string
): HTMLCanvasElement {
  const scale = 3; // 3x resolution for high-quality export
  const dotCount = gridSize * gridSize;
  const perDot = totalPopulation / dotCount;
  const dotSize = 12;
  const dotGap = 2;
  const cellSize = dotSize + dotGap;
  const padding = 60;
  const headerHeight = 180;
  const legendHeight = Math.ceil(segments.length / 2) * 30 + 40;
  const watermarkHeight = 40;
  const gridWidth = gridSize * cellSize;
  const gridHeight = gridSize * cellSize;
  const canvasWidth = Math.max(gridWidth + padding * 2, 600);
  const canvasHeight = headerHeight + gridHeight + legendHeight + watermarkHeight + padding * 2;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth * scale;
  canvas.height = canvasHeight * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Title: TAM.SH
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("TAM.SH", canvasWidth / 2, padding + 45);

  // Subtitle: Total Addressable Market Visualization Tool
  ctx.fillStyle = "#9ca3af";
  ctx.font = "16px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    "Total Addressable Market Visualization Tool",
    canvasWidth / 2,
    padding + 72
  );

  // Current TAM name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    tamName || title || "World Population — AI Usage",
    canvasWidth / 2,
    padding + 105
  );

  // Dot info
  ctx.fillStyle = "#9ca3af";
  ctx.font = "18px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    `Each dot is ${formatNumber(Math.round(perDot))} people`,
    canvasWidth / 2,
    padding + 135
  );

  ctx.fillStyle = "#6b7280";
  ctx.font = "14px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    `${dotCount.toLocaleString()} dots = ${formatNumber(totalPopulation)} total`,
    canvasWidth / 2,
    padding + 155
  );

  // Build dot color array
  const dotColors: string[] = [];
  for (const seg of segments) {
    const count = Math.round((seg.count / totalPopulation) * dotCount);
    for (let i = 0; i < count && dotColors.length < dotCount; i++) {
      dotColors.push(seg.color);
    }
  }
  while (dotColors.length < dotCount) {
    dotColors.push(segments[0]?.color || "#6b7280");
  }

  // Draw grid
  const gridStartX = (canvasWidth - gridWidth) / 2;
  const gridStartY = headerHeight + padding;

  for (let i = 0; i < dotCount; i++) {
    const col = i % gridSize;
    const row = Math.floor(i / gridSize);
    const x = gridStartX + col * cellSize;
    const y = gridStartY + row * cellSize;
    ctx.fillStyle = dotColors[i];
    ctx.beginPath();
    ctx.roundRect(x, y, dotSize, dotSize, 2);
    ctx.fill();
  }

  // Legend
  const legendStartY = gridStartY + gridHeight + 30;
  ctx.textAlign = "left";
  const legendCols = 2;
  const legendColWidth = (canvasWidth - padding * 2) / legendCols;

  segments.forEach((seg, i) => {
    const col = i % legendCols;
    const row = Math.floor(i / legendCols);
    const x = padding + col * legendColWidth;
    const y = legendStartY + row * 28;
    const pct = (seg.count / totalPopulation) * 100;
    const pctStr = pct < 1 ? `${pct.toFixed(2)}%` : `${Math.round(pct)}%`;

    // Color swatch
    ctx.fillStyle = seg.color;
    ctx.beginPath();
    ctx.roundRect(x, y - 10, 14, 14, 2);
    ctx.fill();

    // Label
    ctx.fillStyle = "#d1d5db";
    ctx.font = "13px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      `${seg.name} · ${formatNumber(seg.count)} (${pctStr})`,
      x + 20,
      y + 2
    );
  });

  // Watermark
  ctx.fillStyle = "#4b5563";
  ctx.font = "12px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(WATERMARK, canvasWidth / 2, canvasHeight - 15);

  return canvas;
}

export default function ExportToolbar({
  segments,
  totalPopulation,
  gridSize = 50,
  title,
  tamName,
}: ExportToolbarProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportPNG = async () => {
    setExporting("png");
    try {
      const canvas = renderCleanCanvas(segments, totalPopulation, gridSize, title, tamName);
      const link = document.createElement("a");
      link.download = "tam-analysis.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(null);
    }
  };

  const exportJPEG = async () => {
    setExporting("jpeg");
    try {
      const canvas = renderCleanCanvas(segments, totalPopulation, gridSize, title, tamName);
      const link = document.createElement("a");
      link.download = "tam-analysis.jpg";
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
    } finally {
      setExporting(null);
    }
  };

  const exportPDF = async () => {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const canvas = renderCleanCanvas(segments, totalPopulation, gridSize, title, tamName);
      const imgData = canvas.toDataURL("image/png");

      const imgWidth = 190;
      const imgHeight = (canvas.height / canvas.width) * imgWidth;

      const pdf = new jsPDF("p", "mm", "a4");

      // Black background
      pdf.setFillColor(10, 10, 10);
      pdf.rect(0, 0, 210, 297, "F");

      // Add the clean rendered image
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, Math.min(imgHeight, 270));

      pdf.save("tam-analysis.pdf");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex items-center gap-2 justify-center">
      <span className="text-xs text-gray-500 mr-1">Export:</span>
      <button
        onClick={exportPNG}
        disabled={!!exporting}
        className="text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 px-3 py-1.5 rounded border border-gray-700 transition-colors"
      >
        {exporting === "png" ? "⏳" : "📸 PNG"}
      </button>
      <button
        onClick={exportJPEG}
        disabled={!!exporting}
        className="text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 px-3 py-1.5 rounded border border-gray-700 transition-colors"
      >
        {exporting === "jpeg" ? "⏳" : "🖼️ JPEG"}
      </button>
      <button
        onClick={exportPDF}
        disabled={!!exporting}
        className="text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 px-3 py-1.5 rounded border border-gray-700 transition-colors"
      >
        {exporting === "pdf" ? "⏳" : "📄 PDF"}
      </button>
    </div>
  );
}
