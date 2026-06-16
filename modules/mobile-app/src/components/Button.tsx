import { Pressable, Text } from "react-native";

interface ButtonProps {
  onPress: () => void;
  children: string;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  className?: string;
}

export function Button({ onPress, children, variant = "primary", disabled, className }: ButtonProps) {
  const base = "rounded-lg py-3 px-4 items-center justify-center";
  const variants = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    ghost: "bg-transparent border border-border",
  };
  const textVariants = {
    primary: "text-primary-foreground font-semibold",
    secondary: "text-secondary-foreground font-semibold",
    ghost: "text-foreground font-semibold",
  };

  return (
    <Pressable
      className={`${base} ${variants[variant]} ${disabled ? "opacity-50" : ""} ${className ?? ""}`}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className={textVariants[variant]}>{children}</Text>
    </Pressable>
  );
}
