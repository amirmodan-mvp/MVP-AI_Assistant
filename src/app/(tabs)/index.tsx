import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SeverityBar } from "@/components/SeverityBar";
import { StatusBadge } from "@/components/StatusBadge";
import { AMENITIES, ANNOUNCEMENTS, BALANCE, MAINTENANCE, RESIDENT, fmt } from "@/data/apartment";

const GREEN = "#1E3D2F";
const TEXT = "#1A1C1A";
const MUTED = "#6C706A";
const BG = "#F5F2ED";

export default function HomeTab() {
  const urgent = ANNOUNCEMENTS.find((a) => a.severity === "urgent");
  const openReqs = MAINTENANCE.filter((m) => m.status !== "completed");
  const booked = AMENITIES.find((a) => a.booking);

  const actions = [
    { label: "Pay", icon: "card-outline" as const, route: "/pay", color: "#1E3D2F" },
    { label: "Service", icon: "construct-outline" as const, route: "/maintenance", color: "#2C5282" },
    { label: "Book", icon: "calendar-outline" as const, route: "/amenities", color: "#6B3FA0" },
    { label: "Docs", icon: "document-text-outline" as const, route: "/more", color: "#9B4A0B" },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View>
            <Text style={styles.goodMorning}>Good morning</Text>
            <Text style={styles.name}>{RESIDENT.name}</Text>
            <View style={styles.buildingRow}>
              <Ionicons name="business-outline" size={11} color="rgba(255,255,255,0.4)" />
              <Text style={styles.buildingText}>
                {RESIDENT.building} · Unit {RESIDENT.unit}
              </Text>
            </View>
          </View>
          <Pressable onPress={() => router.push("/announcements")} style={styles.bell}>
            <Ionicons name="notifications-outline" size={18} color="#FFF" />
            <View style={styles.dot} />
          </Pressable>
        </View>

        {urgent ? (
          <View style={styles.alert}>
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
            <View style={styles.flex}>
              <Text style={styles.alertTitle}>{urgent.title}</Text>
              <Text style={styles.alertBody}>{urgent.body}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.eyebrow}>Rent due</Text>
              <Text style={styles.amount}>{fmt(BALANCE.amount)}</Text>
              <Text style={styles.mutedSmall}>Due {BALANCE.dueDate}</Text>
            </View>
            <Pressable onPress={() => router.push("/pay")} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Pay now</Text>
            </Pressable>
          </View>
          <View style={styles.dividerRow}>
            <Ionicons name="checkmark-circle" size={13} color="#10B981" />
            <Text style={styles.mutedSmall}>
              Autopay on · Next charge: {BALANCE.dueDate}
            </Text>
          </View>
        </View>

        <View style={styles.actionGrid}>
          {actions.map((action) => (
            <Pressable key={action.label} onPress={() => router.push(action.route)} style={styles.action}>
              <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                <Ionicons name={action.icon} size={17} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Maintenance</Text>
            <Pressable onPress={() => router.push("/maintenance")} style={styles.seeAll}>
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons name="chevron-forward" size={12} color={GREEN} />
            </Pressable>
          </View>

          {openReqs.length === 0 ? (
            <Text style={styles.muted}>No open requests.</Text>
          ) : (
            openReqs.map((req, i) => (
              <Pressable
                key={req.id}
                onPress={() => router.push("/maintenance")}
                style={[styles.requestRow, i > 0 && styles.topBorder]}
              >
                <View style={styles.flex}>
                  <View style={styles.metaRow}>
                    <Text style={styles.mono}>{req.id}</Text>
                    <StatusBadge status={req.status} label={req.statusLabel} />
                  </View>
                  <Text style={styles.requestTitle}>{req.title}</Text>
                  {req.appt ? (
                    <View style={styles.metaRow}>
                      <Ionicons name="time-outline" size={11} color={MUTED} />
                      <Text style={styles.mutedSmall}>{req.appt}</Text>
                    </View>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={14} color={MUTED} />
              </Pressable>
            ))
          )}
        </View>

        {booked?.booking ? (
          <View style={styles.card}>
            <Image source={{ uri: booked.img }} style={styles.bookingImage} />
            <View style={styles.bookingOverlay}>
              <Text style={styles.bookingName}>{booked.name}</Text>
            </View>
            <View style={styles.bookingInfo}>
              <View style={styles.flex}>
                <Text style={styles.sectionTitle}>Upcoming reservation</Text>
                <Text style={styles.mutedSmall}>
                  {booked.booking.date} · {booked.booking.time} · {booked.booking.guests} guests
                </Text>
              </View>
              <Pressable onPress={() => router.push("/amenities")}>
                <Ionicons name="chevron-forward" size={16} color={MUTED} />
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={[styles.card, styles.lastCard]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Announcements</Text>
            <Pressable
              onPress={() => router.push("/announcements")}
              style={styles.seeAll}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons name="chevron-forward" size={12} color={GREEN} />
            </Pressable>
          </View>
          {ANNOUNCEMENTS.map((a, i) => (
            <View key={a.id} style={[styles.announcement, i > 0 && styles.topBorder]}>
              <SeverityBar severity={a.severity} />
              <View style={styles.flex}>
                <Text style={styles.announcementTitle}>{a.title}</Text>
                <Text style={styles.announcementBody}>{a.body}</Text>
                <Text style={styles.date}>{a.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  content: { paddingBottom: 24 },
  hero: {
    backgroundColor: GREEN,
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goodMorning: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "500" },
  name: { color: "#FFF", fontSize: 22, fontWeight: "700", marginTop: 2 },
  buildingRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 7 },
  buildingText: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
  bell: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center", marginTop: 1,
  },
  dot: {
    position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: 4,
    backgroundColor: "#F87171", borderWidth: 1, borderColor: GREEN,
  },
  alert: {
    marginHorizontal: 16, marginTop: -10, padding: 12, borderRadius: 16,
    backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA",
    flexDirection: "row", gap: 10,
  },
  alertTitle: { color: "#B91C1C", fontSize: 12, fontWeight: "700" },
  alertBody: { color: "#DC2626", fontSize: 11, marginTop: 2, lineHeight: 15 },
  card: {
    marginHorizontal: 16, marginTop: 12, backgroundColor: "#FFF",
    borderRadius: 16, borderWidth: 1, borderColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", padding: 16 },
  eyebrow: { color: MUTED, fontSize: 10, fontWeight: "600", letterSpacing: 1.2, textTransform: "uppercase" },
  amount: { color: TEXT, fontSize: 28, fontWeight: "700", marginTop: 3 },
  mutedSmall: { color: MUTED, fontSize: 11, marginTop: 4 },
  primaryButton: { backgroundColor: GREEN, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignSelf: "flex-start" },
  primaryButtonText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  dividerRow: { borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.05)", paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", gap: 6, alignItems: "center" },
  actionGrid: { marginHorizontal: 16, marginTop: 12, flexDirection: "row", gap: 8 },
  action: { flex: 1, alignItems: "center", backgroundColor: "#FFF", borderRadius: 12, paddingVertical: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.05)" },
  actionIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  actionLabel: { color: TEXT, fontSize: 10, fontWeight: "600", marginTop: 6 },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { color: TEXT, fontSize: 12, fontWeight: "600" },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText: { color: GREEN, fontSize: 11, fontWeight: "600" },
  muted: { color: MUTED, fontSize: 12, padding: 16 },
  requestRow: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  topBorder: { borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.05)" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  mono: { color: MUTED, fontSize: 10, fontVariant: ["tabular-nums"] },
  requestTitle: { color: TEXT, fontSize: 13, fontWeight: "500" },
  bookingImage: { width: "100%", height: 96 },
  bookingOverlay: { position: "absolute", left: 0, right: 0, top: 0, height: 96, justifyContent: "flex-end", padding: 12, backgroundColor: "rgba(0,0,0,0.25)" },
  bookingName: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  bookingInfo: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center" },
  announcement: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", gap: 10 },
  announcementTitle: { color: TEXT, fontSize: 12, fontWeight: "600" },
  announcementBody: { color: MUTED, fontSize: 11, marginTop: 2, lineHeight: 15 },
  date: { color: "rgba(108,112,106,0.6)", fontSize: 10, marginTop: 5 },
  flex: { flex: 1, minWidth: 0 },
  lastCard: { marginBottom: 0 },
});
