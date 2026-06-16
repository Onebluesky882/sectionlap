import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text } from "react-native";
import { useAppStore } from "../src/store/useAppStore";

function RoleSwitcher() {
  const currentUser = useAppStore((s) => s.currentUser);
  const switchRole = useAppStore((s) => s.switchRole);
  return (
    <Pressable
      className="bg-secondary rounded-lg px-3 py-1.5 mr-2"
      onPress={switchRole}
    >
      <Text className="text-xs font-semibold text-secondary-foreground">
        {currentUser.name} ({currentUser.role})
      </Text>
    </Pressable>
  );
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerRight: () => <RoleSwitcher />,
          contentStyle: { backgroundColor: "#ffffff" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="sections/[id]/index" options={{ title: "Section Details" }} />
        <Stack.Screen name="sections/[id]/checkout" options={{ title: "Checkout" }} />
        <Stack.Screen name="sections/[id]/live-class" options={{ title: "Live Class" }} />
      </Stack>
    </>
  );
}
