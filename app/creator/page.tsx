"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
const creatorContent = [
  {
    title: "The Voice That Stopped Everyone",
    category: "Music",
    views: "24.8K",
    likes: "3.2K",
    emoji: "🎤",
    gradient: "from-pink-500 to-orange-400",
  },
  {
    title: "Late Night Acoustic Session",
    category: "Music",
    views: "18.6K",
    likes: "2.4K",
    emoji: "🎸",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "A Song For Everyone",
    category: "Music",
    views: "31.2K",
    likes: "4.7K",
    emoji: "🎶",
    gradient: "from-blue-500 to-purple-600",
  },
  {
    title: "Behind The Music",
    category: "Lifestyle",
    views: "12.5K",
    likes: "1.8K",
    emoji: "🎧",
    gradient: "from-yellow-400 to-pink-500",
  },
  {
    title: "Studio Vibes",
    category: "Music",
    views: "16.9K",
    likes: "2.1K",
    emoji: "🎙️",
    gradient: "from-orange-400 to-red-500",
  },
  {
    title: "My Creative Journey",
    category: "Story",
    views: "9.8K",
    likes: "1.2K",
    emoji: "⭐",
    gradient: "from-indigo-500 to-purple-600",
  },
];

export default function CreatorProfile() {
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("Content");

  return (
    <main className="min-h-screen bg-[#09051A] text-white">
      <Navbar />
      {/* COVER */}
      <section className="relative">
        <div className="h-64 md:h-80 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 relative overflow-hidden">
          <div className="absolute w-80 h-80 rounded-full bg-white/10 blur-3xl -top-32 -left-20" />

          <div className="absolute w-96 h-96 rounded-full bg-pink-300/10 blur-3xl -bottom-48 right-0" />

          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <span className="text-[180px] md:text-[250px]">
              ⭐
            </span>
          </div>
        </div>

        {/* PROFILE INFO */}
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="relative -mt-24 md:-mt-28">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              {/* AVATAR */}
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-[35px] bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 p-1 shadow-2xl">
                <div className="w-full h-full rounded-[32px] bg-[#120A29] flex items-center justify-center text-8xl">
                  👩🏽‍🎤
                </div>
              </div>

              {/* NAME */}
              <div className="pb-2 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl md:text-5xl font-black">
                    Amaka Williams
                  </h1>

                  <span className="bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    ✓
                  </span>
                </div>

                <p className="text-gray-400 mt-2">
                  @amakawilliams
                </p>

                <p className="text-pink-400 font-semibold mt-2">
                  🎤 Singer • Songwriter • Creator
                </p>
              </div>

              {/* FOLLOW */}
              <div className="pb-2 flex gap-3">
                <button
                  onClick={() => setFollowing(!following)}
                  className={`px-7 py-3 rounded-full font-bold transition ${
                    following
                      ? "bg-white/10 border border-white/20"
                      : "bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105"
                  }`}
                >
                  {following ? "✓ Following" : "+ Follow"}
                </button>

                <button className="w-12 h-12 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition">
                  ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CREATOR DETAILS */}
      <section className="px-6 md:px-12 mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* BIO */}
            <div className="lg:col-span-2">
              <p className="text-gray-400 leading-relaxed max-w-2xl">
                I create music, stories and moments that connect with people.
                Welcome to my Star TV space where you can discover my latest
                performances, creative projects and behind-the-scenes moments.
                ⭐
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <span className="bg-pink-500/10 text-pink-400 border border-pink-500/20 px-4 py-2 rounded-full text-sm">
                  🎤 Music
                </span>

                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-4 py-2 rounded-full text-sm">
                  ✨ Lifestyle
                </span>

                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-full text-sm">
                  🎬 Entertainment
                </span>
              </div>
            </div>

            {/* STATS */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <div className="grid grid-cols-3 text-center">
                <div>
                  <p className="text-2xl font-black">
                    24.8K
                  </p>

                  <p className="text-gray-500 text-xs mt-1">
                    Followers
                  </p>
                </div>

                <div className="border-x border-white/10">
                  <p className="text-2xl font-black">
                    48
                  </p>

                  <p className="text-gray-500 text-xs mt-1">
                    Contents
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-black">
                    4.9
                  </p>

                  <p className="text-gray-500 text-xs mt-1">
                    Rating
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <section className="px-6 md:px-12 mt-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-8">
            {["Content", "About"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-semibold transition border-b-2 ${
                  activeTab === tab
                    ? "text-white border-pink-500"
                    : "text-gray-500 border-transparent hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="px-6 md:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          {activeTab === "Content" ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-pink-400 font-bold text-sm">
                    AMAKA'S CREATIONS
                  </p>

                  <h2 className="text-3xl font-black mt-2">
                    Latest Content
                  </h2>
                </div>

                <span className="text-gray-500 text-sm">
                  48 posts
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {creatorContent.map((content, index) => (
                  <ContentCard
                    key={index}
                    content={content}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="max-w-3xl">
              <h2 className="text-3xl font-black">
                About Amaka
              </h2>

              <p className="text-gray-400 leading-relaxed mt-5">
                Amaka is a passionate creator using music and storytelling to
                connect with audiences. Her Star TV profile is a space for
                performances, creative projects and personal moments.
              </p>

              <div className="mt-8 space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-gray-500 text-sm">
                    Category
                  </p>

                  <p className="font-semibold mt-1">
                    Music & Entertainment
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-gray-500 text-sm">
                    Joined Star TV
                  </p>

                  <p className="font-semibold mt-1">
                    August 2026
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 md:px-12 py-10 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="text-2xl font-black">
              STAR
              <span className="text-pink-400"> TV</span>
              <span className="text-yellow-300"> ★</span>
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

/* CONTENT CARD */

function ContentCard({
  content,
}: {
  content: {
    title: string;
    category: string;
    views: string;
    likes: string;
    emoji: string;
    gradient: string;
  };
}) {
  return (
    <div className="group bg-[#120A29] border border-white/10 rounded-3xl overflow-hidden hover:-translate-y-2 hover:border-pink-500/30 transition duration-300">
      <div
        className={`relative h-60 bg-gradient-to-br ${content.gradient} flex items-center justify-center`}
      >
        <span className="text-8xl group-hover:scale-110 transition duration-300">
          {content.emoji}
        </span>

        <div className="absolute top-4 left-4">
          <span className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold">
            {content.category}
          </span>
        </div>

        <button className="absolute w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-110 transition">
          ▶
        </button>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg">
          {content.title}
        </h3>

        <div className="flex justify-between mt-4 text-sm text-gray-500">
          <span>♡ {content.likes}</span>
          <span>▶ {content.views}</span>
        </div>

        <div className="flex gap-4 mt-5">
          <button className="text-sm text-gray-500 hover:text-pink-400 transition">
            ♡ Like
          </button>

          <button className="text-sm text-gray-500 hover:text-purple-400 transition">
            ↗ Share
          </button>
        </div>
      </div>
    </div>
  );
}