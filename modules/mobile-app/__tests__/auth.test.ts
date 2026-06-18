import { login, signup, logout, getMe } from "../src/services/authService";
import { setToken, clearToken, getCachedToken } from "../src/lib/api";

const ts = Date.now();
const STUDENT = { name: `Mobile Student ${ts}`, email: `mobile_student_${ts}@test.com`, password: "Test1234!", role: "student" as const };
const TEACHER = { name: `Mobile Teacher ${ts}`, email: `mobile_teacher_${ts}@test.com`, password: "Test1234!", role: "teacher" as const };

describe("Mobile — Auth service", () => {
  afterEach(async () => {
    await clearToken();
  });

  describe("signup", () => {
    it("student signup returns token + user with student role", async () => {
      const session = await signup(STUDENT.name, STUDENT.email, STUDENT.password, STUDENT.role);
      expect(session.token).toBeTruthy();
      expect(session.user.role).toBe("student");
      expect(session.user.email).toBe(STUDENT.email);
    });

    it("teacher signup returns token + user with teacher role", async () => {
      const session = await signup(TEACHER.name, TEACHER.email, TEACHER.password, TEACHER.role);
      expect(session.token).toBeTruthy();
      expect(session.user.role).toBe("teacher");
    });

    it("duplicate email throws", async () => {
      await expect(
        signup(STUDENT.name, STUDENT.email, STUDENT.password, STUDENT.role)
      ).rejects.toThrow();
    });
  });

  describe("login", () => {
    it("valid credentials return token + user", async () => {
      const session = await login(STUDENT.email, STUDENT.password);
      expect(session.token).toBeTruthy();
      expect(session.user.email).toBe(STUDENT.email);
    });

    it("wrong password throws", async () => {
      await expect(login(STUDENT.email, "wrongpassword")).rejects.toThrow();
    });

    it("unknown email throws", async () => {
      await expect(login("nobody@nowhere.com", "password")).rejects.toThrow();
    });
  });

  describe("session", () => {
    it("getMe returns user when token is valid", async () => {
      const session = await login(STUDENT.email, STUDENT.password);
      await setToken(session.token);
      const me = await getMe();
      expect(me?.email).toBe(STUDENT.email);
    });

    it("getMe returns null after logout", async () => {
      const session = await login(STUDENT.email, STUDENT.password);
      await setToken(session.token);
      await logout();
      await clearToken();
      const me = await getMe();
      expect(me).toBeFalsy();
    });

    it("token is stored in cache after setToken", async () => {
      const session = await login(STUDENT.email, STUDENT.password);
      await setToken(session.token);
      expect(getCachedToken()).toBe(session.token);
    });
  });
});
