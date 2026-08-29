import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Reveal from './Reveal'

function CTA() {
  const navigate = useNavigate()

  return (
    <section className="cta-section" id="contact">
      <Reveal className="cta">
        <div className="cta-glow" />

        <p className="section-label">READY TO GET STARTED?</p>

        <h2>
          Ready to simplify
          <span> hostel management?</span>
        </h2>

        <p>
          Bring students, rooms, complaints and fees together
          in one modern platform.
        </p>

        <button className="cta-button" onClick={() => navigate('/login')}>
          Get Started
          <ArrowRight size={18} />
        </button>
      </Reveal>
    </section>
  )
}

export default CTA
