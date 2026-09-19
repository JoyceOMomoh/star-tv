"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type MediaItem = {
  id: string;
  title: string;
  description: string | null;
  media_type: "video" | "photo";
  category: string;
  year: number | null;
  file_url: string;
  featured: boolean;
  created_at: string;
};

type Entry = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  status: string;
  created_at: string;
  user_id: string;
  challenge_id: string | null;
};

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

type Challenge = {
  id: string;
  title: string;
  category: string;
};

const categories = [
  "All",
  "Entertainment",
  "Dance",
  "Music",
  "Comedy",
  "Acting",
  "Art",
  "Gaming",
  "Events",
  "Interviews",
];

export default function ExplorePage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadExplore();
  }, []);

  async function loadExplore() {
    setLoading(true);
    setError("");

    try {
      const [
        mediaResult,
        entriesResult,
        profilesResult,
        challengesResult,
      ] = await Promise.all([
        supabase
          .from("media")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false }),

        supabase
          .from("entries")
          .select(
            "id, title, description, video_url, status, created_at, user_id, challenge_id"
          )
          .eq("status", "approved")
          .order("created_at", { ascending: false }),

        supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url"),

        supabase
          .from("challenges")
          .select("id, title, category"),
      ]);

      if (mediaResult.error) {
        throw mediaResult.error;
      }

      if (entriesResult.error) {
        throw entriesResult.error;
      }

      if (profilesResult.error) {
        throw profilesResult.error;
      }

      if (challengesResult.error) {
        throw challengesResult.error;
      }

      setMedia(mediaResult.data || []);
      setEntries(entriesResult.data || []);
      setProfiles(profilesResult.data || []);
      setChallenges(challengesResult.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load Star TV content.");
    } finally {
      setLoading(false);
    }
  }

  const getProfile = (userId: string) => {
    return profiles.find((profile) => profile.id === userId);
  };

  const getChallenge = (challengeId: string | null) => {
    if (!challengeId) return null;

    return challenges.find(
      (challenge) => challenge.id === challengeId
    );
  };

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      const matchesSearch =
        item.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.description
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        item.category.toLowerCase() === category.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [media, search, category]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const challenge = getChallenge(entry.challenge_id);

      const matchesSearch =
        entry.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        entry.description
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        challenge?.category?.toLowerCase() ===
          category.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [entries, search, category, challenges]);

  const featuredMedia =
    media.find((item) => item.featured) || media[0];

  return (
    <main className="min-h-screen bg-[#070B1A] text-white">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#070B1A]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">

          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            STAR<span className="text-pink-500">TV</span>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-semibold text-gray-400 md:flex">
            <Link href="/" className="hover:text-white">
              Home
            </Link>

            <Link href="/explore" className="text-white">
              Explore
            </Link>

            <Link href="/challenges" className="hover:text-white">
              Challenges
            </Link>

            <Link href="/leaderboard" className="hover:text-white">
              Leaderboard
            </Link>

            <Link href="/creators" className="hover:text-white">
              Creators
            </Link>
          </div>

          <Link
            href="/register"
            className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2.5 text-sm font-bold"
          >
            Join Star TV
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-5 pb-16 pt-16 md:px-8 md:pt-24">

        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-purple-600/20 blur-[100px]" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-pink-500/20 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">

          <p className="text-sm font-bold uppercase tracking-[0.3em] text-pink-400">
            Discover Star TV
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            Explore the moments,
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent">
              {" "}talent & stories
            </span>
            {" "}of Star TV.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
            Discover performances, events, interviews, challenges
            and unforgettable moments from the Star TV community.
          </p>

          {/* SEARCH */}
          <div className="mt-10 max-w-2xl">
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <span className="mr-3 text-xl">🔎</span>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Star TV content..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-600"
              />
            </div>
          </div>

        </div>
      </section>

      {/* CATEGORY FILTER */}
      <section className="px-5 md:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="flex gap-3 overflow-x-auto pb-3">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  category === item
                    ? "bg-white text-black"
                    : "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* CONTENT */}
      <section className="px-5 py-12 md:px-8 md:py-16">

        <div className="mx-auto max-w-7xl">

          {loading && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-16 text-center">
              <p className="text-gray-400">
                Loading Star TV content...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* FEATURED */}
              {featuredMedia && (
                <div className="mb-16">

                  <div className="mb-6 flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-pink-400">
                        Featured
                      </p>

                      <h2 className="mt-2 text-2xl font-black md:text-3xl">
                        Star TV Spotlight
                      </h2>
                    </div>
                  </div>

                  <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] lg:grid-cols-2">

                    <div className="aspect-video bg-black lg:aspect-auto">

                      {featuredMedia.media_type === "video" ? (
                        <video
                          src={featuredMedia.file_url}
                          controls
                          className="h-full min-h-[300px] w-full object-cover"
                        />
                      ) : (
                        <img
                          src={featuredMedia.file_url}
                          alt={featuredMedia.title}
                          className="h-full min-h-[300px] w-full object-cover"
                        />
                      )}

                    </div>

                    <div className="flex flex-col justify-center p-7 md:p-10">

                      <span className="w-fit rounded-full bg-pink-500/10 px-3 py-1 text-xs font-bold text-pink-400">
                        {featuredMedia.category}
                      </span>

                      <h3 className="mt-5 text-3xl font-black">
                        {featuredMedia.title}
                      </h3>

                      {featuredMedia.description && (
                        <p className="mt-4 text-sm leading-7 text-gray-400">
                          {featuredMedia.description}
                        </p>
                      )}

                      {featuredMedia.year && (
                        <p className="mt-5 text-sm text-gray-500">
                          Star TV • {featuredMedia.year}
                        </p>
                      )}

                    </div>
                  </div>
                </div>
              )}

              {/* STAR TV LIBRARY */}
              <div>

                <div className="mb-7 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-purple-400">
                      Company Archive
                    </p>

                    <h2 className="mt-2 text-2xl font-black md:text-3xl">
                      Star TV Library
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      Videos and photographs from the Star TV journey.
                    </p>
                  </div>

                  <span className="hidden text-sm text-gray-500 sm:block">
                    {filteredMedia.length} items
                  </span>
                </div>

                {filteredMedia.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
                    <div className="text-4xl">🎬</div>

                    <p className="mt-4 text-sm text-gray-500">
                      No library content matches your search.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                    {filteredMedia.map((item) => (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:bg-white/[0.05]"
                      >

                        <div className="aspect-video bg-black">

                          {item.media_type === "video" ? (
                            <video
                              src={item.file_url}
                              controls
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <img
                              src={item.file_url}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          )}

                        </div>

                        <div className="p-5">

                          <div className="flex items-center justify-between gap-3">

                            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-[10px] font-bold uppercase text-purple-300">
                              {item.category}
                            </span>

                            {item.year && (
                              <span className="text-xs text-gray-600">
                                {item.year}
                              </span>
                            )}

                          </div>

                          <h3 className="mt-4 font-bold">
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                              {item.description}
                            </p>
                          )}

                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </div>

              {/* CHALLENGE DISCOVERIES */}
              <div className="mt-20">

                <div className="mb-7">
                  <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">
                    Community
                  </p>

                  <h2 className="mt-2 text-2xl font-black md:text-3xl">
                    Latest Challenge Discoveries
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Explore approved performances from Star TV challenges.
                  </p>
                </div>

                {filteredEntries.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
                    <div className="text-4xl">⭐</div>

                    <p className="mt-4 text-sm text-gray-500">
                      No approved challenge entries yet.
                    </p>

                    <Link
                      href="/challenges"
                      className="mt-5 inline-block rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 text-sm font-bold text-white"
                    >
                      View Challenges
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                    {filteredEntries.map((entry) => {
                      const profile = getProfile(entry.user_id);
                      const challenge = getChallenge(
                        entry.challenge_id
                      );

                      return (
                        <div
                          key={entry.id}
                          className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                        >

                          <div className="aspect-video bg-black">
                            <video
                              src={entry.video_url}
                              controls
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="p-5">

                            <div className="flex items-center gap-3">

                              {profile?.avatar_url ? (
                                <img
                                  src={profile.avatar_url}
                                  alt=""
                                  className="h-9 w-9 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-black">
                                  {(profile?.full_name ||
                                    "S")[0]}
                                </div>
                              )}

                              <div>
                                <p className="text-sm font-bold">
                                  {profile?.full_name ||
                                    profile?.username ||
                                    "Star TV Creator"}
                                </p>

                                {challenge && (
                                  <p className="text-xs text-pink-400">
                                    {challenge.title}
                                  </p>
                                )}
                              </div>

                            </div>

                            <h3 className="mt-5 font-bold">
                              {entry.title}
                            </h3>

                            {entry.description && (
                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                                {entry.description}
                              </p>
                            )}

                          </div>

                        </div>
                      );
                    })}

                  </div>
                )}

              </div>
            </>
          )}

        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 md:px-8">

        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-pink-600 to-orange-500 p-8 md:p-12">

          <div className="max-w-2xl">

            <p className="text-sm font-bold uppercase tracking-widest text-white/70">
              Your moment
            </p>

            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              Think you have what it takes?
            </h2>

            <p className="mt-4 text-sm leading-6 text-white/80">
              Join the next Star TV challenge and put your talent
              in front of the community.
            </p>

            <Link
              href="/challenges"
              className="mt-7 inline-block rounded-xl bg-white px-6 py-3 text-sm font-black text-black transition hover:scale-105"
            >
              Explore Challenges →
            </Link>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-5 py-8 md:px-8">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-gray-500 md:flex-row md:items-center">

          <p>
            © {new Date().getFullYear()} Star TV. All rights reserved.
          </p>

          <p>
            Your Talent. Your Story. Your Star Moment.
          </p>

        </div>

      </footer>

    </main>
  );
}