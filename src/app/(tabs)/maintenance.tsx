import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StatusBadge } from "@/components/StatusBadge";
import { MAINTENANCE } from "@/data/apartment";

const GREEN = "#1E3D2F";
const TEXT = "#1A1C1A";
const MUTED = "#6C706A";
const BG = "#F5F2ED";

const STORAGE_KEY = "@mvp_apartment_maintenance";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Appliance",
  "Pest",
  "Common Area",
  "Security",
  "Other",
];

type Step = "list" | "cat" | "details" | "done";
type Urgency = "normal" | "urgent";
type EntryPermission = "enter_if_out" | "present";

type MaintenanceRequest = {
  id: string;
  category: string;
  title: string;
  submitted: string;
  status: string;
  statusLabel: string;
  appt: string | null;
  note: string;
  description?: string;
  urgency?: Urgency;
  entryPermission?: EntryPermission;
};

export default function MaintenanceTab() {
  const [step, setStep] = useState<Step>("list");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("normal");
  const [entryPermission, setEntryPermission] =
    useState<EntryPermission>("enter_if_out");

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setRequests(parsed);
          return;
        }
      }

      // First launch: use the existing demo requests and persist them.
      const initialRequests = MAINTENANCE as MaintenanceRequest[];

      setRequests(initialRequests);
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(initialRequests),
      );
    } catch (error) {
      console.error("Failed to load maintenance requests:", error);

      // Fall back to the existing demo data if storage cannot be read.
      setRequests(MAINTENANCE as MaintenanceRequest[]);
    } finally {
      setLoading(false);
    }
  }

  async function saveRequests(nextRequests: MaintenanceRequest[]) {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextRequests),
    );

    setRequests(nextRequests);
  }

  function resetForm() {
    setCategory("");
    setDescription("");
    setUrgency("normal");
    setEntryPermission("enter_if_out");
  }

  function generateRequestId() {
    const numbers = requests
      .map((request) => {
        const match = request.id.match(/^MR-(\d+)$/);
        return match ? Number(match[1]) : 0;
      })
      .filter((number) => number > 0);

    const highestExistingId = numbers.length
      ? Math.max(...numbers)
      : 1000;

    return `MR-${highestExistingId + 1}`;
  }

  function getSubmittedDate() {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  async function submitRequest() {
    if (!category || !description.trim() || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const id = generateRequestId();

      const newRequest: MaintenanceRequest = {
        id,
        category,
        title: description.trim().split("\n")[0].slice(0, 60),
        submitted: getSubmittedDate(),
        status: "submitted",
        statusLabel: "Submitted",
        appt: null,
        note:
          urgency === "urgent"
            ? "Marked as urgent. The maintenance team will review this request promptly."
            : "The maintenance team will review your request and follow up with next steps.",
        description: description.trim(),
        urgency,
        entryPermission,
      };

      const nextRequests = [newRequest, ...requests];

      await saveRequests(nextRequests);

      setSubmittedRequestId(id);
      setStep("done");
    } catch (error) {
      console.error("Failed to save maintenance request:", error);
    } finally {
      setSubmitting(false);
    }
  }

  function startNewRequest() {
    resetForm();
    setStep("cat");
  }

  function finishSubmission() {
    resetForm();
    setSubmittedRequestId("");
    setStep("list");
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading maintenance…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (step === "done") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.success}>
            <Ionicons name="checkmark" size={28} color="#059669" />
          </View>

          <Text style={styles.doneTitle}>Request submitted</Text>

          <Text style={styles.doneBody}>
            Your request has been sent to the maintenance team. You'll receive
            a confirmation shortly.
          </Text>

          <Text style={styles.requestId}>{submittedRequestId}</Text>

          <Pressable onPress={finishSubmission} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (step === "cat") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Pressable
              onPress={() => setStep("list")}
              style={styles.back}
            >
              <Ionicons
                name="chevron-back"
                size={15}
                color="rgba(255,255,255,0.6)"
              />
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <Text style={styles.headerTitle}>New Request</Text>

            <Progress step={1} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What type of issue?</Text>

            <View style={styles.grid}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => {
                    setCategory(c);
                    setStep("details");
                  }}
                  style={[
                    styles.category,
                    category === c && styles.categorySelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === c && styles.categorySelectedText,
                    ]}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.emergency}>
              <Ionicons
                name="alert-circle-outline"
                size={15}
                color="#EF4444"
              />

              <Text style={styles.emergencyText}>
                Gas leaks, fire, active flooding, or safety emergencies — call
                911 or the emergency line immediately. Do not submit a ticket.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === "details") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable
              onPress={() => setStep("cat")}
              style={styles.back}
            >
              <Ionicons
                name="chevron-back"
                size={15}
                color="rgba(255,255,255,0.6)"
              />
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <Text style={styles.headerTitle}>New Request</Text>

            <Progress step={2} />
          </View>

          <View style={styles.section}>
            <View style={styles.categorySummary}>
              <Text style={styles.muted}>Category</Text>
              <Text style={styles.categorySelectedText}>{category}</Text>
            </View>

            <Text style={styles.label}>Describe the issue</Text>

            <TextInput
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              placeholder="Location, symptoms, when it started…"
              placeholderTextColor="rgba(108,112,106,0.6)"
              style={styles.textarea}
              textAlignVertical="top"
              maxLength={500}
            />

            <Text style={styles.characterCount}>
              {description.length}/500
            </Text>

            <Text style={styles.label}>Urgency</Text>

            <View style={styles.optionRow}>
              <Pressable
                onPress={() => setUrgency("normal")}
                style={[
                  styles.option,
                  urgency === "normal" && styles.optionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    urgency === "normal" && styles.optionSelectedText,
                  ]}
                >
                  Normal
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setUrgency("urgent")}
                style={[
                  styles.option,
                  urgency === "urgent" && styles.optionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    urgency === "urgent" && styles.optionSelectedText,
                  ]}
                >
                  Urgent
                </Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Entry permission</Text>

            <View style={styles.optionRow}>
              <Pressable
                onPress={() => setEntryPermission("enter_if_out")}
                style={[
                  styles.option,
                  entryPermission === "enter_if_out" &&
                    styles.optionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    entryPermission === "enter_if_out" &&
                      styles.optionSelectedText,
                  ]}
                >
                  Enter if I'm out
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setEntryPermission("present")}
                style={[
                  styles.option,
                  entryPermission === "present" && styles.optionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    entryPermission === "present" &&
                      styles.optionSelectedText,
                  ]}
                >
                  I'll be present
                </Text>
              </Pressable>
            </View>

            {urgency === "urgent" ? (
              <View style={styles.urgentNotice}>
                <Ionicons
                  name="alert-circle-outline"
                  size={15}
                  color="#B45309"
                />
                <Text style={styles.urgentNoticeText}>
                  Urgent requests are reviewed promptly, but this form is not
                  for emergencies.
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={submitRequest}
              disabled={!description.trim() || submitting}
              style={[
                styles.fullButton,
                (!description.trim() || submitting) &&
                  styles.fullButtonDisabled,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {submitting ? "Submitting…" : "Submit request"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const open = requests.filter(
    (request) => request.status !== "completed",
  ).length;

  const completed = requests.filter(
    (request) => request.status === "completed",
  ).length;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Maintenance</Text>
          <Text style={styles.headerSub}>
            {open} open · {completed} completed
          </Text>
        </View>

        <View style={styles.section}>
          <Pressable
            onPress={startNewRequest}
            style={styles.newRequest}
          >
            <Ionicons name="add" size={16} color={GREEN} />
            <Text style={styles.newRequestText}>New request</Text>
          </Pressable>

          {requests.map((req) => (
            <View key={req.id} style={styles.card}>
              <View style={styles.cardInner}>
                <View style={styles.requestHeader}>
                  <View style={styles.flex}>
                    <View style={styles.meta}>
                      <Text style={styles.mono}>{req.id}</Text>
                      <Text style={styles.muted}>·</Text>
                      <Text style={styles.muted}>
                        {req.category}
                      </Text>
                    </View>

                    <Text style={styles.requestTitle}>
                      {req.title}
                    </Text>
                  </View>

                  <StatusBadge
                    status={req.status}
                    label={req.statusLabel}
                  />
                </View>

                {req.appt ? (
                  <View style={styles.meta}>
                    <Ionicons
                      name="time-outline"
                      size={11}
                      color={MUTED}
                    />
                    <Text style={styles.muted}>{req.appt}</Text>
                  </View>
                ) : null}

                {req.urgency === "urgent" ? (
                  <View style={styles.urgentBadge}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={11}
                      color="#B45309"
                    />
                    <Text style={styles.urgentBadgeText}>Urgent</Text>
                  </View>
                ) : null}

                <Text style={styles.note}>{req.note}</Text>

                {req.description ? (
                  <Text style={styles.description}>
                    {req.description}
                  </Text>
                ) : null}

                <Text style={styles.submitted}>
                  Submitted {req.submitted}
                </Text>
              </View>

              {req.status !== "completed" ? (
                <Pressable
                  onPress={() => {
                    // Message functionality can be connected to the
                    // existing Messages flow later.
                  }}
                  style={styles.messageBar}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={12}
                    color={GREEN}
                  />
                  <Text style={styles.messageText}>
                    Message the team
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ))}

          <View style={styles.emergencyLarge}>
            <Ionicons
              name="alert-circle-outline"
              size={16}
              color="#EF4444"
            />

            <View style={styles.flex}>
              <Text style={styles.emergencyTitle}>Emergency?</Text>

              <Text style={styles.emergencyText}>
                Gas leaks, fire, flooding, or safety hazards: call emergency
                services first.
              </Text>

              <Pressable style={styles.phone}>
                <Ionicons
                  name="call-outline"
                  size={12}
                  color="#B91C1C"
                />
                <Text style={styles.phoneText}>
                  (212) 555-0911 after-hours
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Progress({ step }: { step: 1 | 2 }) {
  return (
    <View style={styles.progress}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[
            styles.progressBar,
            i <= step - 1
              ? styles.progressActive
              : styles.progressInactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  content: {
    paddingBottom: 24,
  },

  header: {
    backgroundColor: GREEN,
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 20,
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
  },

  headerSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    marginTop: 2,
  },

  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 10,
  },

  backText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },

  progress: {
    flexDirection: "row",
    gap: 4,
    marginTop: 12,
  },

  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },

  progressActive: {
    backgroundColor: "#FFF",
  },

  progressInactive: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },

  sectionTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "700",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  category: {
    width: "48.5%",
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "#FFF",
  },

  categorySelected: {
    borderColor: GREEN,
    backgroundColor: "rgba(30,61,47,0.05)",
  },

  categoryText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "500",
  },

  categorySelectedText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "600",
  },

  emergency: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    gap: 9,
  },

  emergencyText: {
    color: "#B91C1C",
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },

  categorySummary: {
    backgroundColor: "#E4E8E3",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },

  textarea: {
    minHeight: 100,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 12,
    padding: 12,
    color: TEXT,
    fontSize: 13,
    textAlignVertical: "top",
    marginTop: -4,
  },

  characterCount: {
    color: "rgba(108,112,106,0.6)",
    fontSize: 9,
    textAlign: "right",
    marginTop: -8,
  },

  optionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: -4,
  },

  option: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "#FFF",
    alignItems: "center",
  },

  optionSelected: {
    borderColor: GREEN,
    backgroundColor: "rgba(30,61,47,0.05)",
  },

  optionText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "500",
  },

  optionSelectedText: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "600",
  },

  urgentNotice: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    padding: 11,
    flexDirection: "row",
    gap: 8,
  },

  urgentNoticeText: {
    color: "#92400E",
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },

  fullButton: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },

  fullButtonDisabled: {
    opacity: 0.45,
  },

  primaryButton: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginTop: 24,
  },

  primaryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  success: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  doneTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: "700",
  },

  doneBody: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  requestId: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
    letterSpacing: 1,
  },

  newRequest: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(30,61,47,0.25)",
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(30,61,47,0.05)",
  },

  newRequestText: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
  },

  cardInner: {
    padding: 16,
  },

  requestHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },

  flex: {
    flex: 1,
    minWidth: 0,
  },

  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  mono: {
    color: MUTED,
    fontSize: 10,
    fontVariant: ["tabular-nums"],
  },

  requestTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 3,
  },

  note: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },

  description: {
    color: TEXT,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 7,
  },

  submitted: {
    color: "rgba(108,112,106,0.6)",
    fontSize: 10,
    marginTop: 7,
  },

  urgentBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginTop: 7,
  },

  urgentBadgeText: {
    color: "#B45309",
    fontSize: 9,
    fontWeight: "700",
  },

  messageBar: {
    backgroundColor: "#F5F2ED",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  messageText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "600",
  },

  emergencyLarge: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 10,
  },

  emergencyTitle: {
    color: "#991B1B",
    fontSize: 12,
    fontWeight: "700",
  },

  phone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },

  phoneText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "700",
  },

  muted: {
    color: MUTED,
    fontSize: 11,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: MUTED,
    fontSize: 13,
  },
});
