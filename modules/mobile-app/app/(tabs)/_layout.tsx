import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Sections" }} />
      <Tabs.Screen name="enrollments" options={{ title: "My Enrollments" }} />
      <Tabs.Screen name="teach" options={{ title: "Teach" }} />
    </Tabs>
  );
}
