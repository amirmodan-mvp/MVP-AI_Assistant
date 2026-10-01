export type Resident = {
  name: string;
  unit: string;
  building: string;
  address: string;
  leaseEnd: string;
};

export type Transaction = {
  id: number;
  date: string;
  desc: string;
  amount: number;
  credit: boolean;
};

export type MaintenanceRequest = {
  id: string;
  category: string;
  title: string;
  submitted: string;
  status: "scheduled" | "in_progress" | "completed" | "submitted" | "acknowledged";
  statusLabel: string;
  appt: string | null;
  note: string;
};

export type AmenityBooking = {
  date: string;
  time: string;
  guests: number;
};

export type Amenity = {
  id: number;
  name: string;
  type: string;
  capacity: number;
  hours: string;
  fee: string;
  img: string;
  booking: AmenityBooking | null;
  desc: string;
};

export type Announcement = {
  id: number;
  severity: "urgent" | "important" | "routine";
  date: string;
  title: string;
  body: string;
};

export type DocumentItem = {
  id: number;
  title: string;
  date: string;
  type: string;
  size: string;
};
