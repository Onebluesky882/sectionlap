import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "../src/store/useAppStore";
import type { UserRole } from "../src/types";

export default function AuthPage() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const signup = useAppStore((s) => s.signup);
  const isAuthLoading = useAppStore((s) => s.isAuthLoading);

  const [tab, setTab] = useState<"login" | "signup">("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState<UserRole>("student");

  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin() {
    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg("Please enter your email and password.");
      return;
    }
    setErrorMsg("");
    try {
      await login(loginEmail.trim(), loginPassword);
      router.replace("/");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to sign in.");
    }
  }

  async function handleSignup() {
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    setErrorMsg("");
    try {
      await signup(signupName.trim(), signupEmail.trim(), signupPassword, signupRole);
      router.replace("/");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create account.");
    }
  }

  const inputClass =
    "border border-border rounded-xl px-4 py-3 text-base text-foreground bg-background";

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerClassName="max-w-md w-full mx-auto px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-3xl font-extrabold text-foreground text-center mb-1">
          SectionLap
        </Text>
        <Text className="text-sm text-muted-foreground text-center mb-8">
          Live classes for modern education
        </Text>

        {/* Tab toggle */}
        <View className="flex-row bg-muted rounded-xl p-1 mb-6">
          <Pressable
            className={`flex-1 py-2.5 rounded-lg items-center ${tab === "login" ? "bg-background shadow-sm" : ""}`}
            onPress={() => { setTab("login"); setErrorMsg(""); }}
          >
            <Text className={`text-sm font-semibold ${tab === "login" ? "text-foreground" : "text-muted-foreground"}`}>
              Login
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-2.5 rounded-lg items-center ${tab === "signup" ? "bg-background shadow-sm" : ""}`}
            onPress={() => { setTab("signup"); setErrorMsg(""); }}
          >
            <Text className={`text-sm font-semibold ${tab === "signup" ? "text-foreground" : "text-muted-foreground"}`}>
              Create Account
            </Text>
          </Pressable>
        </View>

        {errorMsg ? (
          <View className="bg-destructive/10 rounded-lg px-4 py-3 mb-4">
            <Text className="text-sm font-medium text-destructive">{errorMsg}</Text>
          </View>
        ) : null}

        {tab === "login" ? (
          <View className="gap-4">
            <View className="gap-1.5">
              <Text className="text-sm font-semibold text-foreground">Email</Text>
              <TextInput
                className={inputClass}
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                value={loginEmail}
                onChangeText={setLoginEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
            <View className="gap-1.5">
              <Text className="text-sm font-semibold text-foreground">Password</Text>
              <TextInput
                className={inputClass}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
                autoComplete="current-password"
              />
            </View>
            <Pressable
              className="bg-indigo-600 rounded-xl py-3.5 items-center mt-2"
              onPress={handleLogin}
              disabled={isAuthLoading}
            >
              <Text className="text-white font-bold text-base">
                {isAuthLoading ? "Signing in…" : "Sign In"}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-4">
            <View className="gap-1.5">
              <Text className="text-sm font-semibold text-foreground">Full Name</Text>
              <TextInput
                className={inputClass}
                placeholder="Enter your name"
                placeholderTextColor="#9ca3af"
                value={signupName}
                onChangeText={setSignupName}
                autoCapitalize="words"
              />
            </View>
            <View className="gap-1.5">
              <Text className="text-sm font-semibold text-foreground">Email</Text>
              <TextInput
                className={inputClass}
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                value={signupEmail}
                onChangeText={setSignupEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
            <View className="gap-1.5">
              <Text className="text-sm font-semibold text-foreground">Password</Text>
              <TextInput
                className={inputClass}
                placeholder="Choose a password"
                placeholderTextColor="#9ca3af"
                value={signupPassword}
                onChangeText={setSignupPassword}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>
            <View className="gap-1.5">
              <Text className="text-sm font-semibold text-foreground">Role</Text>
              <View className="flex-row gap-3">
                <Pressable
                  className={`flex-1 rounded-xl border py-3 items-center ${signupRole === "student" ? "border-indigo-500 bg-indigo-500/10" : "border-border"}`}
                  onPress={() => setSignupRole("student")}
                >
                  <Text className={`font-semibold text-sm ${signupRole === "student" ? "text-indigo-600" : "text-foreground"}`}>
                    Student
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">Browse & Book</Text>
                </Pressable>
                <Pressable
                  className={`flex-1 rounded-xl border py-3 items-center ${signupRole === "teacher" ? "border-purple-500 bg-purple-500/10" : "border-border"}`}
                  onPress={() => setSignupRole("teacher")}
                >
                  <Text className={`font-semibold text-sm ${signupRole === "teacher" ? "text-purple-600" : "text-foreground"}`}>
                    Teacher
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">Manage classes</Text>
                </Pressable>
              </View>
            </View>
            <Pressable
              className="bg-indigo-600 rounded-xl py-3.5 items-center mt-2"
              onPress={handleSignup}
              disabled={isAuthLoading}
            >
              <Text className="text-white font-bold text-base">
                {isAuthLoading ? "Creating account…" : "Create Account"}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
