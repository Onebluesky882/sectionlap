import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/ui/button";
import { User, GraduationCap, ArrowRight, Sparkles, PlusCircle, LogIn } from "lucide-react";
import type { UserRole } from "../types";

export function AuthPage() {
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);
  const signup = useAppStore((state) => state.signup);
  const users = useAppStore((state) => state.users);

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // Login State
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || "");

  // Sign Up State
  const [signupName, setSignupName] = useState("");
  const [signupRole, setSignupRole] = useState<UserRole>("student");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setErrorMsg("Please select a user.");
      return;
    }
    const success = login(selectedUserId);
    if (success) {
      navigate("/");
    } else {
      setErrorMsg("Failed to login. User not found.");
    }
  };

  const handleQuickLogin = (userId: string) => {
    const success = login(userId);
    if (success) {
      navigate("/");
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    const newUser = signup(signupName.trim(), signupRole);
    if (newUser) {
      navigate("/");
    } else {
      setErrorMsg("Failed to register.");
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
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/25">
            <Sparkles className="size-6 animate-pulse" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
            Welcome to SectionLap
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
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
          <div>
            {/* Quick Dev Login */}
            <div className="mb-8">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quick Access Mock Accounts
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u.id)}
                    className="flex flex-col items-start rounded-xl border border-border/80 bg-background/50 hover:bg-background p-4 text-left shadow-sm hover:border-indigo-500/50 hover:ring-1 hover:ring-indigo-500/50 hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/15 dark:text-indigo-400">
                      {u.role === "teacher" ? (
                        <GraduationCap className="size-5" />
                      ) : (
                        <User className="size-5" />
                      )}
                    </div>
                    <div className="font-bold text-foreground text-sm group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                      {u.name}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {u.role}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Standard Login Selection */}
            <div className="relative flex items-center justify-center py-2 mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <span className="relative bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground">
                Or choose account
              </span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Select Profile
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="" disabled>
                    -- Choose User Profile --
                  </option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold tracking-wide shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all gap-2 mt-2">
                Log In
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </div>
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

            <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold tracking-wide shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all gap-2 mt-4">
              Create Account
              <PlusCircle className="size-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
