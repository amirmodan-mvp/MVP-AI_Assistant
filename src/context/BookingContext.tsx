import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const STORAGE_KEY = "@mvp_apartment_booking";

export type Booking = {
  amenityId: number;
  date: string;
  time: string;
  guests: number;
};

type BookingDetails = {
  date: string;
  time: string;
  guests: number;
};

type BookingContextType = {
  booking: Booking | null;
  loading: boolean;
  bookAmenity: (
    amenityId: number,
    details: BookingDetails
  ) => Promise<void>;
  cancelBooking: () => Promise<void>;
};

const BookingContext = createContext<BookingContextType | undefined>(
  undefined
);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadBooking = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        if (stored && mounted) {
          const parsed: Booking = JSON.parse(stored);
          setBooking(parsed);
        }
      } catch (error) {
        console.warn("Failed to load booking:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBooking();

    return () => {
      mounted = false;
    };
  }, []);

  const bookAmenity = async (
    amenityId: number,
    details: BookingDetails
  ) => {
    const nextBooking: Booking = {
      amenityId,
      date: details.date,
      time: details.time,
      guests: details.guests,
    };

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextBooking)
    );

    setBooking(nextBooking);
  };

  const cancelBooking = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setBooking(null);
  };

  const value = useMemo(
    () => ({
      booking,
      loading,
      bookAmenity,
      cancelBooking,
    }),
    [booking, loading]
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error(
      "useBookings must be used inside a BookingProvider"
    );
  }

  return context;
}