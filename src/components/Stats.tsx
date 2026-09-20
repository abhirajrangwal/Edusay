import { useEffect, useState } from 'react'
import Reveal from './Reveal'

interface StatProps {
  value: number
  suffix: string
  label: string
}

function Counter({ value, suffix, label }: StatProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1400
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      )

      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.floor(eased * value)

      setCount(start)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  return (
    <div className="stat">
      <strong>
        {count}
        {suffix}
      </strong>
      <span>{label}</span>
    </div>
  )
}

function Stats() {
  return (
    <section className="stats-section">
      <Reveal className="stats">
        <Counter value={150} suffix="+" label="Students" />
        <Counter value={100} suffix="+" label="Rooms" />
        <Counter value={24} suffix="/7" label="Complaint Tracking" />
        <Counter value={100} suffix="%" label="Digital Records" />
      </Reveal>
    </section>
  )
}

export default Stats