import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Login.css'
import Popup from './Popup'

const INITIAL_LOGIN = { email: '', password: '', remember: false }
const INITIAL_REGISTER = {
  fullName: '', email: '', phone: '',
  dob: '', gender: '', password: '', confirmPassword: '', terms: false,
}

export default function Login() {
  const [mode, setMode]         = useState('login')   // 'login' | 'register'
  const [login, setLogin]       = useState(INITIAL_LOGIN)
  const [register, setRegister] = useState(INITIAL_REGISTER)
  const [errors, setErrors]           = useState({})
  const [popupMessage, setPopupMessage] = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  /* ── helpers ── */
  function setL(e) {
    const { name, value, type, checked } = e.target
    setLogin(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    setErrors(p => ({ ...p, [name]: '' }))
  }

  function setR(e) {
    const { name, value, type, checked } = e.target
    setRegister(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    setErrors(p => ({ ...p, [name]: '' }))
  }

  /* ── validation ── */
  function validateLogin() {
    const e = {}
    if (!login.email)    e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(login.email)) e.email = 'Enter a valid email'
    if (!login.password) e.password = 'Password is required'
    return e
  }

  function validateRegister() {
    const e = {}
    if (!register.fullName.trim()) e.fullName = 'Full name is required'
    if (!register.email)           e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(register.email)) e.email = 'Enter a valid email'
    if (!register.phone)           e.phone    = 'Phone number is required'
    else if (!/^\+?[\d\s-]{7,15}$/.test(register.phone)) e.phone = 'Enter a valid phone number'
    if (!register.dob)             e.dob      = 'Date of birth is required'
    if (!register.gender)          e.gender   = 'Please select a gender'
    if (!register.password)        e.password = 'Password is required'
    else if (register.password.length < 8) e.password = 'Minimum 8 characters'
    if (!register.confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (register.password !== register.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!register.terms)           e.terms    = 'You must accept the terms'
    return e
  }

  async function handleLoginSubmit(e) {
    e.preventDefault()
    const errs = validateLogin()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    try {
      const res = await fetch('https://nalam-grocery.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: login.email, password: login.password }),
      })
      const data = await res.json()
      if (!res.ok) { setPopupMessage(data.error || 'Login failed'); setSubmitting(false); return }
      localStorage.setItem('token', data.token)
      // Redirect admin users to admin page
      const user = data.user
      if (user.email === 'namagirienterprise@gmail.com' || user.name?.toLowerCase() === 'nalam') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch {
      setPopupMessage('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault()
    const errs = validateRegister()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    try {
      const res = await fetch('https://nalam-grocery.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     register.fullName,
          email:    register.email,
          password: register.password,
          phone:    register.phone,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setPopupMessage(data.error || 'Registration failed'); setSubmitting(false); return }
      localStorage.setItem('token', data.token)
      navigate('/')
    } catch {
      setPopupMessage('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  function switchMode(m) {
    setMode(m)
    setErrors({})
    setPopupMessage('')
  }

  return (
    <div className="login-page">

      <Popup
        message={popupMessage}
        type="error"
        onClose={() => setPopupMessage('')}
      />
      <div className="login-brand">
        <Link to="/" className="login-logo">
          <div className="login-logo-icon">N</div>
          <span className="login-logo-text">Nalam</span>
        </Link>

        <div className="login-brand-body">
          <h1 className="login-brand-title">
            {mode === 'login' ? 'Welcome back!' : 'Join Nalam'}
          </h1>
          <p className="login-brand-sub">
            {mode === 'login'
              ? 'Sign in to access your orders, wishlist, and exclusive offers.'
              : 'Create your account and start shopping with style.'}
          </p>

          <ul className="login-perks">
            {['Free shipping on orders above ₹499',
              'Exclusive member-only deals',
              'Easy 7-day returns',
              'Track orders in real time',
            ].map(p => (
              <li key={p}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="login-brand-footer">© 2026 Nalam. All rights reserved.</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="login-form-panel">
        <div className="login-card">

          {/* Tab toggle */}
          <div className="login-tabs">
            <button
              className={`login-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >Sign In</button>
            <button
              className={`login-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >Create Account</button>
          </div>

          {/* ── LOGIN FORM ── */}
          {mode === 'login' && (
            <form className="login-form" onSubmit={handleLoginSubmit} noValidate>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className={`input-wrap ${errors.email ? 'input-error' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email" name="email"
                    placeholder="you@example.com"
                    value={login.email} onChange={setL}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className={`input-wrap ${errors.password ? 'input-error' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <input
                    type={showPass ? 'text' : 'password'} name="password"
                    placeholder="••••••••"
                    value={login.password} onChange={setL}
                    autoComplete="current-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)}>
                    {showPass
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="login-row">
                <label className="checkbox-label">
                  <input type="checkbox" name="remember" checked={login.remember} onChange={setL} />
                  <span className="checkbox-custom" />
                  Remember me
                </label>
                <button type="button" className="forgot-btn" onClick={() => navigate('/forgot-password')}>Forgot password?</button>
              </div>

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="login-switch">
                Don't have an account?{' '}
                <button type="button" className="switch-link" onClick={() => switchMode('register')}>
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {mode === 'register' && (
            <form className="login-form" onSubmit={handleRegisterSubmit} noValidate>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className={`input-wrap ${errors.fullName ? 'input-error' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    type="text" name="fullName"
                    placeholder="Rahul Sharma"
                    value={register.fullName} onChange={setR}
                    autoComplete="name"
                  />
                </div>
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className={`input-wrap ${errors.email ? 'input-error' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input
                      type="email" name="email"
                      placeholder="you@example.com"
                      value={register.email} onChange={setR}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className={`input-wrap ${errors.phone ? 'input-error' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 8.81 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6z"/>
                    </svg>
                    <input
                      type="tel" name="phone"
                      placeholder="+91 98765 43210"
                      value={register.phone} onChange={setR}
                      autoComplete="tel"
                    />
                  </div>
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <div className={`input-wrap ${errors.dob ? 'input-error' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <input
                      type="date" name="dob"
                      value={register.dob} onChange={setR}
                    />
                  </div>
                  {errors.dob && <span className="field-error">{errors.dob}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <div className={`input-wrap select-wrap ${errors.gender ? 'input-error' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="4"/><path d="M12 12v8M9 17h6"/>
                    </svg>
                    <select name="gender" value={register.gender} onChange={setR}>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not">Prefer not to say</option>
                    </select>
                  </div>
                  {errors.gender && <span className="field-error">{errors.gender}</span>}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className={`input-wrap ${errors.password ? 'input-error' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    <input
                      type={showPass ? 'text' : 'password'} name="password"
                      placeholder="Min. 8 characters"
                      value={register.password} onChange={setR}
                      autoComplete="new-password"
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)}>
                      {showPass
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className={`input-wrap ${errors.confirmPassword ? 'input-error' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    <input
                      type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                      placeholder="Repeat password"
                      value={register.confirmPassword} onChange={setR}
                      autoComplete="new-password"
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowConfirm(v => !v)}>
                      {showConfirm
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                </div>
              </div>

              <label className={`checkbox-label terms-label ${errors.terms ? 'terms-error' : ''}`}>
                <input type="checkbox" name="terms" checked={register.terms} onChange={setR} />
                <span className="checkbox-custom" />
                I agree to the{' '}
                <button type="button" className="switch-link">Terms of Service</button>
                {' '}and{' '}
                <button type="button" className="switch-link">Privacy Policy</button>
              </label>
              {errors.terms && <span className="field-error">{errors.terms}</span>}

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="login-switch">
                Already have an account?{' '}
                <button type="button" className="switch-link" onClick={() => switchMode('login')}>
                  Sign in
                </button>
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
