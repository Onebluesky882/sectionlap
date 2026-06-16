import { TextInput, type TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  className?: string;
}

export function Input({ className, ...props }: InputProps) {
  return (
    <TextInput
      className={`bg-background border border-input rounded-lg px-3 py-2.5 text-foreground text-base ${className ?? ""}`}
      placeholderTextColor="#94a3b8"
      {...props}
    />
  );
}
