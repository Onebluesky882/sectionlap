import { useAppStore } from "../store/useAppStore";

export function useSection(sectionId: string) {
  const section = useAppStore((state) =>
    state.sections.find((s) => s.id === sectionId)
  );
  const currentUser = useAppStore((state) => state.currentUser);
  const booking = useAppStore((state) =>
    currentUser
      ? state.bookings.find(
          (b) => b.sectionId === sectionId && b.studentId === currentUser.id
        )
      : undefined
  );

  return { section, booking, currentUser };
}
