import { Text, View } from "react-native";
import { Input } from "./Input";
import { Button } from "./Button";
import type { SectionFormValues } from "../hooks/useSectionForm";

interface Props {
  mode: "new" | "edit";
  values: SectionFormValues;
  onChange: (v: SectionFormValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function SectionForm({ mode, values, onChange, onSubmit, onCancel }: Props) {
  return (
    <View className="bg-card border border-border rounded-xl p-4 mb-4 gap-2">
      <Text className="text-lg font-bold text-foreground">
        {mode === "new" ? "New Section" : "Edit Section"}
      </Text>

      <Text className="text-sm font-semibold text-foreground mt-2">Title</Text>
      <Input value={values.title} onChangeText={(t) => onChange({ ...values, title: t })} />

      <Text className="text-sm font-semibold text-foreground mt-1">Description</Text>
      <Input
        value={values.description}
        onChangeText={(t) => onChange({ ...values, description: t })}
        multiline
        className="min-h-[80px]"
      />

      <Text className="text-sm font-semibold text-foreground mt-1">Teacher</Text>
      <Input value={values.teacher} onChangeText={(t) => onChange({ ...values, teacher: t })} />

      <Text className="text-sm font-semibold text-foreground mt-1">Category</Text>
      <Input value={values.category} onChangeText={(t) => onChange({ ...values, category: t })} />

      <Text className="text-sm font-semibold text-foreground mt-1">Price ($)</Text>
      <Input
        value={values.price}
        onChangeText={(t) => onChange({ ...values, price: t })}
        keyboardType="numeric"
      />

      <Text className="text-sm font-semibold text-foreground mt-1">Duration (minutes)</Text>
      <Input
        value={values.durationMinutes}
        onChangeText={(t) => onChange({ ...values, durationMinutes: t })}
        keyboardType="numeric"
      />

      <Text className="text-sm font-semibold text-foreground mt-1">Capacity (seats)</Text>
      <Input
        value={values.capacity}
        onChangeText={(t) => onChange({ ...values, capacity: t })}
        keyboardType="numeric"
      />

      <View className="flex-row gap-2 mt-3">
        <View className="flex-1">
          <Button onPress={onSubmit}>Save</Button>
        </View>
        <View className="flex-1">
          <Button onPress={onCancel} variant="secondary">Cancel</Button>
        </View>
      </View>
    </View>
  );
}
