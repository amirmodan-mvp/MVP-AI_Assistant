import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SeverityBar } from "@/components/SeverityBar";
import { ANNOUNCEMENTS } from "@/data/apartment";

const GREEN = "#1E3D2F";
const TEXT = "#1A1C1A";
const MUTED = "#6C706A";
const BG = "#F5F2ED";

export default function AnnouncementsScreen() {
    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <View style={styles.header}>
                <Pressable
                    testID="announcements-back-button"
                    onPress={() => router.back()}
                    style={styles.backButton}
                    hitSlop={8}
                >
                    <Ionicons name="chevron-back" size={20} color="#FFF" />
                </Pressable>

                <View style={styles.headerText}>
                    <Text style={styles.title}>Announcements</Text>
                    <Text style={styles.subtitle}>Updates from your property</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    {ANNOUNCEMENTS.length === 0 ? (
                        <View style={styles.empty}>
                            <Ionicons
                                name="megaphone-outline"
                                size={28}
                                color={MUTED}
                            />
                            <Text style={styles.emptyTitle}>No announcements</Text>
                            <Text style={styles.emptyBody}>
                                There are no property announcements right now.
                            </Text>
                        </View>
                    ) : (
                        ANNOUNCEMENTS.map((announcement, index) => (
                            <View
                                key={announcement.id}
                                style={[
                                    styles.announcement,
                                    index > 0 && styles.topBorder,
                                ]}
                            >
                                <SeverityBar severity={announcement.severity} />

                                <View style={styles.flex}>
                                    <Text style={styles.announcementTitle}>
                                        {announcement.title}
                                    </Text>

                                    <Text style={styles.announcementBody}>
                                        {announcement.body}
                                    </Text>

                                    <Text style={styles.date}>{announcement.date}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: BG,
    },

    header: {
        backgroundColor: GREEN,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 18,
        flexDirection: "row",
        alignItems: "center",
    },

    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    headerText: {
        flex: 1,
    },

    title: {
        color: "#FFF",
        fontSize: 20,
        fontWeight: "700",
    },

    subtitle: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 11,
        marginTop: 2,
    },

    scroll: {
        flex: 1,
    },

    content: {
        padding: 16,
        paddingBottom: 32,
    },

    card: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        overflow: "hidden",
    },

    announcement: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexDirection: "row",
        gap: 10,
    },

    topBorder: {
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.05)",
    },

    announcementTitle: {
        color: TEXT,
        fontSize: 13,
        fontWeight: "600",
    },

    announcementBody: {
        color: MUTED,
        fontSize: 12,
        marginTop: 3,
        lineHeight: 17,
    },

    date: {
        color: "rgba(108,112,106,0.6)",
        fontSize: 10,
        marginTop: 7,
    },

    flex: {
        flex: 1,
        minWidth: 0,
    },

    empty: {
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 48,
    },

    emptyTitle: {
        color: TEXT,
        fontSize: 14,
        fontWeight: "600",
        marginTop: 10,
    },

    emptyBody: {
        color: MUTED,
        fontSize: 11,
        textAlign: "center",
        marginTop: 4,
        lineHeight: 16,
    },
});
