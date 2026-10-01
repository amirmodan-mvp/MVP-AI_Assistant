import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BookingProvider, useBookings } from "@/context/BookingContext";
import { AMENITIES } from "@/data/apartment";

const GREEN = "#1E3D2F";
const TEXT = "#1A1C1A";
const MUTED = "#6C706A";
const BG = "#F5F2ED";

const DATE_OPTIONS = [
  "Today",
  "Tomorrow",
  "Saturday, Sep 20",
  "Sunday, Sep 21",
];

const TIME_OPTIONS = [
  "9:00 AM - 10:00 AM",
  "11:00 AM - 12:00 PM",
  "1:00 PM - 2:00 PM",
  "3:00 PM - 4:00 PM",
  "5:00 PM - 6:00 PM",
  "7:00 PM - 8:00 PM",
];

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6];

function AmenitiesContent() {
  const { booking, loading, bookAmenity, cancelBooking } = useBookings();

  const [selectedAmenityId, setSelectedAmenityId] =
    useState<number | null>(null);

  const [selectedDate, setSelectedDate] = useState(DATE_OPTIONS[1]);
  const [selectedTime, setSelectedTime] = useState(TIME_OPTIONS[4]);
  const [selectedGuests, setSelectedGuests] = useState(1);

  const [confirmationVisible, setConfirmationVisible] =
    useState(false);

  const [canceling, setCanceling] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const bookedAmenity = booking
    ? AMENITIES.find((a) => a.id === booking.amenityId)
    : null;

  const availableAmenities = AMENITIES.filter(
    (a) => a.id !== booking?.amenityId
  );

  const selectedAmenity = selectedAmenityId
    ? AMENITIES.find((a) => a.id === selectedAmenityId)
    : null;

  const openBookingSheet = (amenityId: number) => {
    setSelectedAmenityId(amenityId);

    setSelectedDate(DATE_OPTIONS[1]);
    setSelectedTime(TIME_OPTIONS[4]);
    setSelectedGuests(1);
  };

  const closeBookingSheet = () => {
    if (bookingInProgress) {
      return;
    }

    setSelectedAmenityId(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedAmenityId) {
      return;
    }

    try {
      setBookingInProgress(true);

      await bookAmenity(selectedAmenityId, {
        date: selectedDate,
        time: selectedTime,
        guests: selectedGuests,
      });

      setSelectedAmenityId(null);
      setConfirmationVisible(true);
    } catch (error) {
      console.warn("Failed to book amenity:", error);
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) {
      return;
    }

    try {
      setCanceling(true);
      await cancelBooking();
      setConfirmationVisible(false);
    } catch (error) {
      console.warn("Failed to cancel booking:", error);
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>
            Loading amenities...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Amenities</Text>

          <Text style={styles.headerSub}>
            Browse and book shared spaces
          </Text>
        </View>

        <View style={styles.section}>
          {bookedAmenity && booking ? (
            <View>
              <Text style={styles.eyebrow}>Your booking</Text>

              <View style={styles.card}>
                <View style={styles.imageWrap}>
                  <Image
                    source={{ uri: bookedAmenity.img }}
                    style={styles.image}
                  />

                  <View style={styles.imageShade} />

                  <View style={styles.imageText}>
                    <View style={styles.bookingTextWrap}>
                      <Text style={styles.bookingName}>
                        {bookedAmenity.name}
                      </Text>

                      <Text style={styles.bookingSub}>
                        {booking.date} · {booking.time}
                      </Text>
                    </View>

                    <Text style={styles.confirmed}>
                      Confirmed
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingBottom}>
                  <Text style={styles.muted}>
                    {booking.guests}{" "}
                    {booking.guests === 1 ? "guest" : "guests"} ·{" "}
                    {bookedAmenity.hours} · {bookedAmenity.fee}
                  </Text>

                  <Pressable
                    onPress={handleCancel}
                    disabled={canceling}
                    hitSlop={8}
                  >
                    <Text
                      style={[
                        styles.cancel,
                        canceling && styles.disabledText,
                      ]}
                    >
                      {canceling ? "Canceling..." : "Cancel"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}

          {confirmationVisible && booking && bookedAmenity ? (
            <View style={styles.confirmation}>
              <Ionicons
                name="checkmark-circle"
                size={17}
                color="#059669"
              />

              <Text style={styles.confirmationText}>
                Booking confirmed for {bookedAmenity.name}.
              </Text>

              <Pressable
                onPress={() => setConfirmationVisible(false)}
                hitSlop={8}
              >
                <Text style={styles.x}>×</Text>
              </Pressable>
            </View>
          ) : null}

          <View>
            <Text style={styles.eyebrow}>Available</Text>

            {availableAmenities.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color={MUTED}
                />

                <Text style={styles.emptyTitle}>
                  You have a booking
                </Text>

                <Text style={styles.emptyText}>
                  Cancel your current booking to reserve another
                  shared space.
                </Text>
              </View>
            ) : (
              availableAmenities.map((a) => (
                <View
                  key={a.id}
                  style={[styles.card, styles.availableCard]}
                >
                  <View style={styles.availableImageWrap}>
                    <Image
                      source={{ uri: a.img }}
                      style={styles.image}
                    />

                    <Text style={styles.type}>{a.type}</Text>
                  </View>

                  <View style={styles.availableInfo}>
                    <View style={styles.flex}>
                      <Text style={styles.amenityName}>
                        {a.name}
                      </Text>

                      <Text style={styles.muted}>
                        {a.hours} · up to {a.capacity}
                      </Text>

                      <Text style={styles.muted}>
                        {a.desc}
                      </Text>
                    </View>

                    <View style={styles.right}>
                      <Text style={styles.fee}>{a.fee}</Text>

                      <Pressable
                        onPress={() => openBookingSheet(a.id)}
                        style={styles.book}
                      >
                        <Text style={styles.bookText}>Book</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Booking sheet */}
      <Modal
        visible={selectedAmenityId !== null}
        transparent
        animationType="slide"
        onRequestClose={closeBookingSheet}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeBookingSheet}
          />

          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetTitle}>
                  Book {selectedAmenity?.name ?? "Amenity"}
                </Text>

                <Text style={styles.sheetSub}>
                  Choose your date, time, and guests
                </Text>
              </View>

              <Pressable
                onPress={closeBookingSheet}
                style={styles.closeButton}
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={MUTED}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetContent}
            >
              <Text style={styles.optionLabel}>Date</Text>

              <View style={styles.optionGrid}>
                {DATE_OPTIONS.map((date) => {
                  const selected = selectedDate === date;

                  return (
                    <Pressable
                      key={date}
                      onPress={() => setSelectedDate(date)}
                      style={[
                        styles.option,
                        selected && styles.optionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.optionTextSelected,
                        ]}
                      >
                        {date}
                      </Text>

                      {selected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={GREEN}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.optionLabel}>Time</Text>

              <View style={styles.timeGrid}>
                {TIME_OPTIONS.map((time) => {
                  const selected = selectedTime === time;

                  return (
                    <Pressable
                      key={time}
                      onPress={() => setSelectedTime(time)}
                      style={[
                        styles.timeOption,
                        selected && styles.optionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          selected && styles.optionTextSelected,
                        ]}
                      >
                        {time}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.optionLabel}>Guests</Text>

              <View style={styles.guestRow}>
                {GUEST_OPTIONS.map((guests) => {
                  const selected = selectedGuests === guests;

                  return (
                    <Pressable
                      key={guests}
                      onPress={() => setSelectedGuests(guests)}
                      style={[
                        styles.guestOption,
                        selected && styles.guestSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.guestText,
                          selected && styles.guestTextSelected,
                        ]}
                      >
                        {guests}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {selectedAmenity ? (
                <View style={styles.summary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      Amenity
                    </Text>

                    <Text style={styles.summaryValue}>
                      {selectedAmenity.name}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Date</Text>

                    <Text style={styles.summaryValue}>
                      {selectedDate}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Time</Text>

                    <Text style={styles.summaryValue}>
                      {selectedTime}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      Guests
                    </Text>

                    <Text style={styles.summaryValue}>
                      {selectedGuests}
                    </Text>
                  </View>

                  <View style={styles.summaryDivider} />

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      Booking fee
                    </Text>

                    <Text style={styles.summaryFee}>
                      {selectedAmenity.fee}
                    </Text>
                  </View>
                </View>
              ) : null}

              <Pressable
                onPress={handleConfirmBooking}
                disabled={bookingInProgress}
                style={[
                  styles.confirmButton,
                  bookingInProgress &&
                    styles.confirmButtonDisabled,
                ]}
              >
                <Text style={styles.confirmButtonText}>
                  {bookingInProgress
                    ? "Confirming..."
                    : "Confirm Booking"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function AmenitiesTab() {
  return (
    <BookingProvider>
      <AmenitiesContent />
    </BookingProvider>
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

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  loadingText: {
    color: MUTED,
    fontSize: 12,
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

  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },

  eyebrow: {
    color: MUTED,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
  },

  imageWrap: {
    height: 128,
    position: "relative",
    backgroundColor: "#E2E8F0",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imageShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.28)",
  },

  imageText: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 10,
  },

  bookingTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  bookingName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },

  bookingSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    marginTop: 2,
  },

  confirmed: {
    backgroundColor: "#10B981",
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },

  bookingBottom: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  cancel: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "600",
  },

  disabledText: {
    opacity: 0.5,
  },

  confirmation: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  confirmationText: {
    color: "#065F46",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },

  x: {
    color: "#059669",
    fontSize: 18,
    lineHeight: 18,
  },

  availableCard: {
    marginBottom: 12,
  },

  availableImageWrap: {
    height: 112,
    backgroundColor: "#E2E8F0",
    position: "relative",
  },

  type: {
    position: "absolute",
    right: 8,
    top: 8,
    color: "#FFF",
    backgroundColor: "rgba(0,0,0,0.45)",
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },

  availableInfo: {
    padding: 12,
    flexDirection: "row",
    gap: 10,
  },

  amenityName: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "600",
  },

  muted: {
    color: MUTED,
    fontSize: 11,
    marginTop: 3,
    flexShrink: 1,
  },

  flex: {
    flex: 1,
    minWidth: 0,
  },

  right: {
    alignItems: "flex-end",
    marginLeft: 8,
  },

  fee: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "700",
  },

  book: {
    backgroundColor: GREEN,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 6,
  },

  bookText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },

  bookDisabled: {
    opacity: 0.45,
  },

  emptyCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    padding: 20,
    alignItems: "center",
  },

  emptyTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },

  emptyText: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 260,
  },

  /* Booking sheet */

  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
    paddingTop: 10,
  },

  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#D6D8D3",
    alignSelf: "center",
    marginBottom: 14,
  },

  sheetHeader: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  sheetTitleWrap: {
    flex: 1,
  },

  sheetTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "700",
  },

  sheetSub: {
    color: MUTED,
    fontSize: 11,
    marginTop: 3,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F2F2EF",
    alignItems: "center",
    justifyContent: "center",
  },

  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 30,
  },

  optionLabel: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 9,
    marginTop: 4,
  },

  optionGrid: {
    gap: 8,
    marginBottom: 18,
  },

  option: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E2E4DF",
    borderRadius: 11,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionSelected: {
    borderColor: GREEN,
    backgroundColor: "#F0F5F2",
  },

  optionText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "500",
  },

  optionTextSelected: {
    color: GREEN,
    fontWeight: "700",
  },

  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },

  timeOption: {
    width: "48%",
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#E2E4DF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  timeText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },

  guestRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },

  guestOption: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E4DF",
    alignItems: "center",
    justifyContent: "center",
  },

  guestSelected: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  guestText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "600",
  },

  guestTextSelected: {
    color: "#FFF",
  },

  summary: {
    backgroundColor: "#F7F6F2",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },

  summaryLabel: {
    color: MUTED,
    fontSize: 11,
  },

  summaryValue: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1,
  },

  summaryFee: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "700",
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#E3E3DE",
    marginVertical: 5,
  },

  confirmButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  confirmButtonDisabled: {
    opacity: 0.6,
  },

  confirmButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
});