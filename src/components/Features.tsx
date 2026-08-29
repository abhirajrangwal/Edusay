import {
  Building2,
  ClipboardList,
  GraduationCap,
  Wallet
} from 'lucide-react'
import Reveal from './Reveal'

const features = [
  {
    number: '01',
    icon: GraduationCap,
    title: 'Student Management',
    description:
      'Keep student profiles, academic information and hostel records organized in one place.'
  },
  {
    number: '02',
    icon: Building2,
    title: 'Room Management',
    description:
      'Manage room capacity, occupancy and allocations without complicated paperwork.'
  },
  {
    number: '03',
    icon: ClipboardList,
    title: 'Complaint Management',
    description:
      'Students can raise complaints while staff can track and resolve them efficiently.'
  },
  {
    number: '04',
    icon: Wallet,
    title: 'Fee Management',
    description:
      'Track hostel fees, payment status and due dates through a centralized system.'
  }
]

function Features() {
  return (
    <section className="section features-section" id="features">
      <Reveal>
        <div className="section-heading">
          <p className="section-label">CORE FEATURES</p>
          <h2>
            Everything your hostel
            <span> needs.</span>
          </h2>
          <p>
            Replace scattered records and manual processes with one
            connected management platform.
          </p>
        </div>
      </Reveal>

      <div className="features-grid">
        {features.map((feature, index) => {
          const Icon = feature.icon

          return (
            <Reveal
              key={feature.number}
              className={`feature-card reveal-delay-${index + 1}`}
            >
              <div className="feature-top">
                <span>{feature.number}</span>
                <Icon size={23} />
              </div>

              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>

              <div className="feature-line" />
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

export default Features