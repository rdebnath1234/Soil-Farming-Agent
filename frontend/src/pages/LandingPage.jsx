import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-page olayard-theme">
      <section className="olayard-shell reveal-block">
        <header className="olayard-nav">
          <p className="olayard-brand">Soil Agent</p>
          <nav>
            <a href="#features">Features</a>
            <a href="#insights">Insights</a>
            <a href="#sustainability">Sustainability</a>
            <a href="#reports">Reports</a>
          </nav>
          <div className="olayard-nav-actions">
            <Link className="link-btn secondary" to="/login">
              Login
            </Link>
            <Link className="link-btn primary" to="/register">
              Get Started
            </Link>
          </div>
        </header>

        <div className="olayard-hero">
          <article className="olayard-copy">
            <p className="eyebrow">Ai Powered Agriculture</p>
            <h1>Tomorrow Where AI Nurtures</h1>
            <p>
              Combine field intelligence, soil signals, and climate forecasting in
              one calm interface built for modern farms.
            </p>
            <div className="landing-actions">
              <Link className="link-btn primary" to="/register">
                Start Free Trial
              </Link>
              <Link className="link-btn ghost" to="/login">
                Open Dashboard
              </Link>
            </div>
            <div className="olayard-metrics">
              <div>
                <strong>+22%</strong>
                <span>Yield increase</span>
              </div>
              <div>
                <strong>19 min</strong>
                <span>Faster decisions</span>
              </div>
              <div>
                <strong>98%</strong>
                <span>Soil profile coverage</span>
              </div>
            </div>
          </article>

          <article className="olayard-visual" id="insights">
            <div className="olayard-floating olayard-weather">
              <p>Climate IQ</p>
              <strong>28C</strong>
              <span>Humidity 64%</span>
            </div>

            <div className="olayard-panel">
              <div className="olayard-panel-top">
                <p>Data Meets Growth</p>
                <button type="button">Live</button>
              </div>
              <div className="olayard-grid">
                <div className="olayard-card">
                  <h4>Soil Intelligence</h4>
                  <p>Balanced nutrients in North Field</p>
                </div>
                <div className="olayard-card">
                  <h4>Carbon View</h4>
                  <p>Emission trend down by 11%</p>
                </div>
                <div className="olayard-map">
                  <span>Golden Harvest Zone</span>
                </div>
                <div className="olayard-card">
                  <h4>Resource Use</h4>
                  <p>Water demand optimized this week</p>
                </div>
              </div>
            </div>

            <div className="olayard-floating olayard-ai">
              <p>AI Insight</p>
              <strong>Planting window optimal in 2 days</strong>
            </div>
          </article>
        </div>
      </section>

      <section className="landing-grid" id="features">
        <article className="card landing-tile reveal-block" style={{ '--i': 1 }}>
          <h3>Soil Knowledge Base</h3>
          <p>
            Browse deep soil profiles with pH ranges, nutrient patterns, crop fit,
            and irrigation guidance.
          </p>
        </article>

        <article className="card landing-tile reveal-block" style={{ '--i': 2 }}>
          <h3>Distributor Network</h3>
          <p>
            View trusted seed and crop distributors with contacts, address data,
            and available seed catalog details.
          </p>
        </article>

        <article className="card landing-tile reveal-block" style={{ '--i': 3 }} id="reports">
          <h3 id="sustainability">Sustainability Reports</h3>
          <p>
            Track water, energy, and carbon metrics with readable trends and
            benchmark-ready reports.
          </p>
        </article>
      </section>
    </div>
  );
}
