"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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

type Media = {
  id: string;
  title: string;
  description: string | null;
  media_type: "video" | "photo";
  category: string;
  year: number | null;
  file_url: string;
  storage_path: string;
  featured: boolean;
  published: boolean;
  created_at: string;
};

type Section =
  | "dashboard"
  | "challenges"
  | "videos"
  | "submissions"
  | "users"
  | "settings";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] =
    useState<Section>("dashboard");

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [media, setMedia] = useState<Media[]>([]);

  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const [savingChallenge, setSavingChallenge] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Challenge form
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeCategory, setChallengeCategory] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengePrize, setChallengePrize] = useState("");
  const [challengeDeadline, setChallengeDeadline] = useState("");
  const [challengeStatus, setChallengeStatus] = useState<
    "draft" | "active" | "closed"
  >("draft");

  // Video form
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoCategory, setVideoCategory] = useState("");
  const [videoYear, setVideoYear] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFeatured, setVideoFeatured] = useState(false);
  const [videoPublished, setVideoPublished] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  // =========================
  // ADMIN CHECK
  // =========================

  async function checkAdmin() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Auth error:", userError);
        setError("Unable to check your login session.");
        setLoading(false);
        return;
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      const profileRequest = supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Supabase request timed out.")),
          10000
        )
      );

      const result = await Promise.race([
        profileRequest,
        timeout,
      ]);

      const profile = result.data;
      const profileError = result.error;

      if (profileError) {
        console.error("Profile error:", profileError);

        setError(
          "Could not load your admin profile. Make sure your profile role is set to admin."
        );

        setLoading(false);
        return;
      }

      if (profile?.role !== "admin") {
        router.replace("/");
        return;
      }

      // Stop the loading screen now.
      setLoading(false);

      // Load dashboard information separately.
      loadChallenges();
      loadMedia();
    } catch (err) {
      console.error("Admin check error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong loading the admin dashboard."
      );

      setLoading(false);
    }
  }

  // =========================
  // LOAD CHALLENGES
  // =========================

  async function loadChallenges() {
    try {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Challenge loading error:", error);
        return;
      }

      setChallenges(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  // =========================
  // LOAD VIDEOS
  // =========================

  async function loadMedia() {
    try {
      const { data, error } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Media loading error:", error);
        return;
      }

      setMedia(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  // =========================
  // CREATE SLUG
  // =========================

  function createSlug(title: string) {
    return (
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Date.now()
    );
  }

  // =========================
  // CREATE CHALLENGE
  // =========================

  async function handleCreateChallenge(e: FormEvent) {
    e.preventDefault();

    if (!challengeTitle.trim()) {
      setError("Please enter a challenge title.");
      return;
    }

    if (!challengeCategory.trim()) {
      setError("Please enter a challenge category.");
      return;
    }

    setSavingChallenge(true);
    setError("");
    setMessage("");

    try {
      const slug = createSlug(challengeTitle);

      const { error: insertError } = await supabase
        .from("challenges")
        .insert({
          title: challengeTitle.trim(),
          slug,
          category: challengeCategory.trim(),
          description:
            challengeDescription.trim() || null,
          prize: challengePrize.trim() || null,
          deadline: challengeDeadline || null,
          status: challengeStatus,
        });

      if (insertError) {
        console.error(insertError);
        setError(insertError.message);
        setSavingChallenge(false);
        return;
      }

      setMessage("Challenge created successfully.");

      resetChallengeForm();
      setShowChallengeModal(false);

      await loadChallenges();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create challenge."
      );
    }

    setSavingChallenge(false);
  }

  function resetChallengeForm() {
    setChallengeTitle("");
    setChallengeCategory("");
    setChallengeDescription("");
    setChallengePrize("");
    setChallengeDeadline("");
    setChallengeStatus("draft");
  }

  // =========================
  // DELETE CHALLENGE
  // =========================

  async function deleteChallenge(id: string) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this challenge?"
  );

  if (!confirmed) return;

  setError("");
  setMessage("");

  const { data, error } = await supabase
    .from("challenges")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("Delete challenge error:", error);
    setError(error.message);
    return;
  }

  if (!data || data.length === 0) {
    setError(
      "The challenge was not deleted. Your admin account may not have permission to delete challenges."
    );
    return;
  }

  // Remove it immediately from the screen
  setChallenges((current) =>
    current.filter((challenge) => challenge.id !== id)
  );

  setMessage("Challenge deleted successfully.");
}

  // =========================
  // SELECT VIDEO
  // =========================

  function handleVideoFile(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a video file.");
      return;
    }

    const maxSize = 100 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Video must be smaller than 100MB.");
      return;
    }

    setError("");
    setVideoFile(file);
  }

  // =========================
  // UPLOAD VIDEO
  // =========================

  async function handleUploadVideo(e: FormEvent) {
    e.preventDefault();

    if (!videoTitle.trim()) {
      setError("Please enter a video title.");
      return;
    }

    if (!videoFile) {
      setError("Please select a video.");
      return;
    }

    setUploadingVideo(true);
    setError("");
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You are not logged in.");
        setUploadingVideo(false);
        return;
      }

      const safeFileName = videoFile.name
        .replace(/[^a-zA-Z0-9.-]/g, "-")
        .toLowerCase();

      const filePath = `archive/${user.id}/${crypto.randomUUID()}-${safeFileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("star-tv-media")
          .upload(filePath, videoFile);

      if (uploadError) {
        setError(uploadError.message);
        setUploadingVideo(false);
        return;
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("star-tv-media")
          .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase
        .from("media")
        .insert({
          title: videoTitle.trim(),
          description:
            videoDescription.trim() || null,
          media_type: "video",
          category:
            videoCategory.trim() || "Entertainment",
          year: videoYear
            ? Number(videoYear)
            : null,
          file_url: fileUrl,
          storage_path: filePath,
          featured: videoFeatured,
          published: videoPublished,
          created_by: user.id,
        });

      if (insertError) {
        await supabase.storage
          .from("star-tv-media")
          .remove([filePath]);

        setError(insertError.message);
        setUploadingVideo(false);
        return;
      }

      setMessage("Video uploaded successfully.");

      resetVideoForm();
      setShowVideoModal(false);

      await loadMedia();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while uploading."
      );
    }

    setUploadingVideo(false);
  }

  function resetVideoForm() {
    setVideoTitle("");
    setVideoDescription("");
    setVideoCategory("");
    setVideoYear("");
    setVideoFile(null);
    setVideoFeatured(false);
    setVideoPublished(true);
  }

  // =========================
  // DELETE VIDEO
  // =========================

  async function deleteVideo(video: Media) {
    const confirmed = window.confirm(
      `Delete "${video.title}" permanently?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    if (video.storage_path) {
      await supabase.storage
        .from("star-tv-media")
        .remove([video.storage_path]);
    }

    const { error } = await supabase
      .from("media")
      .delete()
      .eq("id", video.id);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Video deleted.");

    await loadMedia();
  }

  // =========================
  // PUBLISH / HIDE VIDEO
  // =========================

  async function togglePublished(video: Media) {
    const { error } = await supabase
      .from("media")
      .update({
        published: !video.published,
      })
      .eq("id", video.id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadMedia();
  }

  // =========================
  // FEATURE VIDEO
  // =========================

  async function toggleFeatured(video: Media) {
    const { error } = await supabase
      .from("media")
      .update({
        featured: !video.featured,
      })
      .eq("id", video.id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadMedia();
  }

  const activeChallenges = challenges.filter(
    (challenge) => challenge.status === "active"
  );

  const publishedVideos = media.filter(
    (video) => video.published
  );

  const navItems: {
    id: Section;
    label: string;
    icon: string;
  }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "▦",
    },
    {
      id: "challenges",
      label: "Challenges",
      icon: "🏆",
    },
    {
      id: "videos",
      label: "Videos",
      icon: "▶",
    },
    {
      id: "submissions",
      label: "Submissions",
      icon: "◉",
    },
    {
      id: "users",
      label: "Users",
      icon: "♙",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙",
    },
  ];

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-[#635BFF] rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-500">
            Checking admin access...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#172033]">

      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden lg:flex w-[250px] bg-[#111936] text-white flex-col fixed left-0 top-0 bottom-0 z-40">

          <div className="px-7 py-7 border-b border-white/10">
            <div className="text-2xl font-black">
              STAR<span className="text-[#FF4FA3]">TV</span>
            </div>

            <p className="text-xs text-white/40 mt-1">
              Administration Panel
            </p>
          </div>

          <nav className="p-4 space-y-1 flex-1">

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMessage("");
                  setError("");
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  activeSection === item.id
                    ? "bg-[#635BFF] text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="w-6 text-center">
                  {item.icon}
                </span>

                {item.label}
              </button>
            ))}

          </nav>

          <div className="p-5 border-t border-white/10">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace("/login");
              }}
              className="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-white/70"
            >
              Sign out
            </button>
          </div>

        </aside>

        {/* MOBILE NAV */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#111936] text-white px-4 py-4">

          <div className="flex items-center justify-between mb-4">

            <div className="font-black text-xl">
              STAR<span className="text-[#FF4FA3]">TV</span>
            </div>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace("/login");
              }}
              className="text-xs bg-white/10 px-3 py-2 rounded-lg"
            >
              Sign out
            </button>

          </div>

          <div className="flex gap-2 overflow-x-auto">

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  setActiveSection(item.id)
                }
                className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs ${
                  activeSection === item.id
                    ? "bg-[#635BFF]"
                    : "bg-white/5"
                }`}
              >
                {item.label}
              </button>
            ))}

          </div>

        </div>

        {/* MAIN */}
        <main className="flex-1 lg:ml-[250px] pt-[130px] lg:pt-0">

          <div className="max-w-[1500px] mx-auto px-5 md:px-8 py-8">

            {/* TOP BAR */}
            <div className="hidden lg:flex items-center justify-between mb-8">

              <div>
                <h1 className="text-2xl font-bold">
                  {
                    navItems.find(
                      (item) =>
                        item.id === activeSection
                    )?.label
                  }
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Manage your Star TV platform.
                </p>
              </div>

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#635BFF] to-[#FF4FA3] flex items-center justify-center text-white font-bold">
                  A
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Administrator
                  </p>

                  <p className="text-xs text-gray-400">
                    Admin
                  </p>
                </div>

              </div>

            </div>

            {/* MESSAGE */}
            {message && (
              <div className="mb-5 rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
                {message}
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* ================= DASHBOARD ================= */}
            {activeSection === "dashboard" && (
              <section>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                  <StatCard
                    title="Total Challenges"
                    value={challenges.length}
                    icon="🏆"
                  />

                  <StatCard
                    title="Active Challenges"
                    value={activeChallenges.length}
                    icon="🔥"
                  />

                  <StatCard
                    title="Total Videos"
                    value={media.length}
                    icon="▶"
                  />

                  <StatCard
                    title="Published Videos"
                    value={publishedVideos.length}
                    icon="🌐"
                  />

                </div>

                <div className="grid xl:grid-cols-2 gap-6 mt-7">

                  {/* RECENT CHALLENGES */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">

                    <div className="flex items-center justify-between mb-5">

                      <div>
                        <h2 className="font-bold text-lg">
                          Recent Challenges
                        </h2>

                        <p className="text-sm text-gray-400">
                          Your latest challenges
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setActiveSection(
                            "challenges"
                          )
                        }
                        className="text-sm text-[#635BFF] font-semibold"
                      >
                        View all
                      </button>

                    </div>

                    {challenges.length === 0 ? (
                      <EmptyState
                        icon="🏆"
                        title="No challenges yet"
                        text="Create your first Star TV challenge."
                      />
                    ) : (
                      <div className="space-y-3">

                        {challenges
                          .slice(0, 5)
                          .map((challenge) => (
                            <div
                              key={challenge.id}
                              className="flex items-center justify-between border border-gray-100 rounded-xl p-4"
                            >
                              <div>
                                <p className="font-semibold text-sm">
                                  {challenge.title}
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                  {challenge.category}
                                </p>
                              </div>

                              <StatusBadge
                                status={
                                  challenge.status
                                }
                              />
                            </div>
                          ))}

                      </div>
                    )}

                  </div>

                  {/* RECENT VIDEOS */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">

                    <div className="flex items-center justify-between mb-5">

                      <div>
                        <h2 className="font-bold text-lg">
                          Recent Videos
                        </h2>

                        <p className="text-sm text-gray-400">
                          Star TV library
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setActiveSection("videos")
                        }
                        className="text-sm text-[#635BFF] font-semibold"
                      >
                        View all
                      </button>

                    </div>

                    {media.length === 0 ? (
                      <EmptyState
                        icon="▶"
                        title="No videos yet"
                        text="Upload your first Star TV video."
                      />
                    ) : (
                      <div className="space-y-3">

                        {media
                          .slice(0, 5)
                          .map((video) => (
                            <div
                              key={video.id}
                              className="flex items-center gap-4 border border-gray-100 rounded-xl p-3"
                            >

                              <video
                                src={video.file_url}
                                className="w-20 h-12 rounded-lg object-cover bg-black"
                                muted
                              />

                              <div className="flex-1 min-w-0">

                                <p className="font-semibold text-sm truncate">
                                  {video.title}
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                  {video.category}
                                </p>

                              </div>

                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  video.published
                                    ? "bg-green-50 text-green-600"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {video.published
                                  ? "Published"
                                  : "Hidden"}
                              </span>

                            </div>
                          ))}

                      </div>
                    )}

                  </div>

                </div>

              </section>
            )}

            {/* ================= CHALLENGES ================= */}
            {activeSection === "challenges" && (
              <section>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

                  <div>
                    <h2 className="text-xl font-bold">
                      Challenge Management
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Create and manage Star TV challenges.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setShowChallengeModal(true)
                    }
                    className="bg-[#635BFF] hover:bg-[#554DE8] text-white px-5 py-3 rounded-xl font-semibold text-sm"
                  >
                    + Create Challenge
                  </button>

                </div>

                {challenges.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100">

                    <EmptyState
                      icon="🏆"
                      title="No challenges created"
                      text="Create a challenge and it can appear on the public Star TV website."
                      action={
                        <button
                          onClick={() =>
                            setShowChallengeModal(
                              true
                            )
                          }
                          className="bg-[#635BFF] text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
                        >
                          Create Challenge
                        </button>
                      }
                    />

                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

                    <div className="overflow-x-auto">

                      <table className="w-full min-w-[800px]">

                        <thead className="bg-gray-50 border-b border-gray-100">

                          <tr>

                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wide text-gray-400">
                              Challenge
                            </th>

                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wide text-gray-400">
                              Category
                            </th>

                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wide text-gray-400">
                              Prize
                            </th>

                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wide text-gray-400">
                              Deadline
                            </th>

                            <th className="text-left px-6 py-4 text-xs uppercase tracking-wide text-gray-400">
                              Status
                            </th>

                            <th className="px-6 py-4" />

                          </tr>

                        </thead>

                        <tbody>

                          {challenges.map(
                            (challenge) => (
                              <tr
                                key={challenge.id}
                                className="border-b border-gray-100 last:border-0"
                              >

                                <td className="px-6 py-5">

                                  <p className="font-semibold text-sm">
                                    {challenge.title}
                                  </p>

                                  <p className="text-xs text-gray-400 mt-1">
                                    /challenge/
                                    {challenge.slug}
                                  </p>

                                </td>

                                <td className="px-6 py-5 text-sm">
                                  {challenge.category}
                                </td>

                                <td className="px-6 py-5 text-sm">
                                  {challenge.prize ||
                                    "—"}
                                </td>

                                <td className="px-6 py-5 text-sm">
                                  {challenge.deadline
                                    ? new Date(
                                        challenge.deadline
                                      ).toLocaleDateString()
                                    : "—"}
                                </td>

                                <td className="px-6 py-5">

                                  <StatusBadge
                                    status={
                                      challenge.status
                                    }
                                  />

                                </td>

                                <td className="px-6 py-5 text-right">

                                  <button
                                    onClick={() =>
                                      deleteChallenge(
                                        challenge.id
                                      )
                                    }
                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                  >
                                    Delete
                                  </button>

                                </td>

                              </tr>
                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                  </div>
                )}

              </section>
            )}

            {/* ================= VIDEOS ================= */}
            {activeSection === "videos" && (
              <section>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

                  <div>
                    <h2 className="text-xl font-bold">
                      Video Library
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Upload and manage Star TV videos.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setShowVideoModal(true)
                    }
                    className="bg-[#635BFF] hover:bg-[#554DE8] text-white px-5 py-3 rounded-xl font-semibold text-sm"
                  >
                    + Upload Video
                  </button>

                </div>

                {media.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100">

                    <EmptyState
                      icon="▶"
                      title="Your video library is empty"
                      text="Upload your first Star TV video."
                      action={
                        <button
                          onClick={() =>
                            setShowVideoModal(true)
                          }
                          className="bg-[#635BFF] text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
                        >
                          Upload Video
                        </button>
                      }
                    />

                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

                    {media.map((video) => (
                      <div
                        key={video.id}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                      >

                        <div className="relative bg-black aspect-video">

                          <video
                            src={video.file_url}
                            controls
                            className="w-full h-full object-cover"
                          />

                          {video.featured && (
                            <span className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-2.5 py-1 rounded-full">
                              Featured
                            </span>
                          )}

                        </div>

                        <div className="p-5">

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">

                              <h3 className="font-bold truncate">
                                {video.title}
                              </h3>

                              <p className="text-xs text-gray-400 mt-1">
                                {video.category}

                                {video.year
                                  ? ` • ${video.year}`
                                  : ""}
                              </p>

                            </div>

                            <span
                              className={`shrink-0 text-xs px-2 py-1 rounded-full ${
                                video.published
                                  ? "bg-green-50 text-green-600"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {video.published
                                ? "Live"
                                : "Hidden"}
                            </span>

                          </div>

                          {video.description && (
                            <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                              {video.description}
                            </p>
                          )}

                          <div className="grid grid-cols-3 gap-2 mt-5">

                            <button
                              onClick={() =>
                                togglePublished(
                                  video
                                )
                              }
                              className="border border-gray-200 rounded-lg py-2 text-xs font-medium hover:bg-gray-50"
                            >
                              {video.published
                                ? "Hide"
                                : "Publish"}
                            </button>

                            <button
                              onClick={() =>
                                toggleFeatured(
                                  video
                                )
                              }
                              className="border border-gray-200 rounded-lg py-2 text-xs font-medium hover:bg-gray-50"
                            >
                              {video.featured
                                ? "Unfeature"
                                : "Feature"}
                            </button>

                            <button
                              onClick={() =>
                                deleteVideo(video)
                              }
                              className="border border-red-100 text-red-500 rounded-lg py-2 text-xs font-medium hover:bg-red-50"
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </section>
            )}

            {/* ================= SUBMISSIONS ================= */}
            {activeSection === "submissions" && (
              <section>

                <div className="bg-white rounded-2xl border border-gray-100">

                  <EmptyState
                    icon="◉"
                    title="Submissions management"
                    text="Participant submissions will be managed here."
                  />

                </div>

              </section>
            )}

            {/* ================= USERS ================= */}
            {activeSection === "users" && (
              <section>

                <div className="bg-white rounded-2xl border border-gray-100">

                  <EmptyState
                    icon="♙"
                    title="User management"
                    text="User management will be added here."
                  />

                </div>

              </section>
            )}

            {/* ================= SETTINGS ================= */}
            {activeSection === "settings" && (
              <section>

                <div className="bg-white rounded-2xl border border-gray-100">

                  <EmptyState
                    icon="⚙"
                    title="Settings"
                    text="Platform settings will be added here."
                  />

                </div>

              </section>
            )}

          </div>

        </main>

      </div>

      {/* ================= CREATE CHALLENGE MODAL ================= */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-5 border-b">

              <div>
                <h2 className="text-xl font-bold">
                  Create Challenge
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Create a new Star TV challenge.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowChallengeModal(false);
                  resetChallengeForm();
                }}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleCreateChallenge}
              className="p-6 space-y-5"
            >

              <Input
                label="Challenge Title"
                value={challengeTitle}
                onChange={setChallengeTitle}
                placeholder="Enter challenge title"
              />

              <Input
                label="Category"
                value={challengeCategory}
                onChange={setChallengeCategory}
                placeholder="Dance, Music, Comedy..."
              />

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Description
                </label>

                <textarea
                  value={challengeDescription}
                  onChange={(e) =>
                    setChallengeDescription(
                      e.target.value
                    )
                  }
                  placeholder="Describe the challenge..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#635BFF]"
                />

              </div>

              <Input
                label="Prize"
                value={challengePrize}
                onChange={setChallengePrize}
                placeholder="e.g. ₦100,000"
              />

              <div className="grid sm:grid-cols-2 gap-4">

                <div>

                  <label className="block text-sm font-semibold mb-2">
                    Deadline
                  </label>

                  <input
                    type="date"
                    value={challengeDeadline}
                    onChange={(e) =>
                      setChallengeDeadline(
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#635BFF]"
                  />

                </div>

                <div>

                  <label className="block text-sm font-semibold mb-2">
                    Status
                  </label>

                  <select
                    value={challengeStatus}
                    onChange={(e) =>
                      setChallengeStatus(
                        e.target.value as
                          | "draft"
                          | "active"
                          | "closed"
                      )
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#635BFF]"
                  >
                    <option value="draft">
                      Draft
                    </option>

                    <option value="active">
                      Active
                    </option>

                    <option value="closed">
                      Closed
                    </option>
                  </select>

                </div>

              </div>

              <button
                type="submit"
                disabled={savingChallenge}
                className="w-full bg-[#635BFF] hover:bg-[#554DE8] disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold"
              >
                {savingChallenge
                  ? "Creating..."
                  : "Create Challenge"}
              </button>

            </form>

          </div>

        </div>
      )}

      {/* ================= UPLOAD VIDEO MODAL ================= */}
      {showVideoModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-5 border-b">

              <div>
                <h2 className="text-xl font-bold">
                  Upload Video
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Add a video to the Star TV library.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowVideoModal(false);
                  resetVideoForm();
                }}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleUploadVideo}
              className="p-6 space-y-5"
            >

              <Input
                label="Video Title"
                value={videoTitle}
                onChange={setVideoTitle}
                placeholder="Enter video title"
              />

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Description
                </label>

                <textarea
                  value={videoDescription}
                  onChange={(e) =>
                    setVideoDescription(
                      e.target.value
                    )
                  }
                  placeholder="Tell viewers about this video..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#635BFF]"
                />

              </div>

              <div className="grid sm:grid-cols-2 gap-4">

                <Input
                  label="Category"
                  value={videoCategory}
                  onChange={setVideoCategory}
                  placeholder="Entertainment"
                />

                <div>

                  <label className="block text-sm font-semibold mb-2">
                    Year
                  </label>

                  <input
                    type="number"
                    value={videoYear}
                    onChange={(e) =>
                      setVideoYear(e.target.value)
                    }
                    placeholder="2026"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#635BFF]"
                  />

                </div>

              </div>

              <div>

                <label className="block text-sm font-semibold mb-2">
                  Video File
                </label>

                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFile}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
                />

                <p className="text-xs text-gray-400 mt-2">
                  Maximum file size: 100MB.
                </p>

                {videoFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {videoFile.name}
                  </p>
                )}

              </div>

              <div className="space-y-3">

                <label className="flex items-center gap-3 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={videoFeatured}
                    onChange={(e) =>
                      setVideoFeatured(
                        e.target.checked
                      )
                    }
                    className="w-4 h-4"
                  />

                  <span className="text-sm">
                    Feature this video
                  </span>

                </label>

                <label className="flex items-center gap-3 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={videoPublished}
                    onChange={(e) =>
                      setVideoPublished(
                        e.target.checked
                      )
                    }
                    className="w-4 h-4"
                  />

                  <span className="text-sm">
                    Publish immediately
                  </span>

                </label>

              </div>

              <button
                type="submit"
                disabled={uploadingVideo}
                className="w-full bg-[#635BFF] hover:bg-[#554DE8] disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold"
              >
                {uploadingVideo
                  ? "Uploading video..."
                  : "Upload Video"}
              </button>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================
   INPUT
========================= */

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>

      <label className="block text-sm font-semibold mb-2">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#635BFF]"
      />

    </div>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-400">
            {title}
          </p>

          <p className="text-3xl font-bold mt-2">
            {value}
          </p>

        </div>

        <div className="w-12 h-12 rounded-xl bg-[#F0EEFF] flex items-center justify-center text-xl">
          {icon}
        </div>

      </div>

    </div>
  );
}

/* =========================
   STATUS BADGE
========================= */

function StatusBadge({
  status,
}: {
  status: "draft" | "active" | "closed";
}) {
  const styles = {
    draft: "bg-gray-100 text-gray-600",
    active: "bg-green-50 text-green-600",
    closed: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() +
        status.slice(1)}
    </span>
  );
}

/* =========================
   EMPTY STATE
========================= */

function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: string;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="py-16 px-6 text-center">

      <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F0EEFF] flex items-center justify-center text-2xl">
        {icon}
      </div>

      <h3 className="font-bold text-lg mt-5">
        {title}
      </h3>

      <p className="text-sm text-gray-400 max-w-md mx-auto mt-2">
        {text}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}

    </div>
  );
}