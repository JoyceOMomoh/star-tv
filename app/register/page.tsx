"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<"creator" | "viewer">(
    "creator"
  );

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!fullName || !username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!agree) {
      setError("Please agree to the terms and conditions.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // Create account in Supabase Authentication
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!data.user) {
        throw new Error("Account could not be created.");
      }

      // Create the user's profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          full_name: fullName.trim(),
          username: username.trim().toLowerCase(),
          role: accountType,
        });

      if (profileError) {
        throw profileError;
      }

      setSuccess(
        "Account created successfully! Please check your email to verify your account."
      );

      // Clear form
      setFullName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setAgree(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09051A] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-pink-600 to-blue-700" />

          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-blue-400/30 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12">
            <Link href="/" className="text-2xl font-black tracking-tight">
              STAR TV <span className="text-yellow-300">★</span>
            </Link>

            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-white/70">
                JOIN THE MOVEMENT
              </p>

              <h1 className="max-w-xl text-5xl font-black leading-tight xl:text-6xl">
                Your talent deserves a stage. ⭐
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-white/80">
                Join Star TV, participate in exciting challenges, share your
                talent and get discovered.
              </p>
            </div>

            <p className="text-sm text-white/60">
              Create. Share. Compete. Become a Star.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-lg">

            {/* Mobile logo */}
            <Link
              href="/"
              className="mb-10 block text-center text-2xl font-black lg:hidden"
            >
              STAR TV <span className="text-yellow-400">★</span>
            </Link>

            <div className="mb-8">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-purple-400">
                CREATE ACCOUNT
              </p>

              <h2 className="text-4xl font-black">
                Welcome to Star TV 🚀
              </h2>

              <p className="mt-3 text-gray-400">
                Create your account and start your Star journey.
              </p>
            </div>

            {/* Account type */}
            <div className="mb-6">
              <p className="mb-3 text-sm font-bold text-gray-300">
                I want to join as
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("creator")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    accountType === "creator"
                      ? "border-purple-500 bg-purple-500/15"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="mb-1 text-xl">⭐</div>
                  <div className="font-bold">Creator</div>
                  <div className="mt-1 text-xs text-gray-400">
                    Enter challenges
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("viewer")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    accountType === "viewer"
                      ? "border-blue-500 bg-blue-500/15"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="mb-1 text-xl">👀</div>
                  <div className="font-bold">Viewer</div>
                  <div className="mt-1 text-xs text-gray-400">
                    Watch & vote
                  </div>
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm leading-6 text-green-300">
                {success}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">

              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Full Name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500 focus:bg-white/10"
                />
              </div>

              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Username
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@yourusername"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500 focus:bg-white/10"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500 focus:bg-white/10"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 pr-20 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500 focus:bg-white/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-purple-400 hover:text-purple-300"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-purple-500"
                />

                <span>
                  I agree to the Star TV terms and conditions.
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 px-5 py-4 font-black transition hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Create My Account →"}
              </button>
            </form>

            {/* Login */}
            <p className="mt-8 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-purple-400 hover:text-purple-300"
              >
                Sign in
              </Link>
            </p>

          </div>
        </div>
      </div>
    </main>
  );
}