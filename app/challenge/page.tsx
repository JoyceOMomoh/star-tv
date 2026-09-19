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
  category: string;
  description: string | null;
  prize: string | number | null;
  deadline: string | null;
  status: string | null;
};

type Entry = {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  profiles:
    | {
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
      }[]
    | null;
};

type Vote = {
  entry_id: string;
};

export default function ChallengePage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);

  const [showRules, setShowRules] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadChallenge() {
    if (!slug) {
      setError("No challenge was selected.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: challengeData, error: challengeError } =
        await supabase
          .from("challenges")
          .select(
            "id,title,slug,category,description,prize,deadline,status"
          )
          .eq("slug", slug)
          .single();

      if (challengeError) throw challengeError;

      const { data: entryData, error: entryError } = await supabase
        .from("entries")
        .select(
          `
            id,
            title,
            user_id,
            created_at,
            profiles (
              full_name,
              username,
              avatar_url
            )
          `
        )
        .eq("challenge_id", challengeData.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (entryError) throw entryError;

      const entryIds = (entryData || []).map((entry) => entry.id);

      let voteData: Vote[] = [];

      if (entryIds.length > 0) {
        const { data, error: voteError } = await supabase
          .from("votes")
          .select("entry_id")
          .in("entry_id", entryIds);

        if (voteError) throw voteError;

        voteData = (data as Vote[]) || [];
      }

      setChallenge(challengeData as Challenge);
      setEntries((entryData as Entry[]) || []);
      setVotes(voteData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to load this challenge.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadChallenge();
  }, [slug]);

  function formatPrize(prize: string | number | null) {
    if (prize === null || prize === undefined || prize === "") {
      return "Not announced";
    }

    if (typeof prize === "number") {
      return `₦${prize.toLocaleString()}`;
    }

    return prize;
  }

  function getDaysLeft(deadline: string | null) {
    if (!deadline) return "No deadline";

    const difference =
      new Date(deadline).getTime() - new Date().getTime();

    if (difference <= 0) return "Ended";

    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

    return `${days} Day${days === 1 ? "" : "s"}`;
  }

  function getVoteCount(entryId: string) {
    return votes.filter((vote) => vote.entry_id === entryId).length;
  }

  const rankedEntries = [...entries].sort(
    (a, b) => getVoteCount(b.id) - getVoteCount(a.id)
  );

  const topEntries = rankedEntries.slice(0, 5);

  return (
    <main className="min-h-screen bg-[#09051A] text-white">
      <Navbar />

      {loading && (
        <section className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-pink-500" />
            <p className="mt-5 text-gray-400">
              Loading challenge...
            </p>
          </div>
        </section>
      )}

      {!loading && error && (
        <section className="px-6 py-24">
          <div className="mx-auto max-w-xl rounded-3xl border border-red-500/20 bg-red-500/10 p-10 text-center">
            <div className="text-5xl">⚠️</div>

            <h2 className="mt-5 text-2xl font-black">
              Challenge unavailable
            </h2>

            <p className="mt-3 text-gray-400">{error}</p>

            <Link
              href="/challenges"
              className="mt-7 inline-block rounded-full bg-white px-6 py-3 font-bold text-black"
            >
              Back to Challenges
            </Link>
          </div>
        </section>
      )}

      {!loading && !error && challenge && (
        <>
          {/* HERO */}
          <section className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500">
            <div className="absolute inset-0 bg-black/30" />

            <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-24">
              <div className="max-w-3xl">
                <span className="inline-block rounded-full bg-black/30 px-4 py-2 text-xs font-black backdrop-blur">
                  {challenge.status || "ACTIVE"}
                </span>

                <p className="mt-6 text-sm font-bold uppercase tracking-widest text-white/80">
                  {challenge.category}
                </p>

                <h1 className="mt-2 text-4xl font-black leading-tight sm:text-6xl">
                  {challenge.title}
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                  {challenge.description ||
                    "Showcase your talent and become part of the Star TV community."}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href={`/submit?challenge=${encodeURIComponent(
                      challenge.slug
                    )}`}
                    className="rounded-full bg-white px-7 py-3.5 font-bold text-[#09051A] transition hover:scale-105"
                  >
                    Submit My Entry →
                  </Link>

                  <button
                    onClick={() => setShowRules(!showRules)}
                    className="rounded-full border border-white/30 bg-white/10 px-7 py-3.5 font-bold backdrop-blur-md transition hover:bg-white/20"
                  >
                    {showRules ? "Hide Rules" : "View Rules"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* QUICK STATS */}
          <section className="px-6 py-8">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                label="Prize"
                value={formatPrize(challenge.prize)}
                yellow
              />

              <StatCard
                label="Participants"
                value={entries.length.toLocaleString()}
              />

              <StatCard
                label="Time Left"
                value={getDaysLeft(challenge.deadline)}
              />

              <StatCard
                label="Approved Entries"
                value={entries.length.toLocaleString()}
              />
            </div>
          </section>

          {/* RULES */}
          {showRules && (
            <section className="px-6 pb-8">
              <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-[#120A29] p-7 sm:p-9">
                <h2 className="text-2xl font-black">
                  Challenge Information 📋
                </h2>

                <p className="mt-5 leading-8 text-gray-400">
                  Please follow the instructions provided by Star TV for this
                  challenge. Make sure your submission is original and meets
                  the requirements communicated by the Star TV team.
                </p>
              </div>
            </section>
          )}

          {/* MAIN */}
          <section className="px-6 pb-20">
            <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                {/* ABOUT */}
                <div className="rounded-3xl border border-white/10 bg-[#120A29] p-7 sm:p-9">
                  <h2 className="text-2xl font-black">
                    About This Challenge
                  </h2>

                  <p className="mt-5 leading-8 text-gray-400">
                    {challenge.description ||
                      "This Star TV challenge gives participants an opportunity to showcase their creativity and talent."}
                  </p>
                </div>

                {/* PARTICIPATION */}
                <div className="rounded-3xl border border-white/10 bg-[#120A29] p-7 sm:p-9">
                  <h2 className="text-2xl font-black">
                    How To Participate 🚀
                  </h2>

                  <div className="mt-7 grid gap-5 sm:grid-cols-3">
                    <InfoCard
                      icon="📝"
                      title="Create an Account"
                      text="Create your free Star TV account."
                    />

                    <InfoCard
                      icon="🎥"
                      title="Submit Your Entry"
                      text="Upload your talent for this challenge."
                    />

                    <InfoCard
                      icon="🏆"
                      title="Get Votes"
                      text="Share your approved entry and get community votes."
                    />
                  </div>
                </div>
              </div>

              {/* LEADERBOARD */}
              <div>
                <div className="rounded-3xl border border-white/10 bg-[#120A29] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-400">
                        Current
                      </p>

                      <h2 className="text-2xl font-black">
                        Leaderboard
                      </h2>
                    </div>

                    <span className="text-2xl">🏆</span>
                  </div>

                  {topEntries.length === 0 ? (
                    <div className="mt-6 rounded-2xl bg-white/5 p-6 text-center">
                      <div className="text-4xl">🎬</div>

                      <p className="mt-3 font-bold">
                        No approved entries yet
                      </p>

                      <p className="mt-2 text-sm text-gray-500">
                        Be the first participant to enter this challenge.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-3">
                      {topEntries.map((entry, index) => (
                        <div
                          key={entry.id}
                          className="flex items-center gap-3 rounded-2xl bg-white/5 p-3"
                        >
                          <span className="w-6 text-center font-black text-gray-500">
                            {index + 1}
                          </span>

                          {entry.profiles?.[0]?.avatar_url ? (
                            <img
                              src={entry.profiles[0].avatar_url}
                              alt="Participant"
                              className="h-11 w-11 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-xl">
                              ⭐
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">
                              {entry.profiles?.[0]?.full_name ||
                                entry.profiles?.[0]?.username ||
                                "Star Participant"}
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {entry.title}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-bold">
                              {getVoteCount(entry.id).toLocaleString()}
                            </p>

                            <p className="text-xs text-gray-500">
                              votes
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/leaderboard?challenge=${encodeURIComponent(
                      challenge.slug
                    )}`}
                    className="mt-5 block w-full rounded-full border border-white/10 py-3 text-center text-sm font-bold text-gray-300 transition hover:bg-white/5 hover:text-white"
                  >
                    View Full Leaderboard →
                  </Link>
                </div>

                {/* PRIZE */}
                <div className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-600 p-6 text-[#09051A]">
                  <div className="text-4xl">🏆</div>

                  <p className="mt-5 text-sm font-bold uppercase tracking-widest">
                    Grand Prize
                  </p>

                  <h2 className="mt-1 text-4xl font-black">
                    {formatPrize(challenge.prize)}
                  </h2>

                  <p className="mt-3 text-sm font-medium">
                    Prize information is provided by Star TV for this
                    challenge.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-sm text-gray-500 md:flex-row">
          <div className="text-xl font-black text-white">
            STAR<span className="text-pink-500">TV</span> ⭐
          </div>

          <p>
            © 2026 Star TV. Your talent. Your moment. Your star.
          </p>
        </div>
      </footer>
    </main>
  );
}

function StatCard({
  label,
  value,
  yellow = false,
}: {
  label: string;
  value: string;
  yellow?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#120A29] p-5">
      <p className="text-sm text-gray-500">{label}</p>

      <p
        className={`mt-2 text-2xl font-black ${
          yellow ? "text-yellow-400" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-5">
      <div className="text-3xl">{icon}</div>

      <h3 className="mt-4 font-bold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {text}
      </p>
    </div>
  );
}