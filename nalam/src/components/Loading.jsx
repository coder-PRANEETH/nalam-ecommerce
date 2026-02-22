import './Loading.css'

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p className="loading-text">Loading</p>
      </div>
    </div>
  )
}
