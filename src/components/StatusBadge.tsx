import { StyleSheet, Text, View } from "react-native";

const COLORS: Record<string, { bg: string; text: string }> = {
  scheduled: { bg: "#FEF3C7", text: "#B45309" },
  in_progress: { bg: "#DBEAFE", text: "#1D4ED8" },
  completed: { bg: "#D1FAE5", text: "#047857" },
  submitted: { bg: "#F1F5F9", text: "#475569" },
  acknowledged: { bg: "#E0E7FF", text: "#4338CA" },
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const colors = COLORS[status] ?? { bg: "#F1F5F9", text: "#475569" };

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
  },
});
