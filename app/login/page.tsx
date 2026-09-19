"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        throw loginError;
      }

      // Login successful
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(
        err.message || "Unable to sign in. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError("");

    if (!email) {
      setError("Enter your email address first.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      setError(error.message);
      return;
    }

    setError("Password reset instructions have been sent to your email.");
  }

  return (
    <main className="min-h-screen bg-[#09051A] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-purple-700 to-pink-600" />

          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl" />

          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-pink-400/30 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12">

            <Link
              href="/"
              className="text-2xl font-black tracking-tight"
            >
              STAR TV <span className="text-yellow-300">★</span>
            </Link>

            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-white/70">
                WELCOME BACK
              </p>

              <h1 className="max-w-xl text-5xl font-black leading-tight xl:text-6xl">
                Ready for your next Star moment? ⭐
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-white/80">
                Discover challenges, watch amazing talent, vote for your
                favourites and be part of the Star TV community.
              </p>
            </div>

            <p className="text-sm text-white/60">
              Create. Share. Compete. Become a Star.
            </p>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}
            <Link
              href="/"
              className="mb-10 block text-center text-2xl font-black lg:hidden"
            >
              STAR TV <span className="text-yellow-400">★</span>
            </Link>

            <div className="mb-8">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-purple-400">
                SIGN IN
              </p>

              <h2 className="text-4xl font-black">
                Welcome back 👋
              </h2>

              <p className="mt-3 text-gray-400">
                Sign in to continue your Star TV journey.
              </p>
            </div>

            {/* ERROR / MESSAGE */}
            {error && (
              <div className="mb-5 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm leading-6 text-purple-200">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500 focus:bg-white/10"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-300">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
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

              {/* REMEMBER ME */}
              <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-purple-500"
                />

                <span>Remember me</span>
              </label>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 px-5 py-4 font-black transition hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Sign In →"}
              </button>
            </form>

            {/* DIVIDER */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />

              <span className="text-xs text-gray-600">
                OR
              </span>

              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* GOOGLE PLACEHOLDER */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold transition hover:bg-white/10"
            >
              <span className="text-lg">G</span>
              Continue with Google
            </button>

            {/* REGISTER */}
            <p className="mt-8 text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-purple-400 hover:text-purple-300"
              >
                Create one
              </Link>
            </p>

          </div>
        </div>

      </div>
    </main>
  );
}