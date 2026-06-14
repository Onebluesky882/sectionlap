import { Link, Navigate, useParams } from "react-router-dom";
import { useSection } from "../hooks/useSection";
import { useCheckout } from "../hooks/useCheckout";

export function CheckoutPage() {
  const { sectionId = "" } = useParams();
  const { section } = useSection(sectionId);
  const { paid, pay } = useCheckout(sectionId);

  if (!section) {
    return <Navigate to="/" replace />;
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
        ) : (
          <button className="btn btn-primary" onClick={pay}>
            Pay ${section.price}
          </button>
        )}
        <p className="note">
          This is a UI-only simulation. No real payment is processed.
        </p>
      </div>
    </div>
  );
}
