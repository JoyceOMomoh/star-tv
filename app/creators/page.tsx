"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string | null;
};

type Entry = {
  id: string;
  user_id: string;
  challenge_id: string | null;
  status: string;
};

type Challenge = {
  id: string;
  category: string | null;
};

type Creator = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string;
  category: string;
  contentCount: number;
};

const categories = [
  "All",
  "Music",
  "Comedy",
  "Dance",
  "Acting",
  "Art",
  "Gaming",
  "Podcasts",
];

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCreators();
  }, []);

  async function loadCreators() {
    try {
      setLoading(true);
      setError("");

      // Get creator profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, username, avatar_url, bio, role"
        )
        .order("created_at", { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Get approved entries
      const { data: entries, error: entriesError } = await supabase
        .from("entries")
        .select(
          "id, user_id, challenge_id, status"
        )
        .eq("status", "approved");

      if (entriesError) {
        throw entriesError;
      }

      // Get challenges
      const { data: challenges, error: challengesError } = await supabase
        .from("challenges")
        .select("id, category");

      if (challengesError) {
        throw challengesError;
      }

      const profileList = (profiles || []) as Profile[];
      const entryList = (entries || []) as Entry[];
      const challengeList = (challenges || []) as Challenge[];

      // Create a quick challenge lookup
      const challengeMap = new Map<string, Challenge>();

      challengeList.forEach((challenge) => {
        challengeMap.set(challenge.id, challenge);
      });

      // Build creator data from real database information
      const creatorData: Creator[] = profileList
        .filter((profile) => {
          // Only show actual creator accounts
          return profile.role === "creator" || profile.role === null;
        })
        .map((profile) => {
          const creatorEntries = entryList.filter(
            (entry) => entry.user_id === profile.id
          );

          // Find the creator's most common category
          const categoryCounts: Record<string, number> = {};

          creatorEntries.forEach((entry) => {
            if (!entry.challenge_id) return;

            const challenge = challengeMap.get(entry.challenge_id);

            if (!challenge?.category) return;

            const category = challenge.category;

            categoryCounts[category] =
              (categoryCounts[category] || 0) + 1;
          });

          let creatorCategory = "Creator";

          const categoryEntries = Object.entries(categoryCounts);

          if (categoryEntries.length > 0) {
            categoryEntries.sort((a, b) => b[1] - a[1]);
            creatorCategory = categoryEntries[0][0];
          }

          return {
            id: profile.id,
            name: profile.full_name?.trim() || "Star TV Creator",
            username: profile.username
              ? `@${profile.username.replace(/^@/, "")}`
              : "@creator",
            avatarUrl: profile.avatar_url,
            bio:
              profile.bio?.trim() ||
              "A Star TV creator sharing talent and creativity.",
            category: creatorCategory,
            contentCount: creatorEntries.length,
          };
        });

      setCreators(creatorData);
    } catch (err) {
      console.error("Error loading creators:", err);
      setError("We couldn't load creators right now.");
    } finally {
      setLoading(false);
    }
  }

  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      const matchesCategory =
        selectedCategory === "All" ||
        creator.category.toLowerCase() ===
          selectedCategory.toLowerCase();

      const searchTerm = search.toLowerCase().trim();

      const matchesSearch =
        creator.name.toLowerCase().includes(searchTerm) ||
        creator.username.toLowerCase().includes(searchTerm) ||
        creator.category.toLowerCase().includes(searchTerm);

      return matchesCategory && matchesSearch;
    });
  }, [creators, selectedCategory, search]);

  /*
    The featured creator is selected dynamically.

    We do NOT hardcode a person.
    The creator with the most approved content
    becomes the featured creator.
  */
  const featuredCreator = useMemo(() => {
    if (creators.length === 0) return null;

    return [...creators].sort(
      (a, b) => b.contentCount - a.contentCount
    )[0];
  }, [creators]);

  return (
    <main className="min-h-screen bg-[#09051A] text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-pink-600/20 blur-3xl rounded-full" />

        <div className="absolute top-20 right-0 w-96 h-96 bg-purple-600/20 blur-3xl rounded-full" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-yellow-300 font-bold tracking-widest text-sm mb-4">
              ⭐ MEET THE STARS
            </p>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Discover
              <br />

              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Amazing Creators.
              </span>
            </h1>

            <p className="text-gray-400 text-lg mt-6">
              Meet the talented people creating unforgettable
              moments on Star TV.
            </p>
          </div>

          {/* SEARCH */}
          <div className="max-w-2xl mx-auto mt-10">
            <div className="flex items-center bg-white/10 border border-white/10 rounded-2xl px-5 py-4 focus-within:border-pink-500/50 transition">
              <span className="text-xl mr-3">
                🔎
              </span>

              <input
                type="text"
                placeholder="Search creators..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <section className="px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED CREATOR */}
      {!loading && featuredCreator && (
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-[35px] bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-[1px]">
              <div className="bg-[#120A29] rounded-[34px] overflow-hidden">
                <div className="grid md:grid-cols-2">

                  {/* CREATOR IMAGE */}
                  <div className="min-h-[350px] bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 flex items-center justify-center">
                    {featuredCreator.avatarUrl ? (
                      <img
                        src={featuredCreator.avatarUrl}
                        alt={featuredCreator.name}
                        className="w-64 h-64 rounded-full object-cover border-8 border-white/20 shadow-2xl"
                      />
                    ) : (
                      <div className="w-64 h-64 rounded-full bg-white/10 border-8 border-white/10 flex items-center justify-center">
                        <span className="text-8xl">
                          ⭐
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <p className="text-yellow-300 font-bold text-sm">
                      ⭐ FEATURED CREATOR
                    </p>

                    <h2 className="text-4xl md:text-5xl font-black mt-3">
                      {featuredCreator.name}
                    </h2>

                    <p className="text-pink-400 font-medium mt-2">
                      {featuredCreator.username}
                    </p>

                    <p className="text-gray-400 mt-5 leading-relaxed">
                      {featuredCreator.bio}
                    </p>

                    <div className="flex gap-8 mt-7 flex-wrap">
                      <div>
                        <p className="text-xl font-bold">
                          {featuredCreator.contentCount}
                        </p>

                        <p className="text-gray-500 text-sm">
                          Approved Content
                        </p>
                      </div>

                      <div>
                        <p className="text-xl font-bold">
                          {featuredCreator.category}
                        </p>

                        <p className="text-gray-500 text-sm">
                          Category
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/creator?username=${encodeURIComponent(
                        featuredCreator.username.replace("@", "")
                      )}`}
                      className="mt-8 bg-white text-black px-7 py-3 rounded-full font-bold w-fit hover:scale-105 transition"
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CREATOR GRID */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-pink-400 font-bold text-sm">
                THE COMMUNITY
              </p>

              <h2 className="text-3xl md:text-4xl font-black mt-2">
                All Creators
              </h2>
            </div>

            {!loading && (
              <p className="text-gray-500 text-sm">
                {filteredCreators.length}{" "}
                {filteredCreators.length === 1
                  ? "creator"
                  : "creators"}
              </p>
            )}
          </div>

          {/* LOADING */}
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[430px] rounded-[28px] bg-white/5 border border-white/10 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
              <div className="text-5xl">
                ⚠️
              </div>

              <h3 className="text-xl font-bold mt-5">
                Something went wrong
              </h3>

              <p className="text-gray-500 mt-2">
                {error}
              </p>

              <button
                onClick={loadCreators}
                className="mt-6 bg-white text-black px-6 py-3 rounded-full font-bold"
              >
                Try Again
              </button>
            </div>
          )}

          {/* NO CREATORS */}
          {!loading &&
            !error &&
            creators.length === 0 && (
              <div className="text-center py-24 bg-white/5 border border-white/10 rounded-3xl">
                <div className="text-6xl">
                  ⭐
                </div>

                <h3 className="text-2xl font-bold mt-5">
                  No creators yet
                </h3>

                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  Star TV creators will appear here when
                  they join the platform.
                </p>

                <Link
                  href="/register"
                  className="inline-block mt-7 bg-gradient-to-r from-pink-500 to-purple-600 px-7 py-3 rounded-full font-bold"
                >
                  Become a Creator ⭐
                </Link>
              </div>
            )}

          {/* NO SEARCH RESULTS */}
          {!loading &&
            !error &&
            creators.length > 0 &&
            filteredCreators.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-3xl">
                <div className="text-5xl">
                  🔍
                </div>

                <h3 className="text-xl font-bold mt-5">
                  Creator not found
                </h3>

                <p className="text-gray-500 mt-2">
                  Try searching for another creator.
                </p>
              </div>
            )}

          {/* CREATOR CARDS */}
          {!loading &&
            !error &&
            filteredCreators.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCreators.map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                  />
                ))}
              </div>
            )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-5xl mx-auto text-center bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 border border-white/10 rounded-[35px] p-12">
          <div className="text-5xl mb-5">
            ✨
          </div>

          <h2 className="text-3xl md:text-5xl font-black">
            You could be the next Star.
          </h2>

          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Create your profile, share your talent and let
            the world discover what makes you special.
          </p>

          <Link
            href="/register"
            className="inline-block mt-7 bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 rounded-full font-bold hover:scale-105 transition"
          >
            Become a Creator ⭐
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 md:px-12 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="text-2xl font-black">
              STAR
              <span className="text-pink-400">
                {" "}TV
              </span>
              <span className="text-yellow-300">
                {" "}★
              </span>
            </div>

            <p className="text-gray-500 text-sm mt-2">
              Where creativity takes the spotlight.
            </p>
          </div>

          <p className="text-gray-600 text-sm">
            © 2026 Star TV
          </p>
        </div>
      </footer>
    </main>
  );
}


/* =========================
   CREATOR CARD
========================= */

function CreatorCard({
  creator,
}: {
  creator: Creator;
}) {
  return (
    <div className="group bg-[#120A29] border border-white/10 rounded-[28px] overflow-hidden hover:-translate-y-2 hover:border-pink-500/30 transition duration-300">

      {/* AVATAR */}
      <div className="relative h-56 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 flex items-center justify-center">

        {creator.avatarUrl ? (
          <img
            src={creator.avatarUrl}
            alt={creator.name}
            className="w-36 h-36 rounded-full object-cover border-4 border-white/20 group-hover:scale-110 transition duration-300"
          />
        ) : (
          <div className="w-36 h-36 rounded-full bg-white/10 border-4 border-white/10 flex items-center justify-center group-hover:scale-110 transition duration-300">
            <span className="text-6xl">
              ⭐
            </span>
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div className="p-6">

        <h3 className="text-lg font-bold">
          {creator.name}
        </h3>

        <p className="text-gray-500 text-sm mt-1">
          {creator.username}
        </p>

        <p className="text-gray-400 text-sm mt-4 line-clamp-2 min-h-[40px]">
          {creator.bio}
        </p>

        <div className="flex items-center justify-between mt-5">

          <div>
            <p className="font-bold">
              {creator.contentCount}
            </p>

            <p className="text-gray-600 text-xs">
              Content
            </p>
          </div>

          <span className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-gray-400">
            {creator.category}
          </span>

        </div>

        <Link
          href={`/creator?username=${encodeURIComponent(
            creator.username.replace("@", "")
          )}`}
          className="block w-full mt-6 text-center border border-white/10 py-3 rounded-full font-semibold hover:bg-white hover:text-black transition"
        >
          View Profile
        </Link>

      </div>
    </div>
  );
}