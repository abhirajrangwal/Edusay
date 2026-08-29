import { ArrowDown } from 'lucide-react'
import Reveal from './Reveal'

const steps = [
  {
    number: '01',
    title: 'Register',
    description: 'Create your student account and complete your profile.'
  },
  {
    number: '02',
    title: 'Get Your Room',
    description: 'Staff allocate a room based on availability and capacity.'
  },
  {
    number: '03',
    title: 'Manage Requests',
    description: 'Submit complaints and hostel-related requests digitally.'
  },
  {
    number: '04',
    title: 'Track Everything',
    description: 'Monitor complaints, fees and room information anytime.'
  }
]

function HowItWorks() {
  return (
    <section className="section workflow-section">
      <Reveal>
        <div className="section-heading centered">
          <p className="section-label">HOW IT WORKS</p>
          <h2>
            Simple by design.
          </h2>
          <p>
            Four simple steps turn hostel management into a seamless
            digital experience.
          </p>
        </div>
      </Reveal>

      <div className="workflow">
        {steps.map((step, index) => (
          <Reveal
            key={step.number}
            className={`workflow-step reveal-delay-${index + 1}`}
          >
            <div className="workflow-number">
              {step.number}
            </div>

            <div className="workflow-content">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>

            {index < steps.length - 1 && (
              <ArrowDown className="workflow-arrow" size={18} />
            )}
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks