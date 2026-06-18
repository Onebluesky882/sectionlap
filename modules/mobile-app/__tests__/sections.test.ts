import { listSections, createSection } from "../src/services/sectionService";
import { login } from "../src/services/authService";
import { setToken, clearToken } from "../src/lib/api";

const ts = Date.now();
const TEACHER = {
  name: `Section Teacher ${ts}`,
  email: `section_teacher_${ts}@test.com`,
  password: "Test1234!",
  role: "teacher" as const,
};

let teacherToken: string;

import { signup } from "../src/services/authService";

describe("Mobile — Sections service", () => {
  beforeAll(async () => {
    const session = await signup(TEACHER.name, TEACHER.email, TEACHER.password, TEACHER.role);
    teacherToken = session.token;
  });

  afterEach(async () => {
    await clearToken();
  });

  describe("listSections", () => {
    it("returns array of sections (public, no auth)", async () => {
      const sections = await listSections();
      expect(Array.isArray(sections)).toBe(true);
    });

    it("each section has required fields", async () => {
      const sections = await listSections();
      if (sections.length === 0) return;
      const s = sections[0];
      expect(s).toHaveProperty("id");
      expect(s).toHaveProperty("title");
      expect(s).toHaveProperty("price");
      expect(s).toHaveProperty("capacity");
    });
  });

  describe("createSection (teacher only)", () => {
    beforeEach(async () => {
      await setToken(teacherToken);
    });

    it("teacher can create a new section", async () => {
      const section = await createSection({
        title: `Test Section ${ts}`,
        description: "Created by Playwright auto-test",
        price: 299,
        category: "Testing",
        durationMinutes: 60,
        capacity: 20,
      });
      expect(section.id).toBeTruthy();
      expect(section.title).toBe(`Test Section ${ts}`);
      expect(section.teacherId).toBeTruthy();
    });
  });
});
