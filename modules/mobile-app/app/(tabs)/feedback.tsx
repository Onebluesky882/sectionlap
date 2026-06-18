import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { request } from "../../src/lib/api";

type FeedbackCategory = "general" | "bug" | "suggestion" | "performance";

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "bug", label: "Bug Report" },
  { value: "suggestion", label: "Suggestion" },
  { value: "performance", label: "Performance" },
];

export default function FeedbackScreen() {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<FeedbackCategory>("general");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert("Please select a star rating."); return; }
    if (!message.trim()) { Alert.alert("Please write a message."); return; }
    setLoading(true);
    try {
      const res = await request("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ platform: "mobile", category, rating, message: message.trim() }),
      });
      if (res.error) throw new Error(res.error);
      setSubmitted(true);
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-5xl mb-4">✅</Text>
        <Text className="text-2xl font-bold text-foreground text-center mb-2">
          Thank you for your feedback!
        </Text>
        <Text className="text-muted-foreground text-center mb-6">
          Your input helps us improve SectionLap.
        </Text>
        <TouchableOpacity
          onPress={() => { setSubmitted(false); setRating(0); setMessage(""); setCategory("general"); }}
          className="border border-border rounded-lg px-5 py-2.5"
        >
          <Text className="text-foreground text-sm font-medium">Submit another</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="max-w-xl w-full mx-auto px-6 py-6">
      <Text className="text-3xl font-bold text-foreground mb-1">Feedback</Text>
      <Text className="text-muted-foreground mb-6">Help us improve SectionLap.</Text>

      {/* Star Rating */}
      <Text className="text-sm font-semibold text-foreground mb-2">Overall Rating</Text>
      <View className="flex-row gap-2 mb-5">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text className={`text-4xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category */}
      <Text className="text-sm font-semibold text-foreground mb-2">Category</Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            onPress={() => setCategory(cat.value)}
            className={`rounded-full px-4 py-1.5 border ${
              category === cat.value
                ? "bg-indigo-600 border-indigo-600"
                : "border-border bg-background"
            }`}
          >
            <Text className={`text-sm font-medium ${category === cat.value ? "text-white" : "text-foreground"}`}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Message */}
      <Text className="text-sm font-semibold text-foreground mb-2">Message</Text>
      <TextInput
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={5}
        placeholder="Tell us what you think..."
        placeholderTextColor="#9ca3af"
        textAlignVertical="top"
        className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground bg-background mb-6"
        style={{ minHeight: 120 }}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className="bg-indigo-600 rounded-xl py-4 items-center"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-base">Send Feedback</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
