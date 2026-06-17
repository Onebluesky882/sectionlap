import { useAppStore } from "../store/useAppStore";

export function useSection(sectionId: string) {
  const section = useAppStore((s) => s.sections.find((x) => x.id === sectionId));
  const currentUser = useAppStore((s) => s.currentUser);
  const booking = useAppStore((s) =>
    currentUser
      ? s.bookings.find((b) => b.sectionId === sectionId && b.studentId === currentUser.id)
      : undefined
  );
  return { section, booking, currentUser };
}

