function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <a href="#home" className="navbar-logo">
          EduStay<span>.</span>
        </a>

        <p>
          Smarter hostel management for modern educational institutions.
        </p>
      </div>

      <div className="footer-links">
        <a href="#home">Home</a>
        <a href="#features">Features</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>

      <div className="footer-contact">
        <p>
          <strong>Email:</strong>{' '}
          <a href="abhirajrangwal01@gmail.com">
            abhirajrangwal01@gmail.com
          </a>
        </p>

        <p>
          <strong>Mobile:</strong>{' '}
          <a href="Mob:+918432412007">
            +91 84324 12007
          </a>
        </p>
      </div>

      <div className="footer-bottom">
        © 2026 EduStay Portal. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer