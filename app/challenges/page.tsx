"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type Challenge = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  prize: string | null;
  deadline: string | null;
  status: "draft" | "active" | "closed";
  created_at: string;
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    loadChallenges();
  }, []);

  async function loadChallenges() {
    setLoading(true);

    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading challenges:", error);
      setChallenges([]);
    } else {
      setChallenges(data || []);
    }

    setLoading(false);
  }

  const categories = [
    "All",
    ...Array.from(
      new Set(challenges.map((challenge) => challenge.category))
    ),
  ];

  const filteredChallenges =
    category === "All"
      ? challenges
      : challenges.filter(
          (challenge) => challenge.category === category
        );

  function getDaysLeft(deadline: string | null) {
    if (!deadline) return null;

    const today = new Date();
    const end = new Date(deadline);

    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const difference =
      end.getTime() - today.getTime();

    return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );
  }

  return (
    <main className="min-h-screen bg-[#080B1A] text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-20 px-6">
        <div className="absolute top-10 left-[-100px] w-[300px] h-[300px] bg-purple-600/20 blur-[100px] rounded-full" />

        <div className="absolute top-20 right-[-100px] w-[300px] h-[300px] bg-pink-500/20 blur-[100px] rounded-full" />

        <div className="max-w-6xl mx-auto relative">
          <div className="max-w-3xl">
            <span className="inline-flex px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm text-white/70 mb-6">
              STAR TV CHALLENGES
            </span>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Your next
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
                {" "}star moment
              </span>
              {" "}starts here.
            </h1>

            <p className="text-white/60 text-lg md:text-xl mt-6 max-w-2xl leading-relaxed">
              Take part in live Star TV challenges, showcase your
              talent and give the audience something to remember.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">

          {/* CATEGORY FILTERS */}
          {!loading && challenges.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-3 mb-10">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition ${
                    category === item
                      ? "bg-white text-black"
                      : "bg-white/10 text-white/60 hover:bg-white/15"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-[360px] rounded-3xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && challenges.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] py-24 px-6 text-center">
              <div className="text-5xl mb-5">✨</div>

              <h2 className="text-2xl font-bold">
                No active challenges yet
              </h2>

              <p className="text-white/50 max-w-md mx-auto mt-3">
                New Star TV challenges will appear here when they
                are published by the Star TV team.
              </p>
            </div>
          )}

          {/* FILTERED EMPTY */}
          {!loading &&
            challenges.length > 0 &&
            filteredChallenges.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] py-20 text-center">
                <h2 className="text-xl font-bold">
                  No challenges in this category
                </h2>

                <button
                  onClick={() => setCategory("All")}
                  className="mt-5 text-sm text-pink-400 font-semibold"
                >
                  View all challenges
                </button>
              </div>
            )}

          {/* CHALLENGE CARDS */}
          {!loading && filteredChallenges.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge) => {
                const daysLeft = getDaysLeft(
                  challenge.deadline
                );

                return (
                  <article
                    key={challenge.id}
                    className="group rounded-3xl overflow-hidden border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition duration-300"
                  >
                    {/* CARD VISUAL */}
                    <div className="h-52 relative overflow-hidden bg-gradient-to-br from-purple-700 via-pink-600 to-blue-700">
                      <div className="absolute inset-0 bg-black/20" />

                      <div className="absolute top-5 left-5">
                        <span className="px-3 py-1.5 rounded-full bg-black/30 backdrop-blur text-xs font-bold">
                          {challenge.category}
                        </span>
                      </div>

                      <div className="absolute bottom-5 left-5">
                        <span className="text-6xl opacity-30">
                          ★
                        </span>
                      </div>

                      <div className="absolute bottom-5 right-5">
                        <span className="px-3 py-1.5 rounded-full bg-green-400 text-black text-xs font-bold">
                          LIVE
                        </span>
                      </div>
                    </div>

                    {/* CARD BODY */}
                    <div className="p-6">
                      <h2 className="text-xl font-bold group-hover:text-pink-400 transition">
                        {challenge.title}
                      </h2>

                      {challenge.description && (
                        <p className="text-white/50 text-sm mt-3 line-clamp-3">
                          {challenge.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <div className="rounded-xl bg-white/5 p-3">
                          <p className="text-xs text-white/40">
                            Prize
                          </p>

                          <p className="font-bold mt-1">
                            {challenge.prize || "TBA"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/5 p-3">
                          <p className="text-xs text-white/40">
                            Deadline
                          </p>

                          <p className="font-bold mt-1">
                            {daysLeft !== null
                              ? daysLeft > 0
                                ? `${daysLeft} days`
                                : daysLeft === 0
                                ? "Today"
                                : "Ended"
                              : "TBA"}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/challenge/${challenge.slug}`}
                        className="block w-full text-center mt-6 bg-white text-black py-3.5 rounded-xl font-bold hover:bg-pink-400 hover:text-white transition"
                      >
                        View Challenge
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xl font-black">
              STAR<span className="text-pink-400">TV</span>
            </div>

            <p className="text-white/40 text-sm mt-1">
              Your talent. Your story. Your star moment.
            </p>
          </div>

          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} Star TV
          </p>
        </div>
      </footer>
    </main>
  );
}