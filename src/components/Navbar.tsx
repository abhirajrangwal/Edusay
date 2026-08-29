import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  return (
    <nav className="navbar">
      <a
        href="#home"
        className="navbar-logo"
        onClick={(e) => {
          if (window.location.pathname !== '/') {
            e.preventDefault()
            navigate('/')
          }
        }}
      >
        EduStay<span>.</span>
      </a>

      <div className="navbar-links">
        <a href="#home">Home</a>
        <a href="#features">Features</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>

      <button className="navbar-login" onClick={() => navigate('/login')}>
        Login
        <ArrowRight size={16} />
      </button>
    </nav>
  )
}

export default Navbar
