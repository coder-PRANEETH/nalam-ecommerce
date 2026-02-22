import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  if (!token) {
    return (
      <>
        <Navbar />
        <div className="navbar-offset" />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
            width: '64px',
            height: '64px',
            marginBottom: '1rem',
            color: '#999',
          }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <h2 style={{ fontSize: '24px', marginBottom: '0.5rem', color: '#333' }}>
            Please Log In
          </h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '2rem', maxWidth: '400px' }}>
            You need to be logged in to access this page. Sign in to your account or create a new one.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#fff',
              backgroundColor: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#000'}
          >
            Go to Login
          </button>
        </div>
        <Footer />
      </>
    )
  }

  return children
}
