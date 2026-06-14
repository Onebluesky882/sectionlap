import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useSection } from "../hooks/useSection";

export function SectionDetailPage() {
  const { sectionId = "" } = useParams();
  const { section, booking } = useSection(sectionId);
  const navigate = useNavigate();

  if (!section) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page">
      <Link className="btn btn-link" to="/">
        ← Back to Sections
      </Link>
      <div className="detail-card">
        <div className="card-category">{section.category}</div>
        <h1>{section.title}</h1>
        <p className="teacher">Taught by {section.teacher}</p>
        <p className="card-description">{section.description}</p>
        <ul className="detail-meta">
          <li>Duration: {section.durationMinutes} minutes</li>
          <li>Price: ${section.price}</li>
        </ul>

        {booking?.status === "paid" ? (
          <div className="enrolled-banner">
            ✅ Enrolled — content unlock and live class access coming in a
            later stage.
          </div>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/sections/${section.id}/checkout`)}
          >
            Book this Section
          </button>
        )}
      </div>
    </div>
  );
}
