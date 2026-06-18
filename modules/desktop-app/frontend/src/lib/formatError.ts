const ERROR_MAP: Record<string, string> = {
  "the string did not match the expected pattern": "Please check your email and password format.",
  "invalid email": "Please enter a valid email address.",
  "email already registered": "An account with this email already exists. Try logging in instead.",
  "email already exists": "An account with this email already exists. Try logging in instead.",
  "email already in use": "An account with this email already exists. Try logging in instead.",
  "user already exists": "An account with this email already exists. Try logging in instead.",
  "password length invalid": "Password must be at least 8 characters long.",
  "invalid credentials": "Incorrect email or password. Please try again.",
  "invalid password": "Incorrect email or password. Please try again.",
  "unauthorized": "You are not authorized to perform this action.",
  "not found": "The requested resource was not found.",
  "capacity full": "This section is fully booked.",
  "already booked": "You have already booked this section.",
  "network error": "Could not connect to the server. Please check your connection.",
  "failed to fetch": "Could not connect to the server. Please check your connection.",
};

export function formatError(err: unknown, fallback?: string): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
      ? err
      : "Unknown error";

  const lower = raw.toLowerCase();
  for (const [key, friendly] of Object.entries(ERROR_MAP)) {
    if (lower.includes(key)) return friendly;
  }

  return fallback ?? "Something went wrong. Please try again.";
}
