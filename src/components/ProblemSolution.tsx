import { ArrowRight, Check, X } from 'lucide-react'
import Reveal from './Reveal'

const problems = [
  'Paper records',
  'Difficult room allocation',
  'Delayed complaint handling',
  'Difficult fee tracking'
]

const solutions = [
  'Centralized digital records',
  'Real-time room availability',
  'Trackable complaint workflow',
  'Clear fee and payment tracking'
]

function ProblemSolution() {
  return (
    <section className="section solution-section" id="about">
      <Reveal>
        <div className="section-heading">
          <p className="section-label">THE PROBLEM</p>
          <h2>
            Stop managing your hostel
            <span> the old way.</span>
          </h2>
          <p>
            EduStay transforms common hostel management problems into
            simple digital workflows.
          </p>
        </div>
      </Reveal>

      <div className="comparison">
        <Reveal className="comparison-card problem-card">
          <div className="comparison-header">
            <span className="comparison-icon danger">
              <X size={18} />
            </span>

            <h3>Traditional Management</h3>
          </div>

          <div className="comparison-list">
            {problems.map((problem) => (
              <div key={problem}>
                <X size={16} />
                <span>{problem}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="comparison-arrow">
          <ArrowRight />
        </div>

        <Reveal className="comparison-card solution-card">
          <div className="comparison-header">
            <span className="comparison-icon success">
              <Check size={18} />
            </span>

            <h3>With EduStay</h3>
          </div>

          <div className="comparison-list">
            {solutions.map((solution) => (
              <div key={solution}>
                <Check size={16} />
                <span>{solution}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default ProblemSolution