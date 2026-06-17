import { useAppStore } from "../store/useAppStore";

export function useSection(sectionId: string) {
  const section = useAppStore((s: any) => s.sections.find((x: any) => x.id === sectionId));
  const currentUser = useAppStore((s: any) => s.currentUser);
  const booking = useAppStore((s: any) =>
    s.bookings.find((b: any) => b.sectionId === sectionId && b.studentId === currentUser!.id)
  );
  return { section, booking, currentUser };
}

