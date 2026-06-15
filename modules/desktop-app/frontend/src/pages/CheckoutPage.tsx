import { Link, Navigate, useParams } from "react-router-dom";
import { useSection } from "../hooks/useSection";
import { useCheckout } from "../hooks/useCheckout";
import { Button } from "../components/ui/button";

export function CheckoutPage() {
  const { sectionId = "" } = useParams();
  const { section } = useSection(sectionId);
  const { booking, error, paid, failed, pay, simulateFailure, retry } =
    useCheckout(sectionId);

  if (!section) {
    return <Navigate to="/" replace />;
  }

  if (error === "CAPACITY_FULL") {
    return (
      <div>
        <Button variant="link" asChild className="mb-4 px-0">
          <Link to={`/sections/${section.id}`}>← Back to Section</Link>
        </Button>
        <div className="bg-card border border-border rounded-lg p-8 text-left max-w-2xl">
          <h1 className="text-2xl font-semibold">Checkout</h1>
          <div className="text-muted-foreground text-sm mt-4">
            This section is full — no seats are available to book.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Button variant="link" asChild className="mb-4 px-0">
        <Link to={`/sections/${section.id}`}>← Back to Section</Link>
      </Button>
      <div className="bg-card border border-border rounded-lg p-8 text-left max-w-2xl">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mt-4">{section.title}</h3>
          <p className="text-muted-foreground">by {section.teacher}</p>
          <div className="flex justify-between py-1.5 border-t border-border mt-2">
            <span>Section price</span>
            <span>${section.price}</span>
          </div>
          <div className="flex justify-between py-1.5 border-t border-border font-bold">
            <span>Total</span>
            <span>${section.price}</span>
          </div>
        </div>

        {paid ? (
          <div className="mt-4 p-4 rounded-md bg-accent text-accent-foreground flex flex-col gap-3">
            ✅ Payment simulated successfully — you're booked in!
          </div>
        ) : failed ? (
          <div>
            <div className="text-muted-foreground text-sm mt-4">❌ Payment failed. Please try again.</div>
            <Button className="mt-2" onClick={retry}>
              Retry Payment
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button onClick={pay}>Pay ${section.price}</Button>
            <Button variant="outline" onClick={simulateFailure}>
              Simulate Failed Payment
            </Button>
          </div>
        )}
        <p className="text-muted-foreground text-sm mt-4">
          This is a UI-only simulation. No real payment is processed.
        </p>
        {booking?.status === "pending" && (
          <p className="text-muted-foreground text-sm mt-4">Booking status: pending payment.</p>
        )}
      </div>
    </div>
  );
}
