import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useSection } from "../hooks/useSection";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/ui/button";
import { ConfirmModal } from "../components/ConfirmModal";

export function SectionDetailPage() {
  const { sectionId = "" } = useParams();
  const { section, booking } = useSection(sectionId);
  const bookings = useAppStore((state) => state.bookings);
  const navigate = useNavigate();

  if (!section) {
    return <Navigate to="/" replace />;
  }

  const activeCount = bookings.filter(
    (b) => b.sectionId === section.id && b.status !== "failed"
  ).length;
  const isFull = !booking && activeCount >= section.capacity;

  const handleBookClick = async () => {
    const confirmed = await ConfirmModal.call({
      title: "Enrollment Booking Confirmation",
      message: `Would you like to proceed to checkout and book "${section.title}" for $${section.price}?`,
      confirmText: "Proceed to Checkout",
      cancelText: "Cancel",
    });
    if (confirmed) {
      navigate(`/sections/${section.id}/checkout`);
    }
  };

  return (
    <div>
      <Button variant="link" asChild className="mb-4 px-0">
        <Link to="/">← Back to Sections</Link>
      </Button>
      <div className="bg-card border border-border rounded-lg p-8 text-left max-w-2xl flex flex-col gap-2">
        <div className="text-xs uppercase tracking-wide text-primary">{section.category}</div>
        <h1 className="text-2xl font-semibold">{section.title}</h1>
        <p className="text-muted-foreground">Taught by {section.teacher}</p>
        <p className="text-muted-foreground text-sm">{section.description}</p>
        <ul className="list-none p-0 text-muted-foreground space-y-1">
          <li>Duration: {section.durationMinutes} minutes</li>
          <li>Price: ${section.price}</li>
          <li>
            Seats: {activeCount}/{section.capacity}
          </li>
        </ul>

        {booking?.status === "paid" ? (
          <div className="mt-4 p-4 rounded-md bg-accent text-accent-foreground flex flex-col gap-3">
            ✅ Enrolled — content unlock coming in a later stage.
            <div>
              <Button onClick={() => navigate(`/sections/${section.id}/live-class`)}>
                Join Live Class
              </Button>
            </div>
          </div>
        ) : isFull ? (
          <div className="text-muted-foreground text-sm mt-4">This section is full.</div>
        ) : (
          <Button onClick={handleBookClick}>
            Book this Section
          </Button>
        )}
      </div>
    </div>
  );
}
