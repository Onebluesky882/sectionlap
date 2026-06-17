import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/ui/button";
import { User, GraduationCap, ArrowRight, PlusCircle, LogIn, Mail, Lock } from "lucide-react";
import type { UserRole } from "../types";
import sectionlapLogo from "../assets/sectionlap_logo.png";

export function AuthPage() {
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);
  const signup = useAppStore((state) => state.signup);

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign up state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState<UserRole>("student");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await login(loginEmail.trim(), loginPassword);
      navigate("/");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await signup(signupName.trim(), signupEmail.trim(), signupPassword, signupRole);
      navigate("/");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-100px)] items-center justify-center overflow-hidden py-10 px-4">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl" />
      <div className="absolute top-1/3 right-1/3 -z-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Main Container Card */}
      <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-white/70 shadow-2xl backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/60 p-8 transition-all">
        {/* Title / Logo Header */}
        <div className="mb-8 text-center">
          <img src={sectionlapLogo} alt="SectionLap" className="mx-auto h-24 w-auto" />
          <p className="mt-3 text-sm text-muted-foreground">
            Collab tools and live classes for modern education
          </p>
        </div>

        {/* Tab Selector */}
        <div className="mb-6 flex rounded-lg bg-muted/60 p-1">
          <button
            onClick={() => {
              setActiveTab("login");
              setErrorMsg("");
            }}
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-md transition-all ${activeTab === "login"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <LogIn className="size-4" />
            Login
          </button>
          <button
            onClick={() => {
              setActiveTab("signup");
              setErrorMsg("");
            }}
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-md transition-all ${activeTab === "signup"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <PlusCircle className="size-4" />
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
            {errorMsg}
          </div>
        )}

        {/* Tab Contents */}
        {activeTab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-semibold text-foreground">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Mail className="size-5" />
                </span>
                <input
                  type="email"
                  id="login-email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm text-foreground shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-semibold text-foreground">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Lock className="size-5" />
                </span>
                <input
                  type="password"
                  id="login-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm text-foreground shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold tracking-wide shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all gap-2 mt-2"
            >
              {loading ? "Signing in…" : "Sign In"}
              {!loading && <ArrowRight className="size-4" />}
            </Button>
          </form>
        ) : (
          /* Sign Up Content */
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-foreground">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <User className="size-5" />
                </span>
                <input
                  type="text"
                  id="name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm text-foreground shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-email" className="text-sm font-semibold text-foreground">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Mail className="size-5" />
                </span>
                <input
                  type="email"
                  id="signup-email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm text-foreground shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-password" className="text-sm font-semibold text-foreground">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Lock className="size-5" />
                </span>
                <input
                  type="password"
                  id="signup-password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Choose a password"
                  className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm text-foreground shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  onClick={() => setSignupRole("student")}
                  className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-accent/30 transition-all ${signupRole === "student"
                      ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-500/5 dark:bg-indigo-400/5"
                      : "border-border"
                    }`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={signupRole === "student"}
                    onChange={() => setSignupRole("student")}
                    className="sr-only"
                  />
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${signupRole === "student"
                      ? "bg-indigo-500 text-white"
                      : "bg-muted text-muted-foreground"
                    }`}>
                    <User className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Student</p>
                    <p className="text-xs text-muted-foreground">Browse & Book</p>
                  </div>
                </label>

                <label
                  onClick={() => setSignupRole("teacher")}
                  className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-accent/30 transition-all ${signupRole === "teacher"
                      ? "border-purple-500 ring-1 ring-purple-500 bg-purple-500/5 dark:bg-purple-400/5"
                      : "border-border"
                    }`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={signupRole === "teacher"}
                    onChange={() => setSignupRole("teacher")}
                    className="sr-only"
                  />
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${signupRole === "teacher"
                      ? "bg-purple-500 text-white"
                      : "bg-muted text-muted-foreground"
                    }`}>
                    <GraduationCap className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Teacher</p>
                    <p className="text-xs text-muted-foreground">Manage classes</p>
                  </div>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold tracking-wide shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all gap-2 mt-4"
            >
              {loading ? "Creating account…" : "Create Account"}
              {!loading && <PlusCircle className="size-4" />}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
