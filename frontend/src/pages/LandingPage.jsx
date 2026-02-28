import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-page">
      <section className="landing-hero card reveal-block">
        <p className="eyebrow">Smart Agriculture Suite</p>
        <h1>Soil Farming Agent</h1>
        <p>
          A full-stack platform for soil intelligence, distributor discovery, and
          field-ready decision support.
        </p>
        <div className="landing-actions">
          <Link className="link-btn primary" to="/login">
            Login
          </Link>
          <Link className="link-btn secondary" to="/register">
            Create Account
          </Link>
        </div>
      </section>

      <section className="landing-grid">
        <article className="card landing-tile reveal-block" style={{ '--i': 1 }}>
          <h3>Soil Knowledge Base</h3>
          <p>
            Browse soil profiles with pH ranges, nutrient patterns, crop fit, and
            irrigation guidance.
          </p>
        </article>

        <article className="card landing-tile reveal-block" style={{ '--i': 2 }}>
          <h3>Distributor Network</h3>
          <p>
            View trusted seed and crop distributors with contacts, address data,
            and available seed catalog details.
          </p>
        </article>

        <article className="card landing-tile reveal-block" style={{ '--i': 3 }}>
          <h3>Admin Operations</h3>
          <p>
            Manage records with secure role-based access, edit tools, activity
            trails, and searchable paginated datasets.
          </p>
        </article>
      </section>
    </div>
  );
}
