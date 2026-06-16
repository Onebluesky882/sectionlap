import { View } from "react-native";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <View className={`bg-card rounded-xl p-4 border border-border ${className ?? ""}`}>
      {children}
    </View>
  );
}
