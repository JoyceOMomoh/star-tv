"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type Challenge = {
  id: string;
  title: string;
  slug: string;
};

type Profile = {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

type Entry = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  created_at: string;
  user_id: string;
  profiles: Profile[] | null;
};

type Vote = {
  entry_id: string;
};

type RankedEntry = Entry & {
  voteCount: number;
};

export default function LeaderboardPage() {
  const searchParams = useSearchParams();
  const challengeSlug = searchParams.get("challenge");

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [entries, setEntries] = useState<RankedEntry[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLeaderboard() {
    setLoading(true);
    setError("");

    try {
      let selectedChallenge: Challenge | null = null;

      if (challengeSlug) {
        const { data, error: challengeError } = await supabase
          .from("challenges")
          .select("id,title,slug")
          .eq("slug", challengeSlug)
          .single();

        if (challengeError) throw challengeError;

        selectedChallenge = data as Challenge;
      } else {
        const { data, error: challengeError } = await supabase
          .from("challenges")
          .select("id,title,slug")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (challengeError) throw challengeError;

        selectedChallenge = data as Challenge | null;
      }

      if (!selectedChallenge) {
        setChallenge(null);
        setEntries([]);
        return;
      }

      const { data: entryData, error: entryError } = await supabase
        .from("entries")
        .select(
          `
            id,
            title,
            description,
            video_url,
            created_at,
            user_id,
            profiles (
              full_name,
              username,
              avatar_url
            )
          `
        )
        .eq("challenge_id", selectedChallenge.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (entryError) throw entryError;

      const approvedEntries = (entryData as Entry[]) || [];

      if (approvedEntries.length === 0) {
        setChallenge(selectedChallenge);
        setEntries([]);
        return;
      }

      const entryIds = approvedEntries.map((entry) => entry.id);

      const { data: voteData, error: voteError } = await supabase
        .from("votes")
        .select("entry_id")
        .in("entry_id", entryIds);

      if (voteError) throw voteError;

      const votes = (voteData as Vote[]) || [];

      const ranked = approvedEntries
        .map((entry) => ({
          ...entry,
          voteCount: votes.filter(
            (vote) => vote.entry_id === entry.id
          ).length,
        }))
        .sort((a, b) => b.voteCount - a.voteCount);

      setChallenge(selectedChallenge);
      setEntries(ranked);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Unable to load the leaderboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaderboard();
  }, [challengeSlug]);

  function getParticipantName(entry: Entry) {
    const profile = entry.profiles?.[0];

    return (
      profile?.full_name ||
      profile?.username ||
      "Star Participant"
    );
  }

  return (
    <main className="min-h-screen bg-[#09051A] text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-20 text-center">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          {challenge ? (
            <div className="mb-5 inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-sm font-bold text-yellow-300">
              🏆 {challenge.title}
            </div>
          ) : (
            <div className="mb-5 inline-flex rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-2 text-sm font-bold text-purple-300">
              🏆 STAR TV LEADERBOARD
            </div>
          )}

          <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
            Who Will Be The
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Next Star?
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
            Discover approved performances and support your favourite
            contestants.
          </p>
        </div>
      </section>

      {/* LOADING */}
      {loading && (
        <section className="px-6 py-20 text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-purple-500" />

          <p className="text-gray-400">
            Loading the leaderboard...
          </p>
        </section>
      )}

      {/* ERROR */}
      {!loading && error && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-xl rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <div className="mb-4 text-4xl">⚠️</div>

            <h2 className="text-2xl font-black">
              Something went wrong
            </h2>

            <p className="mt-3 text-sm leading-6 text-red-200/70">
              {error}
            </p>

            <button
              onClick={loadLeaderboard}
              className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#09051A]"
            >
              Try Again
            </button>
          </div>
        </section>
      )}

      {/* NO CHALLENGE */}
      {!loading && !error && !challenge && (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <div className="mb-5 text-5xl">🏆</div>

            <h2 className="text-3xl font-black">
              No challenges yet
            </h2>

            <p className="mt-4 leading-7 text-gray-400">
              The leaderboard will become available when Star TV creates a
              challenge.
            </p>

            <Link
              href="/challenges"
              className="mt-7 inline-block rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 px-7 py-3 font-bold"
            >
              View Challenges →
            </Link>
          </div>
        </section>
      )}

      {/* EMPTY */}
      {!loading &&
        !error &&
        challenge &&
        entries.length === 0 && (
          <section className="px-6 py-20">
            <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
              <div className="mb-5 text-5xl">🎬</div>

              <h2 className="text-3xl font-black">
                No approved entries yet
              </h2>

              <p className="mt-4 leading-7 text-gray-400">
                Approved participants will appear on the leaderboard once
                they submit their entries.
              </p>

              <Link
                href="/submit"
                className="mt-7 inline-block rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 px-7 py-3 font-bold"
              >
                Submit Your Entry →
              </Link>
            </div>
          </section>
        )}

      {/* LEADERBOARD */}
      {!loading &&
        !error &&
        challenge &&
        entries.length > 0 && (
          <section className="px-6 pb-24">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400">
                  CURRENT LEADERS
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  Top Performances 🏆
                </h2>
              </div>

              {/* TOP 3 */}
              <div className="grid gap-6 md:grid-cols-3">
                {entries.slice(0, 3).map((entry, index) => {
                  const rank = index + 1;

                  const medals = ["🥇", "🥈", "🥉"];

                  const profile = entry.profiles?.[0];

                  return (
                    <div
                      key={entry.id}
                      className={`overflow-hidden rounded-3xl border ${
                        rank === 1
                          ? "border-yellow-400/30 bg-yellow-400/5"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <div className="relative aspect-video bg-black">
                        {entry.video_url ? (
                          <video
                            src={entry.video_url}
                            controls
                            playsInline
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-5xl">
                            🎬
                          </div>
                        )}

                        <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-sm font-black backdrop-blur">
                          {medals[index]} #{rank}
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-xl font-black">
                          {entry.title}
                        </h3>

                        <p className="mt-1 text-sm text-purple-300">
                          {getParticipantName(entry)}
                        </p>

                        <div className="mt-5">
                          <p className="text-2xl font-black">
                            {entry.voteCount.toLocaleString()}
                          </p>

                          <p className="text-xs text-gray-500">
                            votes
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* REMAINING */}
              {entries.length > 3 && (
                <div className="mt-16">
                  <div className="mb-6">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400">
                      ALL CONTESTANTS
                    </p>

                    <h2 className="mt-2 text-3xl font-black">
                      Current Standings
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {entries.slice(3).map((entry, index) => {
                      const actualRank = index + 4;
                      const profile = entry.profiles?.[0];

                      return (
                        <div
                          key={entry.id}
                          className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/[0.07] sm:flex-row sm:items-center"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-lg font-black">
                            #{actualRank}
                          </div>

                          <div className="h-48 w-full shrink-0 overflow-hidden rounded-2xl bg-black sm:h-24 sm:w-40">
                            {entry.video_url ? (
                              <video
                                src={entry.video_url}
                                controls
                                playsInline
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-3xl">
                                🎬
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-lg font-black">
                              {entry.title}
                            </h3>

                            <p className="mt-1 text-sm text-purple-300">
                              {profile?.full_name ||
                                profile?.username ||
                                "Star Participant"}
                            </p>
                          </div>

                          <div className="text-left sm:text-center">
                            <p className="text-xl font-black">
                              {entry.voteCount.toLocaleString()}
                            </p>

                            <p className="text-xs text-gray-500">
                              votes
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

      {/* CTA */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-r from-purple-700 via-pink-600 to-blue-700 p-10 text-center sm:p-14">
          <h2 className="text-3xl font-black sm:text-4xl">
            Think You Can Be The Next Star? ⭐
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Enter a challenge, show your talent and let the Star TV community
            discover you.
          </p>

          <Link
            href="/challenges"
            className="mt-7 inline-block rounded-full bg-white px-7 py-3 font-black text-[#09051A]"
          >
            View Challenges →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-gray-500 sm:flex-row">
          <p>
            © 2026 Star TV. Your Talent. Your Moment. Your Star.
          </p>

          <div className="flex gap-5">
            <Link href="/" className="hover:text-white">
              Home
            </Link>

            <Link href="/challenges" className="hover:text-white">
              Challenges
            </Link>

            <Link href="/submit" className="hover:text-white">
              Submit
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}