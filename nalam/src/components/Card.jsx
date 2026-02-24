import { useNavigate } from 'react-router-dom'
import './Card.css'
import { useState } from 'react'
import Popup from './Popup'

function StarRating({ rating }) {
  return (
    <div className="card-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`star ${star <= Math.floor(rating) ? 'filled'  : 'empty'}`}
          viewBox="0 0 24 24"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
      <span className="rating-value">{rating}</span>
    </div>
  )
}

function Card({ product }) {
  const { name, category, price, originalPrice, rating, reviews, badge, image } = product
  const navigate = useNavigate()
  const [popupMessage, setPopupMessage] = useState('')
  const [popupType, setPopupType] = useState('success')
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)


  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null
   async function handleAddToCart() {
    const token = localStorage.getItem('token')
    if (!token) {
      setPopupType('error')
      setPopupMessage('Please log in to add items to cart')
      return
    }

    setIsAdding(true)

    try {
      const res = await fetch('https://nalam-grocery.onrender.com/user/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setPopupType('error')
        setPopupMessage(data.error || 'Failed to add to cart')
        setIsAdding(false)
        return
      }

      setPopupType('success')
      setPopupMessage(`Added ${quantity} item(s) to cart!`)
      setQuantity(1)
      setIsAdding(false)
    } catch (err) {
      setPopupType('error')
      setPopupMessage('Network error. Please try again.')
      setIsAdding(false)
    }
  }
  return (
    <div className="card" onClick={() => navigate('/product', { state: { product } })}>
      {/* Image */}
      <div className="card-image-wrapper">
        <img src={image} alt={name} className={`card-image ${category === "Oils" ? "" : "rota"}`} loading="lazy" />
       
        <button className="card-wishlist" aria-label="Add to cart" onClick={handleAddToCart}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
          
        </button>
      </div>

      {/* Body */}
      <div className="card-body">
        <span className="card-category">{category}</span>
        <h3 className="card-name">{name}</h3>

       

        <div className="card-footer">
          <div className="card-pricing">
            <span className="card-price">₹{price.toFixed(2)}</span>
            {originalPrice>price && (
              <>
                <span className="card-original">${originalPrice.toFixed(2)}</span>
                <span className="card-discount">-{discount}%</span>
              </>
            )}
          </div>
         
        </div>
      </div>
      <Popup
        message={popupMessage}
        type={popupType}
        onClose={() => setPopupMessage('')}
      />
    </div>
  )
}

export default Card
