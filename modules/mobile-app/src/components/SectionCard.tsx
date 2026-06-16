import { Text, View } from "react-native";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import type { Section } from "../types";

interface Props {
  section: Section;
  actionLabel: string;
  onAction: () => void;
  enrolledCount?: number;
}

export function SectionCard({ section, actionLabel, onAction, enrolledCount }: Props) {
  return (
    <Card className="mb-3">
      <Badge>{section.category}</Badge>
      <Text className="text-xl font-bold text-foreground mt-2">{section.title}</Text>
      <Text className="text-sm text-muted-foreground mt-1">{section.description}</Text>
      <View className="flex-row justify-between mt-3 mb-1">
        <Text className="font-bold text-foreground">${section.price}</Text>
        <Text className="text-sm text-muted-foreground">by {section.teacher}</Text>
      </View>
      {enrolledCount !== undefined && (
        <Text className="text-xs text-muted-foreground mb-2">
          {enrolledCount}/{section.capacity} seats booked
        </Text>
      )}
      <Button onPress={onAction}>{actionLabel}</Button>
    </Card>
  );
}
