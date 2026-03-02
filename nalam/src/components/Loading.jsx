import './Loading.css'

export default function Loading() {
  return (
    <div className="loading-container">
      {/* Falling nuts background */}
      <div className="falling-nuts">
        {[...Array(12)].map((_, i) => (
          <span key={i} className={`nut nut-${(i % 4) + 1}`} style={{
            left: `${8 + i * 7.5}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${2.5 + (i % 3) * 0.8}s`,
          }}>
            {['🥜', '🌰', '🫘', '🥥'][i % 4]}
          </span>
        ))}
      </div>

      <div className="loader">
        {/* Nut bowl SVG */}
        <div className="bowl-wrapper">
          <svg className="bowl-svg" viewBox="0 0 160 100" fill="none">
            <path d="M20 30 Q20 85 80 85 Q140 85 140 30" stroke="#e8d5b7" strokeWidth="4" fill="none" className="bowl-path" />
            <ellipse cx="80" cy="30" rx="60" ry="10" fill="rgba(232,213,183,0.15)" stroke="#e8d5b7" strokeWidth="3" />
          </svg>
          {/* Nuts bouncing inside the bowl */}
          <div className="bowl-nuts">
            <span className="bowl-nut bn-1">🥜</span>
            <span className="bowl-nut bn-2">🌰</span>
            <span className="bowl-nut bn-3">🫘</span>
            <span className="bowl-nut bn-4">🥜</span>
            <span className="bowl-nut bn-5">🌰</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="nut-progress">
          <div className="nut-progress-bar"></div>
        </div>

        <p className="loading-text">Gathering fresh nuts...</p>
      </div>
    </div>
  )
}
