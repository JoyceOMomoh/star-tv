"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type Media = {
  id: string;
  title: string;
  description: string | null;
  media_type: "video" | "photo";
  category: string;
  year: number | null;
  file_url: string;
  featured: boolean;
  published: boolean;
  created_at: string;
};

type Entry = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  created_at: string;
  user_id: string;
  profiles:
    | {
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
      }[]
    | null;
};

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

const categoryIcons: Record<string, string> = {
  Music: "🎤",
  Comedy: "😂",
  Dance: "💃",
  Acting: "🎬",
  Art: "🎨",
  Gaming: "🎮",
  Podcast: "🎙️",
  Podcasts: "🎙️",
};

const gradients = [
  "from-pink-500 to-orange-400",
  "from-purple-500 to-pink-500",
  "from-blue-500 to-purple-600",
  "from-yellow-400 to-pink-500",
];

export default function Home() {
  const [media, setMedia] = useState<Media[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [creatorCount, setCreatorCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHomepage() {
    setLoading(true);
    setError("");

    try {
      const [
        mediaResult,
        entriesResult,
        challengesResult,
        profilesResult,
      ] = await Promise.all([
        supabase
          .from("media")
          .select(
            "id,title,description,media_type,category,year,file_url,featured,published,created_at"
          )
          .eq("published", true)
          .order("created_at", { ascending: false }),

        supabase
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
          .eq("status", "approved")
          .order("created_at", { ascending: false }),

        supabase
          .from("challenges")
          .select(
            "id,title,slug,category,description,prize,deadline,status"
          )
          .order("created_at", { ascending: false }),

        supabase.from("profiles").select("id", {
          count: "exact",
          head: true,
        }),
      ]);

      if (mediaResult.error) throw mediaResult.error;
      if (entriesResult.error) throw entriesResult.error;
      if (challengesResult.error) throw challengesResult.error;
      if (profilesResult.error) throw profilesResult.error;

      setMedia((mediaResult.data as Media[]) || []);
      setEntries((entriesResult.data as Entry[]) || []);
      setChallenges((challengesResult.data as Challenge[]) || []);
      setCreatorCount(profilesResult.count || 0);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to load Star TV.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHomepage();
  }, []);

  const publishedContentCount = media.length + entries.length;

  const featuredMedia =
    media.find((item) => item.featured) || media[0] || null;

  const latestContent = useMemo(() => {
    const mediaItems = media.map((item) => ({
      type: "media" as const,
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      file_url: item.file_url,
      media_type: item.media_type,
      created_at: item.created_at,
      creator: "Star TV",
    }));

    const entryItems = entries.map((item) => ({
      type: "entry" as const,
      id: item.id,
      title: item.title,
      description: item.description,
      category: "Challenge",
      file_url: item.video_url,
      media_type: "video" as const,
      created_at: item.created_at,
      creator:
        item.profiles?.[0]?.full_name ||
        item.profiles?.[0]?.username ||
        "Star Participant",
    }));

    return [...mediaItems, ...entryItems]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
      .slice(0, 4);
  }, [media, entries]);

  const categories = useMemo(() => {
    const values = new Set<string>();

    media.forEach((item) => {
      if (item.category) values.add(item.category);
    });

    challenges.forEach((challenge) => {
      if (challenge.category) values.add(challenge.category);
    });

    return Array.from(values).slice(0, 8);
  }, [media, challenges]);

  const featuredChallenge =
    challenges.find(
      (challenge) =>
        challenge.status?.toLowerCase() === "active" ||
        challenge.status?.toLowerCase() === "live"
    ) ||
    challenges[0] ||
    null;

  const latestStar = entries[0] || null;

  function formatPrize(prize: string | number | null) {
    if (prize === null || prize === undefined || prize === "") {
      return "Prize not announced";
    }

    if (typeof prize === "number") {
      return `₦${prize.toLocaleString()}`;
    }

    return prize;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#09051A] text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative px-6 pb-24 pt-16 md:px-12 md:pt-24">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-pink-600/30 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm">
              <span className="text-yellow-300">★</span>
              Where creators take the spotlight
            </div>

            <h1 className="text-5xl font-black leading-[1.05] md:text-7xl">
              YOUR TALENT.
              <br />
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                YOUR MOMENT.
              </span>
              <br />
              YOUR STAR. ⭐
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-gray-400 md:text-xl">
              Create, share and discover amazing content from talented people
              around the world.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-7 py-4 font-bold shadow-lg shadow-pink-500/20 transition hover:scale-105"
              >
                ✨ Create Content
              </Link>

              <Link
                href="/explore"
                className="rounded-full border border-white/20 bg-white/5 px-7 py-4 font-bold transition hover:bg-white/10"
              >
                ▶ Explore Stars
              </Link>
            </div>

            {/* REAL STATS */}
            <div className="mt-12 flex flex-wrap gap-8">
              <div>
                <p className="text-2xl font-bold">
                  {creatorCount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Creators</p>
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {publishedContentCount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Content</p>
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {challenges.length.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Challenges</p>
              </div>
            </div>
          </div>

          {/* DYNAMIC FEATURED CONTENT */}
          <div className="relative flex justify-center">
            <div className="relative h-[400px] w-[300px] md:h-[500px] md:w-[390px]">
              <div className="absolute inset-0 rotate-3 rounded-[40px] bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 shadow-2xl shadow-purple-900/40" />

              <div className="absolute inset-3 overflow-hidden rounded-[36px] bg-[#120A29]">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-pink-500" />
                  </div>
                ) : featuredMedia ? (
                  <div className="flex h-full flex-col">
                    <div className="h-3/5 bg-black">
                      {featuredMedia.media_type === "video" ? (
                        <video
                          src={featuredMedia.file_url}
                          controls
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={featuredMedia.file_url}
                          alt={featuredMedia.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    <div className="p-6">
                      <div className="mb-2 text-xs font-semibold text-pink-400">
                        {featuredMedia.featured
                          ? "FEATURED ON STAR TV"
                          : "LATEST ON STAR TV"}
                      </div>

                      <h3 className="text-2xl font-bold">
                        {featuredMedia.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-gray-400">
                        {featuredMedia.description ||
                          "Discover this Star TV moment."}
                      </p>

                      <Link
                        href="/explore"
                        className="mt-5 inline-block text-sm font-bold text-pink-300"
                      >
                        Explore content →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                    <div className="text-7xl">⭐</div>
                    <h3 className="mt-6 text-2xl font-black">
                      Star TV is getting ready
                    </h3>
                    <p className="mt-3 text-gray-400">
                      Featured content will appear here when the admin
                      publishes it.
                    </p>
                  </div>
                )}
              </div>

              <div className="absolute -right-8 -top-10 flex h-20 w-20 rotate-12 items-center justify-center rounded-3xl bg-yellow-300 text-4xl text-black shadow-xl">
                ⭐
              </div>

              <div className="absolute -bottom-8 -left-10 flex h-16 w-16 items-center justify-center rounded-full bg-pink-500 text-2xl shadow-xl">
                ❤️
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <section className="px-6 pb-10">
          <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center text-sm text-red-200">
            {error}
          </div>
        </section>
      )}

      {/* LATEST CONTENT */}
      <section
        id="explore"
        className="bg-[#0D0821] px-6 py-20 md:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 font-semibold text-pink-400">DISCOVER</p>
              <h2 className="text-3xl font-black md:text-5xl">
                Latest on Star TV ✨
              </h2>
            </div>

            <Link
              href="/explore"
              className="hidden text-gray-400 transition hover:text-white md:block"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-80 animate-pulse rounded-3xl bg-white/5"
                />
              ))}
            </div>
          ) : latestContent.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
              <div className="text-5xl">🎬</div>
              <h3 className="mt-5 text-2xl font-black">
                No content yet
              </h3>
              <p className="mt-3 text-gray-400">
                Star TV content will appear here once the admin publishes it.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latestContent.map((item, index) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="group overflow-hidden rounded-3xl border border-white/5 bg-[#17102E] transition duration-300 hover:-translate-y-2"
                >
                  <div
                    className={`relative h-48 bg-gradient-to-br ${
                      gradients[index % gradients.length]
                    }`}
                  >
                    {item.file_url ? (
                      item.media_type === "video" ? (
                        <video
                          src={item.file_url}
                          controls
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={item.file_url}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      )
                    ) : (
                      <div className="flex h-full items-center justify-center text-7xl">
                        {categoryIcons[item.category] || "⭐"}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-pink-400">
                      {item.category}
                    </p>

                    <h3 className="mt-2 line-clamp-2 text-lg font-bold">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      {item.creator}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-2 font-semibold text-purple-400">EXPLORE</p>

          <h2 className="text-3xl font-black md:text-5xl">
            Find Your Vibe ✨
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-gray-400">
            Explore the categories currently available on Star TV.
          </p>

          {categories.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-10">
              <p className="text-gray-400">
                Categories will appear here as the admin adds content or
                challenges.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/explore?category=${encodeURIComponent(category)}`}
                  className="rounded-3xl border border-white/10 bg-white/5 p-7 transition hover:-translate-y-1 hover:bg-white/10"
                >
                  <div className="mb-4 text-5xl">
                    {categoryIcons[category] || "⭐"}
                  </div>

                  <h3 className="font-bold">{category}</h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* LATEST STAR */}
      <section
        id="creators"
        className="bg-[#0D0821] px-6 py-24 md:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[35px] bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 p-1">
            <div className="rounded-[32px] bg-[#120A29] p-8 md:p-14">
              {latestStar ? (
                <div className="grid items-center gap-10 md:grid-cols-2">
                  <div>
                    <p className="mb-3 font-bold text-yellow-300">
                      ⭐ LATEST STAR
                    </p>

                    <h2 className="text-4xl font-black md:text-5xl">
                      {latestStar.profiles?.[0]?.full_name ||
                        latestStar.profiles?.[0]?.username ||
                        "Star Participant"}
                    </h2>

                    <p className="mt-2 font-medium text-pink-300">
                      @{latestStar.profiles?.[0]?.username || "star"}
                    </p>

                    <p className="mt-5 max-w-lg leading-relaxed text-gray-400">
                      {latestStar.description ||
                        "A new Star TV participant has entered the spotlight."}
                    </p>

                    <Link
                      href="/explore"
                      className="mt-7 inline-block rounded-full bg-white px-6 py-3 font-bold text-black transition hover:scale-105"
                    >
                      Explore This Star →
                    </Link>
                  </div>

                  <div className="flex justify-center">
                    {latestStar.profiles?.[0]?.avatar_url ? (
                      <img
                        src={latestStar.profiles[0].avatar_url}
                        alt="Star TV participant"
                        className="h-64 w-64 rounded-full object-cover shadow-2xl md:h-80 md:w-80"
                      />
                    ) : (
                      <div className="flex h-64 w-64 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 via-pink-500 to-purple-600 text-8xl shadow-2xl md:h-80 md:w-80">
                        ⭐
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="text-7xl">⭐</div>
                  <h2 className="mt-6 text-4xl font-black">
                    Your Stars Will Appear Here
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-gray-400">
                    Once approved challenge submissions are available, Star TV
                    will showcase them here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CHALLENGE */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-widest text-pink-400">
            Featured
          </p>

          <h2 className="mt-2 text-3xl font-black md:text-5xl">
            Challenge of the Moment 🔥
          </h2>

          {featuredChallenge ? (
            <div className="mt-7 overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-pink-600 to-orange-500 p-[1px]">
              <div className="rounded-3xl bg-[#100923] p-8 sm:p-12">
                <div className="grid items-center gap-10 md:grid-cols-2">
                  <div>
                    <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-black text-purple-300">
                      {featuredChallenge.status || "ACTIVE"}
                    </span>

                    <p className="mt-6 text-sm font-bold text-pink-300">
                      {featuredChallenge.category}
                    </p>

                    <h3 className="mt-2 text-3xl font-black sm:text-5xl">
                      {featuredChallenge.title}
                    </h3>

                    <p className="mt-5 leading-7 text-gray-400">
                      {featuredChallenge.description ||
                        "Join this Star TV challenge and showcase your talent."}
                    </p>

                    <div className="mt-7">
                      <p className="text-xs text-gray-500">Prize</p>
                      <p className="mt-1 text-xl font-bold text-yellow-400">
                        {formatPrize(featuredChallenge.prize)}
                      </p>
                    </div>

                    <Link
                      href={`/challenge?slug=${encodeURIComponent(
                        featuredChallenge.slug
                      )}`}
                      className="mt-8 inline-block rounded-full bg-white px-7 py-3.5 font-bold text-[#09051A] transition hover:scale-105"
                    >
                      View Challenge →
                    </Link>
                  </div>

                  <div className="flex min-h-[280px] items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20">
                    <div className="text-center">
                      <div className="text-8xl">
                        {categoryIcons[featuredChallenge.category] || "⭐"}
                      </div>

                      <p className="mt-4 text-xl font-black">
                        YOUR STAGE IS WAITING
                      </p>

                      <p className="mt-2 text-sm text-gray-400">
                        Join the challenge and show what you can do.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-7 rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
              <div className="text-6xl">🔥</div>
              <h3 className="mt-5 text-2xl font-black">
                No challenge available yet
              </h3>
              <p className="mt-3 text-gray-400">
                New challenges will appear here when the admin creates them.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 text-5xl">⭐</div>

          <h2 className="text-4xl font-black md:text-6xl">
            Ready to take the spotlight?
          </h2>

          <p className="mt-5 text-lg text-gray-400">
            Your next big moment could start right here.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-block rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 px-8 py-4 text-lg font-bold shadow-xl transition hover:scale-105"
          >
            ✨ Join Star TV
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row">
          <div>
            <div className="text-2xl font-black">
              STAR <span className="text-pink-400">TV</span> ⭐
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Where creativity takes the spotlight.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            © 2026 Star TV. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}