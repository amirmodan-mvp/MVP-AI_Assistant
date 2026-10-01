import { View } from "react-native";

const COLORS: Record<string, string> = {
  urgent: "#EF4444",
  important: "#F59E0B",
  routine: "#CBD5E1",
};

export function SeverityBar({ severity }: { severity: string }) {
  return (
    <View
      style={{
        width: 4,
        alignSelf: "stretch",
        borderRadius: 999,
        backgroundColor: COLORS[severity] ?? "#CBD5E1",
      }}
    />
  );
}
