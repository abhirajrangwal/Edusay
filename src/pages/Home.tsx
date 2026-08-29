import '../styles/Home.css'

import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Stats from '../components/Stats'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import ProblemSolution from '../components/ProblemSolution'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <ProblemSolution />
        <CTA />
      </main>

      <Footer />
    </>
  )
}

export default Home