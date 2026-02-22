import { useEffect } from 'react'
import './Popup.css'

export default function Popup({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      onClose()
    }, 2500)

    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className={`popup popup-${type}`}>
      <div className="popup-content">
        {type === 'success' && (
          <svg className="popup-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {type === 'error' && (
          <svg className="popup-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
        <span className="popup-message">{message}</span>
      </div>
      <div className="popup-progress"></div>
    </div>
  )
}
