import { Text, View } from "react-native";

interface BadgeProps {
  children: string;
  variant?: "default" | "muted";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const bg = variant === "muted" ? "bg-muted" : "bg-secondary";
  const text = variant === "muted" ? "text-muted-foreground" : "text-secondary-foreground";
  return (
    <View className={`${bg} rounded-full px-2 py-0.5 self-start`}>
      <Text className={`${text} text-xs font-medium`}>{children}</Text>
    </View>
  );
}
