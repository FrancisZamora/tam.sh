import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Segment } from "./types";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface PopulationRow {
  id: string;
  user_id: string;
  name: string;
  total_population: number;
  segments: Segment[];
  share_id: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedPopulation {
  id: string;
  name: string;
  totalPopulation: number;
  segments: Segment[];
  shareId?: string | null;
}

// ── localStorage helpers (anonymous users) ──────────────────

const STORAGE_KEY = "tam-saved-populations";

export function loadFromLocalStorage(): SavedPopulation[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveToLocalStorage(populations: SavedPopulation[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(populations));
}

// ── Supabase helpers (logged-in users) ──────────────────────

export async function loadFromSupabase(
  supabase: SupabaseClient
): Promise<SavedPopulation[]> {
  const { data, error } = await supabase
    .from("populations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: PopulationRow) => ({
    id: row.id,
    name: row.name,
    totalPopulation: row.total_population,
    segments: row.segments,
    shareId: row.share_id,
  }));
}

export async function saveToSupabase(
  supabase: SupabaseClient,
  name: string,
  totalPopulation: number,
  segments: Segment[]
): Promise<SavedPopulation | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("populations")
    .insert({
      user_id: user.id,
      name,
      total_population: totalPopulation,
      segments,
    })
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    totalPopulation: data.total_population,
    segments: data.segments,
    shareId: data.share_id,
  };
}

export async function deleteFromSupabase(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const { error } = await supabase
    .from("populations")
    .delete()
    .eq("id", id);

  return !error;
}

/**
 * Generate a share link for a population.
 * Sets is_public = true and generates a short share_id.
 */
export async function sharePopulation(
  supabase: SupabaseClient,
  id: string
): Promise<string | null> {
  const shareId = Math.random().toString(36).substring(2, 10);

  const { error } = await supabase
    .from("populations")
    .update({ share_id: shareId, is_public: true })
    .eq("id", id);

  if (error) return null;
  return shareId;
}

/**
 * Load a shared population by share_id (no auth required).
 */
export async function loadSharedPopulation(
  supabase: SupabaseClient,
  shareId: string
): Promise<SavedPopulation | null> {
  const { data, error } = await supabase
    .from("populations")
    .select("*")
    .eq("share_id", shareId)
    .eq("is_public", true)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    totalPopulation: data.total_population,
    segments: data.segments,
    shareId: data.share_id,
  };
}
