"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Challenge = {
  id: string;
  title: string;
  slug: string;
  category: string;
};

export default function SubmitPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [acceptedRules, setAcceptedRules] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    setUser(user);

    const { data, error: challengeError } = await supabase
      .from("challenges")
      .select("id, title, slug, category")
      .eq("slug", "star-tv-dance-challenge")
      .single();

    if (challengeError) {
      setError("Unable to load the challenge.");
      setLoading(false);
      return;
    }

    setChallenge(data);
    setLoading(false);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith("video/")) {
      setError("Please select a video file.");
      setSelectedFile(null);
      return;
    }

    const maxSize = 100 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Your video must be less than 100MB.");
      setSelectedFile(null);
      return;
    }

    setError("");
    setSelectedFile(file);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!user) {
      setError("Please log in before submitting.");
      return;
    }

    if (!challenge) {
      setError("Challenge information is unavailable.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title for your entry.");
      return;
    }

    if (!selectedFile) {
      setError("Please upload your video.");
      return;
    }

    if (!acceptedRules) {
      setError("Please accept the challenge rules.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const safeFileName = selectedFile.name
        .replace(/[^a-zA-Z0-9.-]/g, "-")
        .toLowerCase();

      const filePath = `entries/${user.id}/${crypto.randomUUID()}-${safeFileName}`;

      // Upload video
      const { error: uploadError } = await supabase.storage
        .from("star-tv-media")
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get public video URL
      const { data: publicUrlData } = supabase.storage
        .from("star-tv-media")
        .getPublicUrl(filePath);

      const videoUrl = publicUrlData.publicUrl;

      // Save submission
      const { error: entryError } = await supabase
        .from("entries")
        .insert({
          challenge_id: challenge.id,
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          video_url: videoUrl,
          status: "pending",
        });

      if (entryError) {
        // Remove uploaded video if database insert fails
        await supabase.storage
          .from("star-tv-media")
          .remove([filePath]);

        throw new Error(entryError.message);
      }

      setSuccess(true);
      setTitle("");
      setDescription("");
      setSelectedFile(null);
      setAcceptedRules(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070B24] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⭐</div>
          <p className="text-white/60">Loading challenge...</p>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#070B24] text-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center text-4xl mb-6">
            ✓
          </div>

          <h1 className="text-3xl font-black mb-4">
            Entry Submitted! 🎉
          </h1>

          <p className="text-white/60 leading-7 mb-8">
            Your video has been submitted successfully. It is now waiting
            for Star TV admin approval.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setSuccess(false)}
              className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-3 font-bold"
            >
              Submit Another
            </button>

            <button
              onClick={() => router.push("/leaderboard")}
              className="flex-1 rounded-xl border border-white/10 px-5 py-3 font-bold"
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070B24] text-white">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-pink-500/20 blur-3xl rounded-full" />
        <div className="absolute top-10 right-0 w-80 h-80 bg-purple-500/20 blur-3xl rounded-full" />

        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-pink-400 font-bold mb-4">
            Star TV Challenge
          </p>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Submit Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
              {" "}
              Star Moment
            </span>
            ⭐
          </h1>

          <p className="mt-5 text-white/60 max-w-2xl text-lg leading-8">
            Show us what you've got. Upload your performance and let the Star
            TV community discover your talent.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8"
        >
          {/* Challenge */}
          <div className="rounded-2xl bg-purple-500/10 border border-purple-400/20 p-5 mb-7">
            <p className="text-xs uppercase tracking-widest text-purple-300 font-bold mb-2">
              Current Challenge
            </p>

            <h2 className="text-xl font-bold">
              {challenge?.title || "Star TV Dance Challenge"}
            </h2>

            <p className="text-white/50 text-sm mt-1">
              {challenge?.category || "Dance"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">
              Entry Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Dance Challenge Entry"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-purple-400"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us a little about your performance..."
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-purple-400 resize-none"
            />
          </div>

          {/* Upload */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">
              Upload Your Video
            </label>

            <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-400/50 bg-black/20 p-10 text-center transition">
              <div className="text-4xl mb-3">🎥</div>

              <p className="font-bold mb-1">
                {selectedFile
                  ? selectedFile.name
                  : "Click to choose your video"}
              </p>

              <p className="text-xs text-white/40">
                MP4, MOV or other video format · Maximum 100MB
              </p>

              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Rules */}
          <label className="flex items-start gap-3 cursor-pointer mb-7">
            <input
              type="checkbox"
              checked={acceptedRules}
              onChange={(e) => setAcceptedRules(e.target.checked)}
              className="mt-1"
            />

            <span className="text-sm text-white/60 leading-6">
              I confirm that this is my own submission and I agree to the
              rules of the Star TV challenge.
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 px-6 py-4 font-black text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit My Entry 🚀"}
          </button>
        </form>
      </section>
    </main>
  );
}