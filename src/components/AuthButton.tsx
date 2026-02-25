"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthButtonProps {
  user: User | null;
  onAuthChange: (user: User | null) => void;
}

export default function AuthButton({ user, onAuthChange }: AuthButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage("Check your email for a confirmation link.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onAuthChange(data.user);
        setShowModal(false);
        resetForm();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onAuthChange(null);
    setShowMenu(false);
    resetForm();
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError(null);
    setMessage(null);
    setIsSignUp(false);
  };

  // ── Logged-in state ──────────────────────────────────────
  if (user) {
    const initial = user.email?.[0]?.toUpperCase() || "?";
    const avatarUrl = user.user_metadata?.avatar_url;

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium hover:bg-blue-500 transition-colors overflow-hidden"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            initial
          )}
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
            <div className="px-3 py-2 text-xs text-gray-400 truncate border-b border-gray-700">
              {user.email}
            </div>
            <button
              onClick={handleSignOut}
              className="w-full px-3 py-2 text-sm text-left text-gray-300 hover:bg-gray-800 transition-colors rounded-b-lg"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Logged-out state ─────────────────────────────────────
  return (
    <>
      <button
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
        className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
      >
        Sign In
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-50 bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm mx-4 w-full shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 text-lg"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold text-white mb-4 text-center">
              {isSignUp ? "Create Account" : "Sign In"}
            </h2>

            {/* Email + Password */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm mb-3 focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm mb-3 focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
            />

            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
            {message && (
              <p className="text-green-400 text-xs mb-3">{message}</p>
            )}

            <button
              onClick={handleEmailAuth}
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors mb-3"
            >
              {loading ? "..." : isSignUp ? "Sign Up" : "Sign In"}
            </button>

            <p className="text-center text-xs text-gray-500">
              {isSignUp
                ? "Already have an account?"
                : "Don't have an account?"}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setMessage(null);
                }}
                className="text-blue-400 hover:text-blue-300 ml-1"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
