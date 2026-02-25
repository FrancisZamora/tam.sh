"use client";

import { useState } from "react";
import { PRESET_POPULATIONS } from "@/lib/types";
import { createClient, sharePopulation } from "@/lib/supabase";
import type { SavedPopulation } from "@/lib/supabase";

interface PopulationDropdownProps {
  currentId: string;
  savedPopulations: SavedPopulation[];
  isLoggedIn: boolean;
  onSelect: (population: SavedPopulation) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
  showSavePrompt: boolean;
  pendingSaveName: string;
  onSaveConfirm: () => void;
  onSaveDismiss: () => void;
}

export default function PopulationDropdown({
  currentId,
  savedPopulations,
  isLoggedIn,
  onSelect,
  onDelete,
  showSavePrompt,
  pendingSaveName,
  onSaveConfirm,
  onSaveDismiss,
}: PopulationDropdownProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const allPopulations = [
    ...PRESET_POPULATIONS.map((p) => ({ ...p, isPreset: true })),
    ...savedPopulations.map((p) => ({ ...p, isPreset: false })),
  ];

  const isUserSaved = savedPopulations.some((p) => p.id === currentId);

  const handleSelect = (id: string) => {
    const pop = allPopulations.find((p) => p.id === id);
    if (pop) onSelect(pop);
    setShareUrl(null);
  };

  const handleShare = async () => {
    if (!isLoggedIn || !isUserSaved) return;
    setSharing(true);
    try {
      const supabase = createClient();
      const shareId = await sharePopulation(supabase, currentId);
      if (shareId) {
        const url = `${window.location.origin}?share=${shareId}`;
        setShareUrl(url);
        await navigator.clipboard.writeText(url).catch(() => {});
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="text-xs text-gray-500 uppercase tracking-wider">Presets</label>
      <div className="flex items-center gap-2 justify-center flex-wrap">
        <select
          value={currentId}
          onChange={(e) => handleSelect(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 max-w-[320px] appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M3 5l3 3 3-3'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            paddingRight: "28px",
          }}
        >
          <optgroup label="Presets">
            {PRESET_POPULATIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </optgroup>
          {savedPopulations.length > 0 && (
            <optgroup label="My TAMs">
              {savedPopulations.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>

        {isUserSaved && isLoggedIn && (
          <button
            onClick={handleShare}
            disabled={sharing}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors px-2 py-1"
          >
            {sharing ? "Sharing..." : "Share"}
          </button>
        )}

        {isUserSaved && (
          <button
            onClick={() => onDelete(currentId)}
            className="text-sm text-red-400/70 hover:text-red-400 transition-colors px-1"
          >
            Delete
          </button>
        )}
      </div>

      {/* Save prompt after AI generates results */}
      {showSavePrompt && (
        <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2">
          <span className="text-sm text-gray-300 truncate max-w-[200px]">
            Save &ldquo;{pendingSaveName}&rdquo;?
          </span>
          <button
            onClick={onSaveConfirm}
            className="text-sm bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded transition-colors font-medium"
          >
            Save This TAM
          </button>
          <button
            onClick={onSaveDismiss}
            className="text-sm text-gray-500 hover:text-gray-400 px-1"
          >
            &times;
          </button>
        </div>
      )}

      {shareUrl && (
        <div className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-1.5">
          Link copied! {shareUrl}
        </div>
      )}
    </div>
  );
}
