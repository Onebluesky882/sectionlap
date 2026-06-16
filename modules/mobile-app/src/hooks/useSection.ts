import { useAppStore } from "../store/useAppStore";

export function useSection(sectionId: string) {
  const section = useAppStore((s) => s.sections.find((x) => x.id === sectionId));
  const currentUser = useAppStore((s) => s.currentUser);
  const booking = useAppStore((s) =>
    s.bookings.find((b) => b.sectionId === sectionId && b.studentId === currentUser.id)
  );
  return { section, booking, currentUser };
}
