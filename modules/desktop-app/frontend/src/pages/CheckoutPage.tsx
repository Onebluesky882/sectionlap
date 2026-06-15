import { Link, Navigate, useParams } from "react-router-dom";
import { useSection } from "../hooks/useSection";
import { useCheckout } from "../hooks/useCheckout";

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
      <div className="page">
        <Link className="btn btn-link" to={`/sections/${section.id}`}>
          ← Back to Section
        </Link>
        <div className="detail-card">
          <h1>Checkout</h1>
          <div className="note">
            This section is full — no seats are available to book.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Link className="btn btn-link" to={`/sections/${section.id}`}>
        ← Back to Section
      </Link>
      <div className="detail-card">
        <h1>Checkout</h1>
        <div className="checkout-summary">
          <h3>{section.title}</h3>
          <p className="teacher">by {section.teacher}</p>
          <div className="checkout-line">
            <span>Section price</span>
            <span>${section.price}</span>
          </div>
          <div className="checkout-line checkout-total">
            <span>Total</span>
            <span>${section.price}</span>
          </div>
        </div>

        {paid ? (
          <div className="enrolled-banner">
            ✅ Payment simulated successfully — you're booked in!
          </div>
        ) : failed ? (
          <div>
            <div className="note">❌ Payment failed. Please try again.</div>
            <button className="btn btn-primary" onClick={retry}>
              Retry Payment
            </button>
          </div>
        ) : (
          <div className="form-actions">
            <button className="btn btn-primary" onClick={pay}>
              Pay ${section.price}
            </button>
            <button className="btn" onClick={simulateFailure}>
              Simulate Failed Payment
            </button>
          </div>
        )}
        <p className="note">
          This is a UI-only simulation. No real payment is processed.
        </p>
        {booking?.status === "pending" && (
          <p className="note">Booking status: pending payment.</p>
        )}
      </div>
    </div>
  );
}
