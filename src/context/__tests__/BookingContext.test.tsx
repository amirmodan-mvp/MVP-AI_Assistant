import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import {
  BookingProvider,
  useBookings,
} from "@/context/BookingContext";

const STORAGE_KEY = "@mvp_apartment_booking";

describe("BookingContext", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it("starts with no booking", async () => {
    const { result } = await renderHook(() => useBookings(), {
      wrapper: BookingProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.booking).toBeNull();
  });

  it("loads a persisted booking from AsyncStorage", async () => {
    const storedBooking = {
      amenityId: 1,
      date: "Tomorrow",
      time: "5:00 PM – 6:00 PM",
      guests: 2,
    };

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(storedBooking)
    );

    const { result } = await renderHook(() => useBookings(), {
      wrapper: BookingProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.booking).toEqual(storedBooking);
  });

  it("books an amenity and persists the booking", async () => {
    const { result } = await renderHook(() => useBookings(), {
      wrapper: BookingProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const booking = {
      amenityId: 2,
      date: "Today",
      time: "1:00 PM – 2:00 PM",
      guests: 3,
    };

    await act(async () => {
      await result.current.bookAmenity(booking.amenityId, {
        date: booking.date,
        time: booking.time,
        guests: booking.guests,
      });
    });

    expect(result.current.booking).toEqual(booking);

    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(booking);
  });

  it("updates an existing booking", async () => {
    const firstBooking = {
      amenityId: 1,
      date: "Today",
      time: "9:00 AM – 10:00 AM",
      guests: 2,
    };

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(firstBooking)
    );

    const { result } = await renderHook(() => useBookings(), {
      wrapper: BookingProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.booking).toEqual(firstBooking);
    });

    const updatedBooking = {
      amenityId: 3,
      date: "Tomorrow",
      time: "7:00 PM – 8:00 PM",
      guests: 4,
    };

    await act(async () => {
      await result.current.bookAmenity(updatedBooking.amenityId, {
        date: updatedBooking.date,
        time: updatedBooking.time,
        guests: updatedBooking.guests,
      });
    });

    expect(result.current.booking).toEqual(updatedBooking);

    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(updatedBooking);
  });

  it("cancels the current booking and removes it from storage", async () => {
    const booking = {
      amenityId: 1,
      date: "Tomorrow",
      time: "11:00 AM – 12:00 PM",
      guests: 2,
    };

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(booking)
    );

    const { result } = await renderHook(() => useBookings(), {
      wrapper: BookingProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.booking).toEqual(booking);
    });

    await act(async () => {
      await result.current.cancelBooking();
    });

    expect(result.current.booking).toBeNull();

    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    expect(stored).toBeNull();
  });

  it("can book again after cancelling", async () => {
    const firstBooking = {
      amenityId: 1,
      date: "Today",
      time: "9:00 AM – 10:00 AM",
      guests: 1,
    };

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(firstBooking)
    );

    const { result } = await renderHook(() => useBookings(), {
      wrapper: BookingProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.booking).toEqual(firstBooking);
    });

    await act(async () => {
      await result.current.cancelBooking();
    });

    expect(result.current.booking).toBeNull();

    const secondBooking = {
      amenityId: 2,
      date: "Tomorrow",
      time: "5:00 PM – 6:00 PM",
      guests: 3,
    };

    await act(async () => {
      await result.current.bookAmenity(secondBooking.amenityId, {
        date: secondBooking.date,
        time: secondBooking.time,
        guests: secondBooking.guests,
      });
    });

    expect(result.current.booking).toEqual(secondBooking);

    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(secondBooking);
  });

  it("throws when useBookings is used outside BookingProvider", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => { });

    expect(() => {
      renderHook(() => useBookings());
    }).toThrow("useBookings must be used inside a BookingProvider");

    consoleError.mockRestore();
  });
});
