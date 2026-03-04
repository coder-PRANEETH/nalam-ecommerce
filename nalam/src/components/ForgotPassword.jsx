import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ForgotPassword.css'
import Popup from './Popup'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)          // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetToken, setResetToken] = useState('')

  const [loading, setLoading] = useState(false)
  const [popupMessage, setPopupMessage] = useState('')
  const [popupType, setPopupType] = useState('error')
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const navigate = useNavigate()

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  /* ── Step 1: Send OTP ── */
  async function handleSendOTP(e) {
    e.preventDefault()
    setErrors({})

    if (!email) {
      setErrors({ email: 'Email is required' })
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Enter a valid email' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('https://nalam-grocery.onrender.com/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPopupMessage(data.error || 'Failed to send OTP')
        setPopupType('error')
        setLoading(false)
        return
      }
      setPopupMessage('OTP sent to your email. Check your inbox.')
      setPopupType('success')
      setStep(2)
      setLoading(false)
    } catch {
      setPopupMessage('Network error. Please try again.')
      setPopupType('error')
      setLoading(false)
    }
  }

  /* ── Step 2: Verify OTP ── */
  async function handleVerifyOTP(e) {
    e.preventDefault()
    setErrors({})

    if (!otp) {
      setErrors({ otp: 'OTP is required' })
      return
    }
    if (otp.length !== 4) {
      setErrors({ otp: 'OTP must be 4 digits' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('https://nalam-grocery.onrender.com/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPopupMessage(data.error || 'Failed to verify OTP')
        setPopupType('error')
        setLoading(false)
        return
      }
      setResetToken(data.resetToken)
      setPopupMessage('OTP verified! Now set your new password.')
      setPopupType('success')
      setStep(3)
      setLoading(false)
    } catch {
      setPopupMessage('Network error. Please try again.')
      setPopupType('error')
      setLoading(false)
    }
  }

  /* ── Step 3: Reset Password ── */
  async function handleResetPassword(e) {
    e.preventDefault()
    setErrors({})

    const err = {}
    if (!newPassword) err.newPassword = 'Password is required'
    else if (newPassword.length < 8) err.newPassword = 'Password must be at least 8 characters'

    if (!confirmPassword) err.confirmPassword = 'Please confirm your password'
    else if (newPassword !== confirmPassword) err.confirmPassword = 'Passwords do not match'

    if (Object.keys(err).length) {
      setErrors(err)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('https://nalam-grocery.onrender.com/auth/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPopupMessage(data.error || 'Failed to reset password')
        setPopupType('error')
        setLoading(false)
        return
      }
      setPopupMessage('Password reset successfully! Redirecting to login...')
      setPopupType('success')
      setTimeout(() => navigate('/login'), 2000)
    } catch {
      setPopupMessage('Network error. Please try again.')
      setPopupType('error')
      setLoading(false)
    }
  }

  function goBack() {
    if (step === 1) {
      navigate('/login')
    } else if (step === 2) {
      setStep(1)
      setOtp('')
      setErrors({})
    } else if (step === 3) {
      setStep(2)
      setNewPassword('')
      setConfirmPassword('')
      setResetToken('')
      setErrors({})
    }
  }

  return (
    <div className="forgot-password-page">
      <Popup
        message={popupMessage}
        type={popupType}
        onClose={() => setPopupMessage('')}
      />

      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <button type="button" className="back-btn" onClick={goBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <h1 className="forgot-title">Reset Password</h1>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span>1</span>
          </div>
          <div className={`step-line ${step > 1 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span>2</span>
          </div>
          <div className={`step-line ${step > 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span>3</span>
          </div>
        </div>

        <div className="step-labels">
          <span className={`step-label ${step === 1 ? 'active' : ''}`}>Email</span>
          <span className={`step-label ${step === 2 ? 'active' : ''}`}>Verify OTP</span>
          <span className={`step-label ${step === 3 ? 'active' : ''}`}>New Password</span>
        </div>

        {/* ── STEP 1: Email ── */}
        {step === 1 && (
          <form className="forgot-form" onSubmit={handleSendOTP} noValidate>
            <p className="step-description">Enter your registered email to receive an OTP</p>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className={`input-wrap ${errors.email ? 'input-error' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors(p => ({ ...p, email: '' }))
                  }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <p className="forgot-help">
              Check your email for a 4-digit code. It expires in 5 minutes.
            </p>
          </form>
        )}

        {/* ── STEP 2: Verify OTP ── */}
        {step === 2 && (
          <form className="forgot-form" onSubmit={handleVerifyOTP} noValidate>
            <p className="step-description">Enter the 4-digit code sent to your email</p>

            <div className="form-group">
              <label className="form-label">OTP Code</label>
              <div className={`input-wrap input-otp ${errors.otp ? 'input-error' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="14" rx="2" ry="2"/>
                  <line x1="7" y1="15" x2="7" y2="15.01"/>
                  <line x1="12" y1="15" x2="12" y2="15.01"/>
                  <line x1="17" y1="15" x2="17" y2="15.01"/>
                </svg>
                <input
                  type="text"
                  maxLength="4"
                  inputMode="numeric"
                  placeholder="0000"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    setOtp(val)
                    setErrors(p => ({ ...p, otp: '' }))
                  }}
                />
              </div>
              {errors.otp && <span className="field-error">{errors.otp}</span>}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <p className="forgot-help">
              Didn't receive the code?{' '}
              <button type="button" className="switch-link" onClick={() => setStep(1)}>
                Try with a different email
              </button>
            </p>
          </form>
        )}

        {/* ── STEP 3: New Password ── */}
        {step === 3 && (
          <form className="forgot-form" onSubmit={handleResetPassword} noValidate>
            <p className="step-description">Create a new password for your account</p>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className={`input-wrap ${errors.newPassword ? 'input-error' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setErrors(p => ({ ...p, newPassword: '' }))
                  }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className={`input-wrap ${errors.confirmPassword ? 'input-error' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setErrors(p => ({ ...p, confirmPassword: '' }))
                  }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirm(v => !v)}
                >
                  {showConfirm
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Resetting password...' : 'Reset Password'}
            </button>

            <p className="forgot-help">
              Make sure your new password is at least 8 characters long.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
