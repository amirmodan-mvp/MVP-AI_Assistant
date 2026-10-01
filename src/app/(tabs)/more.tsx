import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BALANCE, DOCUMENTS, RESIDENT, fmt } from "@/data/apartment";

const GREEN = "#1E3D2F";
const TEXT = "#1A1C1A";
const MUTED = "#6C706A";
const BG = "#F5F2ED";

const OFFICE_PHONE = "tel:+14155550123";
const OFFICE_EMAIL = "mailto:office@example.com";

type ModalType =
  | "notifications"
  | "profile"
  | "privacy"
  | "support"
  | null;

const FAQS = [
  {
    question: "How do I submit a maintenance request?",
    answer:
      "Open the Maintenance tab from the bottom navigation and tap New request. Add the issue, location, description, and any photos needed.",
  },
  {
    question: "How do I make a rent payment?",
    answer:
      "Open the Pay tab to review your balance, payment method, autopay status, and recent transactions.",
  },
  {
    question: "Where can I find my lease documents?",
    answer:
      "Your documents are available in the Documents section of this page. Tap any document to open it.",
  },
  {
    question: "How do I contact the leasing office?",
    answer:
      "Use Contact the office below to call or email the office directly during business hours.",
  },
];

export default function MoreTab() {
  const router = useRouter();

  const [expandedLease, setExpandedLease] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [openingDocument, setOpeningDocument] = useState<string | null>(null);

  const [notifications, setNotifications] = useState({
    announcements: true,
    maintenance: true,
    payments: true,
    community: true,
  });

  const [profile, setProfile] = useState({
    name: RESIDENT.name,
    phone: "(415) 555-0123",
    email: "resident@example.com",
  });

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleOpenDocument = async (
    documentId: string,
    title: string,
    url: string,
  ) => {
    setOpeningDocument(documentId);

    try {
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert(
          "Unable to open document",
          `Your device could not open "${title}".`,
        );
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Unable to open document",
        `There was a problem opening "${title}".`,
      );
    } finally {
      setOpeningDocument(null);
    }
  };

  const handleContactOffice = () => {
    Alert.alert(
      "Contact the office",
      "How would you like to contact the office?",
      [
        {
          text: "Call",
          onPress: () => {
            Linking.openURL(OFFICE_PHONE).catch(() => {
              Alert.alert(
                "Unable to call",
                "The phone app could not be opened.",
              );
            });
          },
        },
        {
          text: "Email",
          onPress: () => {
            Linking.openURL(OFFICE_EMAIL).catch(() => {
              Alert.alert(
                "Unable to email",
                "The email app could not be opened.",
              );
            });
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };

  const handleSaveProfile = () => {
    setModal(null);

    Alert.alert(
      "Profile updated",
      "Your profile information has been updated.",
      [{ text: "OK" }],
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out of your resident account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign out",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Signed out",
              "You have been signed out of the demo account.",
            );
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.flex}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.sub}>
              {RESIDENT.building} · Unit {RESIDENT.unit}
            </Text>
            <Text style={styles.lease}>
              Lease ends {RESIDENT.leaseEnd}
            </Text>
          </View>

          <Pressable
            testID="more-profile-button"
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            onPress={() => setModal("profile")}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="create-outline" size={17} color="#FFF" />
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.quickActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/pay")}
              style={({ pressed }) => [
                styles.quickAction,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.quickIcon}>
                <Ionicons name="card-outline" size={17} color={GREEN} />
              </View>
              <Text style={styles.quickLabel}>Pay rent</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/maintenance")}
              style={({ pressed }) => [
                styles.quickAction,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.quickIcon}>
                <Ionicons
                  name="construct-outline"
                  size={17}
                  color={GREEN}
                />
              </View>
              <Text style={styles.quickLabel}>Maintenance</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/announcements")}
              style={({ pressed }) => [
                styles.quickAction,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.quickIcon}>
                <Ionicons name="megaphone-outline" size={17} color={GREEN} />
              </View>
              <Text style={styles.quickLabel}>Updates</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/amenities")}
              style={({ pressed }) => [
                styles.quickAction,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.quickIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color={GREEN}
                />
              </View>
              <Text style={styles.quickLabel}>Calendar</Text>
            </Pressable>
          </View>

          <View style={styles.cardNoPadding}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: expandedLease }}
              onPress={() => setExpandedLease((value) => !value)}
              style={({ pressed }) => [
                styles.leaseHeader,
                pressed && styles.pressedLight,
              ]}
            >
              <View style={styles.leaseTitleWrap}>
                <View style={styles.largeIcon}>
                  <Ionicons name="home-outline" size={17} color={GREEN} />
                </View>

                <View style={styles.flex}>
                  <Text style={styles.sectionTitle}>Your lease</Text>
                  <Text style={styles.muted}>
                    Unit {RESIDENT.unit} · {RESIDENT.building}
                  </Text>
                </View>
              </View>

              <Ionicons
                name={expandedLease ? "chevron-up" : "chevron-down"}
                size={15}
                color={MUTED}
              />
            </Pressable>

            {expandedLease ? (
              <View style={styles.expandedContent}>
                <View style={styles.grid}>
                  <View style={styles.detailCell}>
                    <Text style={styles.muted}>Unit</Text>
                    <Text style={styles.value}>
                      {RESIDENT.unit} · {RESIDENT.building}
                    </Text>
                  </View>

                  <View style={styles.detailCell}>
                    <Text style={styles.muted}>Address</Text>
                    <Text style={styles.value}>142 Riverside Dr</Text>
                  </View>

                  <View style={styles.detailCell}>
                    <Text style={styles.muted}>Lease ends</Text>
                    <Text style={styles.value}>{RESIDENT.leaseEnd}</Text>
                  </View>

                  <View style={styles.detailCell}>
                    <Text style={styles.muted}>Monthly rent</Text>
                    <Text style={styles.value}>{fmt(BALANCE.amount)}</Text>
                  </View>
                </View>

                <View style={styles.leaseStatus}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Lease is active</Text>
                </View>
              </View>
            ) : null}
          </View>

          <View style={styles.cardNoPadding}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Documents</Text>
                <Text style={styles.muted}>
                  {DOCUMENTS.length} available documents
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => setShowDocuments((value) => !value)}
                hitSlop={8}
              >
                <Text style={styles.seeAll}>
                  {showDocuments ? "Show less" : "See all"}
                </Text>
              </Pressable>
            </View>

            {(showDocuments ? DOCUMENTS : DOCUMENTS.slice(0, 3)).map(
              (doc, i) => {
                const isOpening = openingDocument === doc.id;

                return (
                  <Pressable
                    key={doc.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${doc.title}`}
                    accessibilityHint="Opens the document"
                    disabled={isOpening}
                    onPress={() =>
                      handleOpenDocument(doc.id, doc.title, doc.url)
                    }
                    style={({ pressed }) => [
                      styles.document,
                      i > 0 && styles.borderTop,
                      pressed && styles.pressedLight,
                      isOpening && styles.documentOpening,
                    ]}
                  >
                    <View style={styles.docIcon}>
                      <Ionicons
                        name="document-text-outline"
                        size={14}
                        color={GREEN}
                      />
                    </View>

                    <View style={styles.flex}>
                      <Text style={styles.value} numberOfLines={1}>
                        {doc.title}
                      </Text>
                      <Text style={styles.muted}>
                        {doc.type} · {doc.size}
                      </Text>
                    </View>

                    <Ionicons
                      name={
                        isOpening
                          ? "ellipsis-horizontal"
                          : "download-outline"
                      }
                      size={15}
                      color={MUTED}
                    />
                  </Pressable>
                );
              },
            )}
          </View>

          <View style={styles.cardNoPadding}>
            <Text style={styles.cardEyebrow}>Community</Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/amenities")}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.pressedLight,
              ]}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color={GREEN}
                />
              </View>

              <View style={styles.flex}>
                <Text style={styles.menuLabel}>Community Calendar</Text>
                <Text style={styles.muted}>3 upcoming events</Text>
              </View>

              <Ionicons name="chevron-forward" size={14} color={MUTED} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/announcements")}
              style={({ pressed }) => [
                styles.menuItem,
                styles.borderTop,
                pressed && styles.pressedLight,
              ]}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="megaphone-outline"
                  size={15}
                  color={GREEN}
                />
              </View>

              <View style={styles.flex}>
                <Text style={styles.menuLabel}>Announcements</Text>
                <Text style={styles.muted}>
                  View building updates and notices
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={14} color={MUTED} />
            </Pressable>
          </View>

          <View style={styles.cardNoPadding}>
            <Text style={styles.cardEyebrow}>Account</Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => setModal("notifications")}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.pressedLight,
              ]}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={15}
                  color={GREEN}
                />
              </View>

              <View style={styles.flex}>
                <Text style={styles.menuLabel}>
                  Notification settings
                </Text>
                <Text style={styles.muted}>
                  {Object.values(notifications).filter(Boolean).length} of 4
                  channels on
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={14} color={MUTED} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleContactOffice}
              style={({ pressed }) => [
                styles.menuItem,
                styles.borderTop,
                pressed && styles.pressedLight,
              ]}
            >
              <View style={styles.menuIcon}>
                <Ionicons name="call-outline" size={15} color={GREEN} />
              </View>

              <View style={styles.flex}>
                <Text style={styles.menuLabel}>Contact the office</Text>
                <Text style={styles.muted}>Mon-Fri 9 am-6 pm</Text>
              </View>

              <Ionicons name="chevron-forward" size={14} color={MUTED} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setModal("support")}
              style={({ pressed }) => [
                styles.menuItem,
                styles.borderTop,
                pressed && styles.pressedLight,
              ]}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="help-circle-outline"
                  size={15}
                  color={GREEN}
                />
              </View>

              <View style={styles.flex}>
                <Text style={styles.menuLabel}>Support & FAQs</Text>
                <Text style={styles.muted}>Help center</Text>
              </View>

              <Ionicons name="chevron-forward" size={14} color={MUTED} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setModal("privacy")}
              style={({ pressed }) => [
                styles.menuItem,
                styles.borderTop,
                pressed && styles.pressedLight,
              ]}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={15}
                  color={GREEN}
                />
              </View>

              <View style={styles.flex}>
                <Text style={styles.menuLabel}>Privacy & security</Text>
                <Text style={styles.muted}>
                  Account and privacy preferences
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={14} color={MUTED} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setModal("profile")}
              style={({ pressed }) => [
                styles.menuItem,
                styles.borderTop,
                pressed && styles.pressedLight,
              ]}
            >
              <View style={styles.menuIcon}>
                <Ionicons name="person-outline" size={15} color={GREEN} />
              </View>

              <View style={styles.flex}>
                <Text style={styles.menuLabel}>Edit profile</Text>
                <Text style={styles.muted}>
                  {profile.phone} · {profile.email}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={14} color={MUTED} />
            </Pressable>
          </View>

          <Pressable
            testID="more-sign-out"
            accessibilityRole="button"
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOut,
              pressed && styles.signOutPressed,
            ]}
          >
            <Ionicons name="log-out-outline" size={15} color="#DC2626" />
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>

          <Text style={styles.version}>Resident Portal · Demo</Text>
        </View>
      </ScrollView>

      <Modal
        visible={modal === "notifications"}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.flex}>
                <Text style={styles.modalTitle}>Notifications</Text>
                <Text style={styles.modalSubtitle}>
                  Choose which updates you receive.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close notifications"
                onPress={() => setModal(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={18} color={TEXT} />
              </Pressable>
            </View>

            <NotificationRow
              icon="megaphone-outline"
              title="Announcements"
              subtitle="Building news and important notices"
              value={notifications.announcements}
              onValueChange={(value) =>
                setNotifications((current) => ({
                  ...current,
                  announcements: value,
                }))
              }
            />

            <NotificationRow
              icon="construct-outline"
              title="Maintenance"
              subtitle="Updates about your service requests"
              value={notifications.maintenance}
              onValueChange={(value) =>
                setNotifications((current) => ({
                  ...current,
                  maintenance: value,
                }))
              }
            />

            <NotificationRow
              icon="card-outline"
              title="Payments"
              subtitle="Payment reminders and confirmations"
              value={notifications.payments}
              onValueChange={(value) =>
                setNotifications((current) => ({
                  ...current,
                  payments: value,
                }))
              }
            />

            <NotificationRow
              icon="calendar-outline"
              title="Community"
              subtitle="Events and amenity updates"
              value={notifications.community}
              onValueChange={(value) =>
                setNotifications((current) => ({
                  ...current,
                  community: value,
                }))
              }
            />

            <Pressable
              onPress={() => setModal(null)}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modal === "profile"}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.flex}>
                <Text style={styles.modalTitle}>Edit profile</Text>
                <Text style={styles.modalSubtitle}>
                  Update your resident contact information.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close profile"
                onPress={() => setModal(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={18} color={TEXT} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              value={profile.name}
              onChangeText={(name) =>
                setProfile((current) => ({ ...current, name }))
              }
              placeholder="Your name"
              placeholderTextColor="#9A9D97"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              value={profile.phone}
              onChangeText={(phone) =>
                setProfile((current) => ({ ...current, phone }))
              }
              placeholder="Phone number"
              placeholderTextColor="#9A9D97"
              keyboardType="phone-pad"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              value={profile.email}
              onChangeText={(email) =>
                setProfile((current) => ({ ...current, email }))
              }
              placeholder="Email address"
              placeholderTextColor="#9A9D97"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Pressable
              onPress={handleSaveProfile}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Save changes</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modal === "privacy"}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.flex}>
                <Text style={styles.modalTitle}>Privacy & security</Text>
                <Text style={styles.modalSubtitle}>
                  Manage your account security preferences.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close privacy settings"
                onPress={() => setModal(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={18} color={TEXT} />
              </Pressable>
            </View>

            <View style={styles.securityRow}>
              <View style={styles.securityIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={17}
                  color={GREEN}
                />
              </View>

              <View style={styles.flex}>
                <Text style={styles.securityTitle}>Account security</Text>
                <Text style={styles.muted}>
                  Your resident account is protected.
                </Text>
              </View>

              <View style={styles.secureBadge}>
                <Text style={styles.secureBadgeText}>Secure</Text>
              </View>
            </View>

            <View style={styles.securityRow}>
              <View style={styles.securityIcon}>
                <Ionicons name="eye-off-outline" size={17} color={GREEN} />
              </View>

              <View style={styles.flex}>
                <Text style={styles.securityTitle}>Private information</Text>
                <Text style={styles.muted}>
                  Your lease and payment information is only visible to you.
                </Text>
              </View>
            </View>

            <View style={styles.securityRow}>
              <View style={styles.securityIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={17}
                  color={GREEN}
                />
              </View>

              <View style={styles.flex}>
                <Text style={styles.securityTitle}>Session protection</Text>
                <Text style={styles.muted}>
                  Sign out when using a shared device.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setModal(null)}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modal === "support"}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.supportModal]}>
            <View style={styles.modalHeader}>
              <View style={styles.flex}>
                <Text style={styles.modalTitle}>Support & FAQs</Text>
                <Text style={styles.modalSubtitle}>
                  Find answers to common resident questions.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close support"
                onPress={() => setModal(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={18} color={TEXT} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.faqList}
            >
              {FAQS.map((faq, index) => {
                const expanded = expandedFaq === index;

                return (
                  <View
                    key={faq.question}
                    style={[
                      styles.faqItem,
                      index > 0 && styles.borderTop,
                    ]}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded }}
                      onPress={() =>
                        setExpandedFaq(expanded ? null : index)
                      }
                      style={styles.faqQuestion}
                    >
                      <Text style={styles.faqQuestionText}>
                        {faq.question}
                      </Text>

                      <Ionicons
                        name={expanded ? "chevron-up" : "chevron-down"}
                        size={15}
                        color={MUTED}
                      />
                    </Pressable>

                    {expanded ? (
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>
                    ) : null}
                  </View>
                );
              })}

              <Pressable
                onPress={handleContactOffice}
                style={styles.contactSupport}
              >
                <Ionicons name="call-outline" size={16} color={GREEN} />

                <View style={styles.flex}>
                  <Text style={styles.contactSupportTitle}>
                    Still need help?
                  </Text>
                  <Text style={styles.muted}>
                    Contact the leasing office
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={MUTED}
                />
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function NotificationRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.notificationRow}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={15} color={GREEN} />
      </View>

      <View style={styles.flex}>
        <Text style={styles.menuLabel}>{title}</Text>
        <Text style={styles.muted}>{subtitle}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: "#D5D8D2",
          true: "rgba(30,61,47,0.35)",
        }}
        thumbColor={value ? GREEN : "#F7F7F7"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  content: {
    paddingBottom: 32,
  },

  header: {
    backgroundColor: GREEN,
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },

  headerButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  flex: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },

  sub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    marginTop: 2,
  },

  lease: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 10,
    marginTop: 2,
  },

  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },

  quickActions: {
    flexDirection: "row",
    gap: 8,
  },

  quickAction: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    paddingVertical: 11,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  quickIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "rgba(30,61,47,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  quickLabel: {
    color: TEXT,
    fontSize: 9.5,
    fontWeight: "600",
    textAlign: "center",
  },

  cardNoPadding: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
  },

  cardEyebrow: {
    color: MUTED,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },

  leaseHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  leaseTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  largeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(30,61,47,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 14,
    paddingTop: 14,
  },

  detailCell: {
    width: "50%",
    paddingRight: 8,
  },

  value: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  muted: {
    color: MUTED,
    fontSize: 10,
    marginTop: 3,
  },

  leaseStatus: {
    marginTop: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: "#F1F7F3",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#3E8B63",
  },

  statusText: {
    color: "#35684D",
    fontSize: 10,
    fontWeight: "600",
  },

  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "600",
  },

  seeAll: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "600",
  },

  document: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  documentOpening: {
    opacity: 0.55,
  },

  borderTop: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },

  docIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(30,61,47,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(30,61,47,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  menuLabel: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "500",
  },

  pressed: {
    opacity: 0.75,
  },

  pressedLight: {
    backgroundColor: "#FAF9F6",
  },

  signOut: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  signOutPressed: {
    backgroundColor: "#FDE8E8",
  },

  signOutText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
  },

  version: {
    color: "#A3A69F",
    fontSize: 9,
    textAlign: "center",
    marginTop: 2,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: "88%",
  },

  supportModal: {
    maxHeight: "82%",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
  },

  modalTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: "700",
  },

  modalSubtitle: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationRow: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  primaryButton: {
    marginTop: 16,
    backgroundColor: GREEN,
    borderRadius: 13,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },

  inputLabel: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 4,
  },

  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 13,
    color: TEXT,
    fontSize: 12,
    marginBottom: 10,
  },

  securityRow: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  securityIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "rgba(30,61,47,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  securityTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "600",
  },

  secureBadge: {
    backgroundColor: "#EAF4EE",
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  secureBadgeText: {
    color: "#35684D",
    fontSize: 9,
    fontWeight: "700",
  },

  faqList: {
    paddingBottom: 4,
  },

  faqItem: {
    backgroundColor: "#FFF",
  },

  faqQuestion: {
    paddingVertical: 15,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  faqQuestionText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },

  faqAnswer: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 17,
    paddingHorizontal: 13,
    paddingBottom: 15,
  },

  contactSupport: {
    marginTop: 12,
    padding: 13,
    backgroundColor: "#F0F5F1",
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  contactSupportTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "600",
  },
});