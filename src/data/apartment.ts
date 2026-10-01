import type {
  Amenity,
  Announcement,
  MaintenanceRequest,
  Resident,
  Transaction
} from "@/types/apartment";

export const RESIDENT: Resident = {
  name: "Jordan Mercer",
  unit: "4B",
  building: "The Meridian",
  address: "142 Riverside Drive, New York, NY",
  leaseEnd: "Aug 31, 2025",
};

export const BALANCE = {
  amount: 2450,
  dueDate: "Aug 1, 2025",
  autopay: true,
};

export const TRANSACTIONS: Transaction[] = [
  { id: 1, date: "Jul 1", desc: "Rent — July 2025", amount: 2450, credit: false },
  { id: 2, date: "Jun 1", desc: "Rent — June 2025", amount: 2450, credit: false },
  { id: 3, date: "May 29", desc: "Late fee reversal", amount: 50, credit: true },
  { id: 4, date: "May 1", desc: "Rent — May 2025", amount: 2450, credit: false },
  { id: 5, date: "Apr 1", desc: "Rent — April 2025", amount: 2450, credit: false },
];

export const MAINTENANCE: MaintenanceRequest[] = [
  {
    id: "MR-1042",
    category: "Plumbing",
    title: "Kitchen faucet dripping",
    submitted: "Jul 28",
    status: "scheduled",
    statusLabel: "Scheduled",
    appt: "Tue Aug 6, 10-12 pm",
    note: "Tech will call 30 min before arrival.",
  },
  {
    id: "MR-1038",
    category: "HVAC",
    title: "AC not cooling below 76°F",
    submitted: "Jul 15",
    status: "completed",
    statusLabel: "Completed",
    appt: null,
    note: "Refrigerant topped up. Issue resolved.",
  },
];

export const AMENITIES: Amenity[] = [
  {
    id: 1,
    name: "Rooftop Terrace",
    type: "Outdoor",
    capacity: 20,
    hours: "8 am-10 pm",
    fee: "Free",
    img: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&h=400&fit=crop&auto=format",
    booking: { date: "Sat Aug 10", time: "2:00-4:00 PM", guests: 4 },
    desc: "Panoramic city views, grill area, and ambient lighting.",
  },
  {
    id: 2,
    name: "Fitness Center",
    type: "Indoor",
    capacity: 12,
    hours: "5 am-11 pm",
    fee: "Free",
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=400&fit=crop&auto=format",
    booking: null,
    desc: "Cardio machines, free weights, and a stretching zone.",
  },
  {
    id: 3,
    name: "Conference Room A",
    type: "Indoor",
    capacity: 8,
    hours: "7 am-9 pm",
    fee: "$25 / hr",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop&auto=format",
    booking: null,
    desc: "AV setup, high-speed WiFi, whiteboard.",
  },
  {
    id: 4,
    name: "Guest Suite",
    type: "Suite",
    capacity: 2,
    hours: "Check-in 3 pm",
    fee: "$75 / night",
    img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=400&fit=crop&auto=format",
    booking: null,
    desc: "Fully furnished studio for visiting guests.",
  },
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    severity: "urgent",
    date: "Aug 7",
    title: "Water shutoff — Aug 9",
    body: "Scheduled pipe maintenance. Floors 3-6 affected from 9-11 am.",
  },
  {
    id: 2,
    severity: "important",
    date: "Aug 6",
    title: "Pool closed Thu & Fri",
    body: "Annual safety inspection. Reopens Saturday at 8 am.",
  },
  {
    id: 3,
    severity: "routine",
    date: "Aug 5",
    title: "Resident BBQ — Aug 15",
    body: "Rooftop, 5-8 pm. Food and drinks provided. RSVP by Aug 12.",
  },
];
export const DOCUMENTS = [
  {
    id: "lease-agreement",
    title: "Lease Agreement",
    type: "PDF",
    size: "2.4 MB",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "community-rules",
    title: "Community Rules & Policies",
    type: "PDF",
    size: "1.1 MB",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "move-in-checklist",
    title: "Move-In Checklist",
    type: "PDF",
    size: "684 KB",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "renters-insurance",
    title: "Renter's Insurance Requirements",
    type: "PDF",
    size: "512 KB",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "parking-policy",
    title: "Parking & Guest Parking Policy",
    type: "PDF",
    size: "728 KB",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "amenity-rules",
    title: "Amenity Rules & Guidelines",
    type: "PDF",
    size: "906 KB",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
];

export function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}
