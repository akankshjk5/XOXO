"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  Shield,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { getPostLoginPath } from "@/lib/auth-routing";

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "bg-white/20" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-400" };
  if (score <= 3) return { score: 2, label: "Fair", color: "bg-amber-400" };
  return { score: 3, label: "Strong", color: "bg-green-bright" };
}

const SOCIAL_PROVIDERS = [
  { id: "google", label: "Continue with Google" },
  { id: "apple", label: "Continue with Apple" },
  { id: "github", label: "Continue with GitHub" },
] as const;

export function PremiumLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [pwValue, setPwValue] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, touchedFields },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const emailValue = watch("email");
  const strength = useMemo(() => passwordStrength(pwValue), [pwValue]);

  useEffect(() => {
    if (!hydrated || !user || !token) return;
    const redirect = searchParams?.get("redirect");
    router.replace(getPostLoginPath(user, redirect));
  }, [hydrated, user, token, router, searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("xoxo_remember_email");
    if (saved) {
      setValue("email", saved);
      setRemember(true);
    }
  }, [setValue]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      if (remember && typeof window !== "undefined") {
        localStorage.setItem("xoxo_remember_email", data.email);
      } else if (typeof window !== "undefined") {
        localStorage.removeItem("xoxo_remember_email");
      }
      setSuccess(true);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      const redirect = searchParams?.get("redirect");
      setTimeout(() => router.replace(getPostLoginPath(user, redirect)), 600);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Login failed. Check your credentials.";
      toast.error(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const passwordRegister = register("password", {
    onChange: (e) => setPwValue(e.target.value),
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, x: shake ? [0, -8, 8, -6, 6, 0] : 0 }}
        transition={{ duration: shake ? 0.45 : 0.6 }}
        className="glass-login-card w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-dark shadow-lg shadow-green-dark/30">
            <Sparkles className="h-7 w-7 text-white" aria-hidden />
          </div>
          <h2 className="font-primary text-2xl font-semibold text-text-dark">Welcome Back</h2>
          <p className="mt-2 text-sm text-text-grey">Sign in to continue your journey with XOXO</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="auth-input"
              {...register("email")}
            />
            {touchedFields.email && errors.email && (
              <p id="email-error" className="text-xs text-red-500" role="alert">
                {errors.email.message}
              </p>
            )}
            {emailValue && !errors.email && (
              <p className="flex items-center gap-1 text-xs text-green-dark">
                <CheckCircle2 className="h-3 w-3" aria-hidden /> Looks good
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={() => toast("Password reset coming soon", { icon: "🔐" })}
                className="text-xs font-medium text-green-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-bright rounded"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : "password-strength"}
                className="auth-input pr-11"
                {...passwordRegister}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-text-grey transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-bright"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {pwValue.length > 0 && (
              <div id="password-strength" className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= strength.score ? strength.color : "bg-black/10"
                      }`}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p className="text-xs text-text-grey">Strength: {strength.label}</p>
                )}
              </div>
            )}
            {errors.password && (
              <p id="password-error" className="text-xs text-red-500" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-grey">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-border-light text-green-dark focus:ring-green-bright"
            />
            Remember me
          </label>

          <Button
            type="submit"
            className="auth-submit-btn w-full"
            disabled={loading || success || !isValid}
            aria-busy={loading}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Signing in…
                </motion.span>
              ) : success ? (
                <motion.span
                  key="success"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  Success!
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Continue
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border-light" />
          <span className="text-xs font-medium uppercase tracking-wider text-text-grey">or</span>
          <div className="h-px flex-1 bg-border-light" />
        </div>

        <div className="space-y-2">
          {SOCIAL_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              disabled
              title="Social login coming soon"
              className="social-auth-btn w-full"
              aria-label={`${provider.label} (coming soon)`}
            >
              {provider.label}
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-text-grey">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-green-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-bright rounded"
          >
            Sign up free
          </Link>
        </p>
      </motion.div>

      <footer className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-text-grey">
        <span className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-green-dark" aria-hidden />
          Secure Login
        </span>
        <span className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-green-dark" aria-hidden />
          256-bit Encryption
        </span>
        <span>Trusted by Travelers</span>
      </footer>
    </div>
  );
}
