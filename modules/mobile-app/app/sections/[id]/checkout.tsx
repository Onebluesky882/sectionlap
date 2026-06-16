import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSection } from "../../../src/hooks/useSection";
import { useCheckout } from "../../../src/hooks/useCheckout";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";

export default function CheckoutPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { section } = useSection(id);
  const { booking, error, paid, failed, pay, simulateFailure, retry } = useCheckout(id);

  useEffect(() => {
    if (!section) router.replace("/");
  }, [section, router]);

  if (!section) return null;

  if (error === "CAPACITY_FULL") {
    return (
      <View className="flex-1 bg-background px-6 py-6">
        <Text className="text-3xl font-bold text-foreground">Checkout</Text>
        <Text className="text-muted-foreground mt-3">
          This section is full — no seats are available to book.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="max-w-3xl w-full mx-auto px-6 py-6 gap-4"
    >
      <Text className="text-3xl font-bold text-foreground">Checkout</Text>

      <Card className="gap-2">
        <Text className="text-xl font-bold text-foreground">{section.title}</Text>
        <Text className="text-sm text-muted-foreground">by {section.teacher}</Text>
        <View className="flex-row justify-between border-t border-border pt-2 mt-1">
          <Text className="text-foreground">Section price</Text>
          <Text className="text-foreground">${section.price}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="font-bold text-foreground">Total</Text>
          <Text className="font-bold text-foreground">${section.price}</Text>
        </View>
      </Card>

      {paid ? (
        <Text className="text-foreground font-medium">
          ✅ Payment simulated successfully — you're booked in!
        </Text>
      ) : failed ? (
        <View className="gap-2">
          <Text className="text-destructive">❌ Payment failed. Please try again.</Text>
          <Button onPress={retry}>Retry Payment</Button>
        </View>
      ) : (
        <View className="gap-2">
          <Button onPress={pay}>{`Pay $${section.price}`}</Button>
          <Button onPress={simulateFailure} variant="secondary">
            Simulate Failed Payment
          </Button>
        </View>
      )}

      <Text className="text-xs text-muted-foreground">
        This is a UI-only simulation. No real payment is processed.
      </Text>
      {booking?.status === "pending" && (
        <Text className="text-xs text-muted-foreground">Booking status: pending payment.</Text>
      )}
    </ScrollView>
  );
}
