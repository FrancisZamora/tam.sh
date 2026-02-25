"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { DEFAULT_TAM_DATA, Segment, PRESET_POPULATIONS } from "@/lib/types";
import { formatNumber, generateId } from "@/lib/utils";
import {
  createClient,
  loadFromLocalStorage,
  saveToLocalStorage,
  loadFromSupabase,
  saveToSupabase,
  deleteFromSupabase,
  loadSharedPopulation,
} from "@/lib/supabase";
import type { SavedPopulation } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import DotGrid from "./DotGrid";
import Legend from "./Legend";
import SegmentEditor from "./SegmentEditor";
import AIAnalysis from "./AIAnalysis";
import AuthButton from "./AuthButton";
import PopulationDropdown from "./PopulationDropdown";
import ExportToolbar from "./ExportToolbar";

export default function TAMVisualizer() {
  const searchParams = useSearchParams();
  const exportRef = useRef<HTMLDivElement>(null);

  const [segments, setSegments] = useState<Segment[]>(
    DEFAULT_TAM_DATA.segments
  );
  const [totalPopulation, setTotalPopulation] = useState(
    DEFAULT_TAM_DATA.totalPopulation
  );
  const [dotCount] = useState(DEFAULT_TAM_DATA.dotCount);

  // Auth + population state
  const [user, setUser] = useState<User | null>(null);
  const [savedPopulations, setSavedPopulations] = useState<SavedPopulation[]>(
    []
  );
  const [currentPopulationId, setCurrentPopulationId] =
    useState("preset-world-ai");

  // Save prompt state (shown after AI generates results)
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [pendingSaveName, setPendingSaveName] = useState("");

  // Current TAM display name
  const [currentTamName, setCurrentTamName] = useState("World Population — AI Usage");

  // ── Auth listener ────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Load saved populations when auth state changes ───────
  useEffect(() => {
    let cancelled = false;
    if (user) {
      const supabase = createClient();
      loadFromSupabase(supabase).then((pops) => {
        if (!cancelled) setSavedPopulations(pops);
      });
    } else {
      const local = loadFromLocalStorage();
      Promise.resolve().then(() => {
        if (!cancelled) setSavedPopulations(local);
      });
    }
    return () => { cancelled = true; };
  }, [user]);

  // ── Load shared population from URL ──────────────────────
  useEffect(() => {
    const shareId = searchParams.get("share");
    if (shareId) {
      const supabase = createClient();
      loadSharedPopulation(supabase, shareId).then((pop) => {
        if (pop) {
          setSegments(pop.segments.map((s) => ({ ...s })));
          setTotalPopulation(pop.totalPopulation);
          setCurrentPopulationId(pop.id);
        }
      });
    }
  }, [searchParams]);

  const perDot = totalPopulation / dotCount;

  // ── Handlers ─────────────────────────────────────────────
  const handleAIResult = (
    newSegments: Segment[],
    total: number,
    market: string,
    populationLabel: string
  ) => {
    setSegments(newSegments);
    setTotalPopulation(total);
    setCurrentPopulationId("custom");
    // Show save prompt with auto-generated name
    const name = `${market} - ${populationLabel}`;
    setPendingSaveName(name);
    setCurrentTamName(name);
    setShowSavePrompt(true);
  };

  const handleSelectPopulation = (pop: SavedPopulation) => {
    setSegments(pop.segments.map((s) => ({ ...s })));
    setTotalPopulation(pop.totalPopulation);
    setCurrentPopulationId(pop.id);
    setCurrentTamName(pop.name);
    setShowSavePrompt(false);
  };

  const handleSavePopulation = async (name: string) => {
    if (user) {
      const supabase = createClient();
      const saved = await saveToSupabase(
        supabase,
        name,
        totalPopulation,
        segments
      );
      if (saved) {
        setSavedPopulations((prev) => [saved, ...prev]);
        setCurrentPopulationId(saved.id);
      }
    } else {
      const newPop: SavedPopulation = {
        id: generateId(),
        name,
        totalPopulation,
        segments: segments.map((s) => ({ ...s })),
      };
      const updated = [newPop, ...savedPopulations];
      setSavedPopulations(updated);
      saveToLocalStorage(updated);
      setCurrentPopulationId(newPop.id);
    }
    setShowSavePrompt(false);
  };

  const handleSaveConfirm = () => {
    if (pendingSaveName.trim()) {
      handleSavePopulation(pendingSaveName.trim());
    }
  };

  const handleDismissCustom = () => {
    setShowSavePrompt(false);
    // Reset to default preset
    const preset = PRESET_POPULATIONS[0];
    setSegments(preset.segments.map((s) => ({ ...s })));
    setTotalPopulation(preset.totalPopulation);
    setCurrentPopulationId(preset.id);
    setCurrentTamName(preset.name);
  };

  const handleDeletePopulation = async (id: string) => {
    if (user) {
      const supabase = createClient();
      const ok = await deleteFromSupabase(supabase, id);
      if (ok) {
        setSavedPopulations((prev) => prev.filter((p) => p.id !== id));
        if (currentPopulationId === id) {
          const preset = PRESET_POPULATIONS[0];
          setCurrentPopulationId(preset.id);
          setSegments(preset.segments.map((s) => ({ ...s })));
          setTotalPopulation(preset.totalPopulation);
          setCurrentTamName(preset.name);
        }
      }
    } else {
      const updated = savedPopulations.filter((p) => p.id !== id);
      setSavedPopulations(updated);
      saveToLocalStorage(updated);
      if (currentPopulationId === id) {
        const preset = PRESET_POPULATIONS[0];
        setCurrentPopulationId(preset.id);
        setSegments(preset.segments.map((s) => ({ ...s })));
        setTotalPopulation(preset.totalPopulation);
        setCurrentTamName(preset.name);
      }
    }
  };

  const handleAuthChange = (newUser: User | null) => {
    setUser(newUser);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Top bar: auth */}
        <div className="flex justify-end mb-4">
          <AuthButton user={user} onAuthChange={handleAuthChange} />
        </div>

        {/* Exportable area */}
        <div ref={exportRef}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-6xl sm:text-8xl font-bold tracking-tight text-white mb-1">
              TAM.SH
            </h1>
            <p className="text-base sm:text-lg text-gray-400 mb-3">
              Total Addressable Market Visualization Tool
            </p>

            {/* Current TAM name with save/dismiss */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">
                {currentTamName}
              </h2>
              {showSavePrompt && (
                <>
                  <button
                    onClick={handleSaveConfirm}
                    className="text-sm bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded transition-colors font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleDismissCustom}
                    className="text-gray-400 hover:text-white transition-colors text-lg leading-none px-1"
                    title="Discard and return to preset"
                  >
                    &times;
                  </button>
                </>
              )}
            </div>

            <p className="text-lg sm:text-xl text-gray-300">
              Each dot is {formatNumber(Math.round(perDot))} people
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {dotCount.toLocaleString()} dots ={" "}
              {formatNumber(totalPopulation)} total. Color = segment.
            </p>
          </motion.div>

          {/* Population dropdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <PopulationDropdown
              currentId={currentPopulationId}
              savedPopulations={savedPopulations}
              isLoggedIn={!!user}
              onSelect={handleSelectPopulation}
              onSave={handleSavePopulation}
              onDelete={handleDeletePopulation}
              showSavePrompt={false}
              pendingSaveName={pendingSaveName}
              onSaveConfirm={handleSaveConfirm}
              onSaveDismiss={handleDismissCustom}
            />
          </motion.div>

          {/* Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <DotGrid
              segments={segments}
              totalPopulation={totalPopulation}
              dotCount={dotCount}
            />
          </motion.div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Legend segments={segments} />
          </motion.div>
        </div>

        {/* Export toolbar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <ExportToolbar
            targetRef={exportRef as React.RefObject<HTMLDivElement>}
            segments={segments}
            totalPopulation={totalPopulation}
            tamName={currentTamName}
          />
        </motion.div>

        {/* AI Analysis + Segment Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mt-10 border-t border-gray-800 pt-8">
            <AIAnalysis onResult={handleAIResult} />
            <SegmentEditor
              segments={segments}
              totalPopulation={totalPopulation}
              onSegmentsChange={setSegments}
              onTotalChange={setTotalPopulation}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
