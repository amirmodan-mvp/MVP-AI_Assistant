import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BALANCE, RESIDENT, TRANSACTIONS, fmt } from "@/data/apartment";
import type { Transaction } from "@/types/apartment";

type ViewState = "summary" | "checkout" | "done";

type PayState = {
  balance: number;
  autopay: boolean;
  transactions: Transaction[];
};

const STORAGE_KEY = "@mvp-apartment/pay";

const GREEN = "#1E3D2F";
const TEXT = "#1A1C1A";
const MUTED = "#6C706A";
const BG = "#F5F2ED";

export default function PayTab() {
  const [view, setView] = useState<ViewState>("summary");
  const [balance, setBalance] = useState(BALANCE.amount);
  const [autopay, setAutopay] = useState(true);
  const [transactions, setTransactions] =
    useState<Transaction[]>(TRANSACTIONS);
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentState();
  }, []);

  const loadPaymentState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed: PayState = JSON.parse(stored);

        setBalance(
          typeof parsed.balance === "number"
            ? parsed.balance
            : BALANCE.amount,
        );

        setAutopay(
          typeof parsed.autopay === "boolean" ? parsed.autopay : true,
        );

        if (Array.isArray(parsed.transactions)) {
          setTransactions(parsed.transactions);
        }
      }
    } catch (error) {
      console.warn("Failed to load payment state:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePaymentState = async (
    nextBalance: number,
    nextAutopay: boolean,
    nextTransactions: Transaction[],
  ) => {
    try {
      const state: PayState = {
        balance: nextBalance,
        autopay: nextAutopay,
        transactions: nextTransactions,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));

      return true;
    } catch (error) {
      console.warn("Failed to save payment state:", error);

      return false;
    }
  };

  const handleAutopayToggle = async () => {
    const nextAutopay = !autopay;

    setAutopay(nextAutopay);

    await savePaymentState(balance, nextAutopay, transactions);
  };

  const handlePay = () => {
    if (balance <= 0) {
      return;
    }

    setView("checkout");
  };

  const handleConfirmPayment = async () => {
    if (balance <= 0) {
      return;
    }

    const amount = balance;

    const newTransaction: Transaction = {
      id: Date.now(),
      desc: "August 2025 rent",
      date: "Today",
      amount,
      credit: false,
    };

    const nextTransactions = [
      newTransaction,
      ...transactions,
    ];

    setPaidAmount(amount);
    setBalance(0);
    setTransactions(nextTransactions);

    await savePaymentState(0, autopay, nextTransactions);

    setView("done");
  };

  const handleResetDemo = async () => {
    const initialTransactions = TRANSACTIONS.map((transaction) => ({
      ...transaction,
    }));

    const initialBalance = BALANCE.amount;
    const initialAutopay = true;

    // Reset the UI immediately.
    setBalance(initialBalance);
    setAutopay(initialAutopay);
    setTransactions(initialTransactions);
    setPaidAmount(0);
    setView("summary");

    // Persist the original demo state.
    await savePaymentState(
      initialBalance,
      initialAutopay,
      initialTransactions,
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <Ionicons name="card-outline" size={28} color={GREEN} />

          <Text style={styles.loadingText}>
            Loading payments…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (view === "done") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.successIcon}>
            <Ionicons
              name="checkmark-circle"
              size={34}
              color="#059669"
            />
          </View>

          <Text style={styles.doneTitle}>
            Payment submitted
          </Text>

          <Text style={styles.doneBody}>
            {fmt(paidAmount)} will process in 1–2 business days. A receipt
            was sent to your email.
          </Text>

          <View style={styles.receiptSummary}>
            <View style={styles.row}>
              <Text style={styles.muted}>Amount paid</Text>

              <Text style={styles.label}>
                {fmt(paidAmount)}
              </Text>
            </View>

            <View style={[styles.row, styles.receiptRow]}>
              <Text style={styles.muted}>
                Payment method
              </Text>

              <Text style={styles.label}>
                ••••4521
              </Text>
            </View>

            <View style={[styles.row, styles.receiptRow]}>
              <Text style={styles.muted}>
                Status
              </Text>

              <Text style={styles.greenText}>
                Processing
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => setView("summary")}
            style={styles.button}
            accessibilityRole="button"
            accessibilityLabel="Done"
          >
            <Text style={styles.buttonText}>
              Done
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (view === "checkout") {
    return (
      <SafeAreaView
        style={styles.safe}
        edges={["top"]}
      >
        <ScrollView
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <Pressable
              onPress={() => setView("summary")}
              style={styles.back}
              accessibilityRole="button"
              accessibilityLabel="Go back to payment summary"
            >
              <Ionicons
                name="chevron-back"
                size={15}
                color="rgba(255,255,255,0.6)"
              />

              <Text style={styles.backText}>
                Back
              </Text>
            </Pressable>

            <Text style={styles.headerTitle}>
              Confirm payment
            </Text>

            <Text style={styles.headerSub}>
              {RESIDENT.building} · Unit {RESIDENT.unit}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.eyebrow}>
                Amount
              </Text>

              <View style={styles.row}>
                <View>
                  <Text style={styles.label}>
                    August 2025 rent
                  </Text>

                  <Text style={styles.muted}>
                    Balance due
                  </Text>
                </View>

                <Text style={styles.total}>
                  {fmt(balance)}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.eyebrow}>
                Payment method
              </Text>

              <Pressable
                onPress={() =>
                  alert(
                    "Chase Sapphire ••••4521 is the default payment method for this demo.",
                  )
                }
                style={styles.method}
                accessibilityRole="button"
                accessibilityLabel="View payment method"
              >
                <View style={styles.visa}>
                  <Text style={styles.visaText}>
                    VISA
                  </Text>
                </View>

                <View style={styles.methodInfo}>
                  <Text style={styles.label}>
                    Chase Sapphire ••••4521
                  </Text>

                  <Text style={styles.muted}>
                    Debit · No processing fee
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={MUTED}
                />
              </Pressable>
            </View>

            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.muted}>
                  Rent
                </Text>

                <Text style={styles.label}>
                  {fmt(balance)}
                </Text>
              </View>

              <View style={[styles.row, styles.feeRow]}>
                <Text style={styles.muted}>
                  Processing fee
                </Text>

                <Text
                  style={[
                    styles.label,
                    styles.greenText,
                  ]}
                >
                  $0.00
                </Text>
              </View>

              <View
                style={[
                  styles.row,
                  styles.totalRow,
                ]}
              >
                <Text style={styles.totalLabel}>
                  Total
                </Text>

                <Text style={styles.total}>
                  {fmt(balance)}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleConfirmPayment}
              style={styles.fullButton}
              accessibilityRole="button"
              accessibilityLabel={`Confirm and pay ${fmt(balance)}`}
            >
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color="#FFF"
              />

              <Text style={styles.fullButtonText}>
                Confirm & pay {fmt(balance)}
              </Text>
            </Pressable>

            <Text style={styles.security}>
              Secured by Stripe. Card details are never stored on our
              servers.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Payment Center
          </Text>

          <Text style={styles.headerSub}>
            {RESIDENT.building} · Unit {RESIDENT.unit}
          </Text>

          <View style={styles.balanceBox}>
            {balance > 0 ? (
              <>
                <Text style={styles.balanceEyebrow}>
                  Balance due
                </Text>

                <Text style={styles.balance}>
                  {fmt(balance)}
                </Text>

                <Text style={styles.balanceDue}>
                  Due {BALANCE.dueDate}
                </Text>

                <Pressable
                  onPress={handlePay}
                  style={styles.lightButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Pay ${fmt(balance)}`}
                >
                  <Ionicons
                    name="card-outline"
                    size={15}
                    color={GREEN}
                  />

                  <Text style={styles.lightButtonText}>
                    Pay {fmt(balance)}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.paidBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color="#6EE7B7"
                  />

                  <Text style={styles.paidBadgeText}>
                    PAID
                  </Text>
                </View>

                <Text style={styles.balance}>
                  $0.00
                </Text>

                <Text style={styles.balanceDue}>
                  Your current balance is paid
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.autopayInfo}>
                <Text style={styles.label}>
                  Autopay
                </Text>

                <Text style={styles.muted}>
                  Chase ••••4521 · 1st of each month
                </Text>
              </View>

              <Switch
                value={autopay}
                onValueChange={handleAutopayToggle}
                trackColor={{
                  false: "#D1D5DB",
                  true: "#86EFAC",
                }}
                thumbColor={
                  autopay ? "#059669" : "#F8FAFC"
                }
                ios_backgroundColor="#D1D5DB"
                accessibilityLabel="Autopay"
              />
            </View>
          </View>

          <View style={styles.cardNoPadding}>
            <View style={styles.historyHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Transaction history
                </Text>

                <Text style={styles.historySub}>
                  {transactions.length}{" "}
                  {transactions.length === 1
                    ? "transaction"
                    : "transactions"}
                </Text>
              </View>
            </View>

            {transactions.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons
                  name="receipt-outline"
                  size={24}
                  color="#94A3B8"
                />

                <Text style={styles.emptyTitle}>
                  No transactions yet
                </Text>

                <Text style={styles.emptyBody}>
                  Your payment activity will appear here.
                </Text>
              </View>
            ) : (
              transactions.map((tx, i) => (
                <View
                  key={tx.id}
                  style={[
                    styles.transaction,
                    i > 0 && styles.borderTop,
                  ]}
                >
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.receipt,
                        tx.credit && styles.receiptCredit,
                      ]}
                    >
                      <Ionicons
                        name="receipt-outline"
                        size={14}
                        color={
                          tx.credit
                            ? "#059669"
                            : "#94A3B8"
                        }
                      />
                    </View>

                    <View style={styles.transactionText}>
                      <Text style={styles.label}>
                        {tx.desc}
                      </Text>

                      <Text style={styles.date}>
                        {tx.date}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.txAmount,
                      tx.credit && styles.greenText,
                    ]}
                  >
                    {tx.credit ? "+" : "−"}
                    {fmt(tx.amount)}
                  </Text>
                </View>
              ))
            )}
          </View>

          <Pressable
            onPress={handleResetDemo}
            style={styles.resetButton}
            accessibilityRole="button"
            accessibilityLabel="Reset payment demo"
          >
            <Ionicons
              name="refresh-outline"
              size={14}
              color={MUTED}
            />

            <Text style={styles.resetText}>
              Reset payment demo
            </Text>
          </Pressable>
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

  content: {
    paddingBottom: 30,
  },

  header: {
    backgroundColor: GREEN,
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 22,
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

  balanceBox: {
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
  },

  balanceEyebrow: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  balance: {
    color: "#FFF",
    fontSize: 34,
    fontWeight: "700",
    marginTop: 4,
  },

  balanceDue: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 5,
  },

  lightButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 14,
  },

  lightButtonText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "700",
  },

  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },

  paidBadgeText: {
    color: "#6EE7B7",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    padding: 16,
  },

  cardNoPadding: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
  },

  eyebrow: {
    color: MUTED,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  rowSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  label: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "500",
  },

  muted: {
    color: MUTED,
    fontSize: 11,
    marginTop: 3,
  },

  total: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "700",
  },

  method: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  methodInfo: {
    flex: 1,
  },

  visa: {
    width: 40,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#1A1F6C",
    alignItems: "center",
    justifyContent: "center",
  },

  visaText: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "700",
  },

  greenText: {
    color: "#059669",
    fontWeight: "600",
  },

  feeRow: {
    marginTop: 10,
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    marginTop: 10,
    paddingTop: 10,
  },

  totalLabel: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "700",
  },

  fullButton: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  fullButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },

  security: {
    color: MUTED,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 12,
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

  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  center: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
  },

  doneTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },

  doneBody: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  receiptSummary: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },

  receiptRow: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    marginTop: 10,
    paddingTop: 10,
  },

  button: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginTop: 24,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  historyHeader: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },

  sectionTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "600",
  },

  historySub: {
    color: MUTED,
    fontSize: 10,
    marginTop: 2,
  },

  transaction: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  transactionText: {
    marginLeft: 10,
    flex: 1,
  },

  borderTop: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },

  receipt: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  receiptCredit: {
    backgroundColor: "#ECFDF5",
  },

  date: {
    color: MUTED,
    fontSize: 10,
    marginTop: 2,
  },

  txAmount: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 10,
  },

  autopayInfo: {
    flex: 1,
  },

  emptyHistory: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },

  emptyTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },

  emptyBody: {
    color: MUTED,
    fontSize: 11,
    marginTop: 3,
    textAlign: "center",
  },

  resetButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 2,
  },

  resetText: {
    color: MUTED,
    fontSize: 11,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
  },

  loadingText: {
    color: MUTED,
    fontSize: 12,
    marginTop: 8,
  },
});
