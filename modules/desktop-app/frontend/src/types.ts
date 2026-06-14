export interface Section {
  id: string;
  title: string;
  description: string;
  price: number;
  teacher: string;
  category: string;
  durationMinutes: number;
}

export interface BookingRecord {
  sectionId: string;
  status: "pending" | "paid";
  bookedAt: string;
}
