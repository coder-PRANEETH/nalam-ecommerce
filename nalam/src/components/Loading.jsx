import './Loading.css'

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="loader">
        <div className="rings">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
        </div>
        <p className="loading-text">Loading</p>
      </div>
    </div>
  )
}
