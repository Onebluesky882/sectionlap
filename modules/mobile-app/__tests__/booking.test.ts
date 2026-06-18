import { signup, login } from "../src/services/authService";
import { listSections, createSection } from "../src/services/sectionService";
import { createBooking, listBookings, payBooking, cancelBooking } from "../src/services/bookingService";
import { setToken, clearToken } from "../src/lib/api";

const ts = Date.now();
const STUDENT = { name: `Booking Student ${ts}`, email: `booking_stu_${ts}@test.com`, password: "Test1234!", role: "student" as const };
const TEACHER = { name: `Booking Teacher ${ts}`, email: `booking_tch_${ts}@test.com`, password: "Test1234!", role: "teacher" as const };

let studentToken: string;
let sectionId: string;

describe("Mobile — Booking service", () => {
  beforeAll(async () => {
    // Setup: teacher creates a section, student account exists
    const teacherSession = await signup(TEACHER.name, TEACHER.email, TEACHER.password, TEACHER.role);
    await setToken(teacherSession.token);
    const section = await createSection({
      title: `Booking Test Section ${ts}`,
      description: "For booking tests",
      price: 99,
      category: "Test",
      durationMinutes: 30,
      capacity: 10,
    });
    sectionId = section.id;

    const studentSession = await signup(STUDENT.name, STUDENT.email, STUDENT.password, STUDENT.role);
    studentToken = studentSession.token;
    await clearToken();
  });

  beforeEach(async () => {
    await setToken(studentToken);
  });

  afterEach(async () => {
    await clearToken();
  });

  describe("createBooking", () => {
    it("student can book a section", async () => {
      const result = await createBooking(sectionId);
      expect(result.error).toBeNull();
      expect(result.booking?.sectionId).toBe(sectionId);
      expect(result.booking?.status).toBe("pending");
    });

    it("double-booking returns ALREADY_BOOKED", async () => {
      const result = await createBooking(sectionId);
      expect(result.error).toBe("ALREADY_BOOKED");
    });
  });

  describe("listBookings", () => {
    it("student can list own bookings", async () => {
      const bookings = await listBookings();
      expect(Array.isArray(bookings)).toBe(true);
      expect(bookings.length).toBeGreaterThan(0);
      expect(bookings.some((b) => b.sectionId === sectionId)).toBe(true);
    });
  });

  describe("payBooking", () => {
    it("student can pay a pending booking", async () => {
      const bookings = await listBookings();
      const pending = bookings.find((b) => b.sectionId === sectionId && b.status === "pending");
      if (!pending) return;
      const paid = await payBooking(pending.id);
      expect(paid.status).toBe("paid");
    });
  });
});
