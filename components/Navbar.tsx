"use client";

import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-white/10 bg-[#09051A]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

        {/* LOGO */}
        <a href="/" className="text-2xl font-black">
          STAR<span className="text-pink-500">TV</span>
          <span className="ml-1 text-yellow-400">★</span>
        </a>

        {/* DESKTOP NAV */}
        <div className="hidden items-center gap-7 md:flex">

          <a
            href="/"
            className="text-gray-400 transition hover:text-white"
          >
            Home
          </a>

          <a
            href="/explore"
            className="text-gray-400 transition hover:text-white"
          >
            Explore
          </a>

          <a
            href="/challenges"
            className="text-gray-400 transition hover:text-white"
          >
            Challenges
          </a>

          <a
            href="/leaderboard"
            className="text-gray-400 transition hover:text-white"
          >
            Leaderboard
          </a>

          <a
            href="/creators"
            className="text-gray-400 transition hover:text-white"
          >
            Creators
          </a>

        </div>

        {/* DESKTOP BUTTON */}
        <a
          href="/register"
          className="hidden rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2.5 text-sm font-bold transition hover:scale-105 md:block"
        >
          Join Star TV
        </a>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xl md:hidden"
          aria-label="Open menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="border-t border-white/10 px-6 pb-6 pt-4 md:hidden">

          <div className="flex flex-col gap-2">

            <a
              href="/"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              🏠 Home
            </a>

            <a
              href="/explore"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              🔎 Explore
            </a>

            <a
              href="/challenges"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              ⭐ Challenges
            </a>

            <a
              href="/leaderboard"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              🏆 Leaderboard
            </a>

            <a
              href="/creators"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              👥 Creators
            </a>

            <a
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 text-center font-bold"
            >
              Join Star TV ⭐
            </a>

          </div>

        </div>
      )}

    </nav>
  );
}