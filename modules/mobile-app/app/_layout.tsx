import "../global.css";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAppStore } from "../src/store/useAppStore";

function UserBadge() {
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);
  if (!currentUser) return null;
  return (
    <Pressable
      className="bg-secondary rounded-lg px-3 py-1.5 mr-2"
      onPress={logout}
    >
      <Text className="text-xs font-semibold text-secondary-foreground">
        {currentUser.name} ({currentUser.role})
      </Text>
    </Pressable>
  );
}

function AppInitializer() {
  const initialize = useAppStore((s) => s.initialize);
  useEffect(() => {
    initialize();
  }, [initialize]);
  return null;
}

function AuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const currentUser = useAppStore((s) => s.currentUser);
  const isAuthLoading = useAppStore((s) => s.isAuthLoading);

  useEffect(() => {
    if (isAuthLoading) return;
    const onAuthScreen = segments[0] === "auth";
    if (!currentUser && !onAuthScreen) {
      router.replace("/auth");
    } else if (currentUser && onAuthScreen) {
      router.replace("/");
    }
  }, [currentUser, isAuthLoading, segments, router]);

  return null;
}

export default function RootLayout() {
  const isAuthLoading = useAppStore((s) => s.isAuthLoading);

  if (isAuthLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <AppInitializer />
      <AuthGuard />
      <Stack
        screenOptions={{
          headerRight: () => <UserBadge />,
          contentStyle: { backgroundColor: "#ffffff" },
        }}
      >
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="sections/[id]/index" options={{ title: "Section Details" }} />
        <Stack.Screen name="sections/[id]/checkout" options={{ title: "Checkout" }} />
        <Stack.Screen name="sections/[id]/live-class" options={{ title: "Live Class" }} />
      </Stack>
    </>
  );
}
