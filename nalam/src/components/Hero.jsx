import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Hero.css'

export default function Hero() {
  const [products, setProducts] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Fetch products on mount
  useEffect(() => {
    fetch('http://localhost:3000/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products')
        return res.json()
      })
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching products:', err)
        setLoading(false)
      })
  }, [])

  // Auto-rotate carousel every 6 seconds
  useEffect(() => {
    if (products.length === 0) return

    const interval = setInterval(() => {
      setPrevIndex(currentIndex)
      setCurrentIndex(prev => (prev + 1) % products.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [products.length, currentIndex])

  if (loading || products.length === 0) {
    return (
      <section className="hero">
        <div className="hero-placeholder">Loading...</div>
      </section>
    )
  }

  const currentProduct = products[currentIndex]
  const isNextSlide = currentIndex > prevIndex || (currentIndex === 0 && prevIndex > 0)

  function handleHeroClick() {
    navigate('/product', { state: { product: currentProduct } })
  }

  function handleIndicatorClick(idx) {
    setPrevIndex(currentIndex)
    setCurrentIndex(idx)
  }

  return (
    <section className="hero">
      <div className="hero-carousel">
        <img
          key={currentIndex}
          src={currentProduct.coverImage}
          alt={currentProduct.name}
          className={`hero-image ${isNextSlide ? 'slide-in-right' : 'slide-in-left'}`}
          onClick={handleHeroClick}
        />
        <div className="hero-overlay">
          <h2 className="hero-title">{currentProduct.name}</h2>
      
          
        </div>
      </div>

      {/* Carousel indicators */}
      {products.length > 1 && (
        <div className="hero-indicators">
          {products.map((_, idx) => (
            <button
              key={idx}
              className={`indicator ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => handleIndicatorClick(idx)}
              title={`Go to product ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}