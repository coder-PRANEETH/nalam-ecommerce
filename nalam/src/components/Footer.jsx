import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
        <Link to="/" className="link">
          <img src="/logo.png" alt="Nalam Logo" />
          <span className="log-text">Nalam</span>
        </Link>
      </div>
          <p className="footer-tagline">
இயற்கையின் தூய்மையும் பாரம்பரியத்தின் நம்பிக்கையும் சேர்ந்த நலம் உங்கள் இல்லத்திற்கு ஆரோக்கியத்தை தருகிறது.
          </p>
          
        </div>


        {/* Customer */}
        <div className="footer-col">
          <h4 className="footer-col-title">Customer</h4>
          <ul className="footer-links">
            <li><Link to="/profile">My Account</Link></li>
            <li><Link to="/cart">My Cart</Link></li>
            <li><Link to="/profile">Order History</Link></li>
            <li><Link to="/">Track Order</Link></li>
            <li><Link to="/">Returns &amp; Refunds</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h4 className="footer-col-title">Contact Us</h4>
          <ul className="footer-contact">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              14th Floor, Prestige Tech Park,<br />Whitefield, Bengaluru — 560066
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.12 2.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              +91 98765 43210
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              support@nalam.in
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Mon – Sat, 9 AM – 7 PM IST
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
     
    </footer>
  )
}
