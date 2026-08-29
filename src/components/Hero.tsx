import { ArrowRight, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Hero() {
  const navigate = useNavigate()

  const exploreFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <p className="hero-eyebrow">SMART HOSTEL MANAGEMENT</p>

        <h1>
          Hostel Management,
          <span> Reimagined.</span>
        </h1>

        <p className="hero-description">
          A smarter way to manage students, rooms, complaints and hostel fees
          — all from one powerful platform.
        </p>

        <div className="hero-actions">
          <button className="hero-primary" onClick={() => navigate('/login')}>
            Get Started
            <ArrowRight size={17} />
          </button>

          <button className="hero-secondary" onClick={exploreFeatures}>
            <Play size={15} />
            Explore Features
          </button>
        </div>

        <div className="hero-trust">
          <span className="trust-dot" />
          Built for modern educational institutions
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />

        <div className="hero-grid">
          <div className="grid-core">
            <div className="core-glow" />
            <div className="core-card">
              <span>EDUSTAY</span>
              <strong>01</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
