import { useState } from 'react'
import './productview.css'
import Popup from './Popup'

export default function ProductView({ product }) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [popupMessage, setPopupMessage] = useState('')
  const [popupType, setPopupType] = useState('success')

  async function handleAddToCart() {
    const token = localStorage.getItem('token')
    if (!token) {
      setPopupType('error')
      setPopupMessage('Please log in to add items to cart')
      return
    }

    setIsAdding(true)

    try {
      const res = await fetch('http://localhost:3000/user/cart', {
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
    <div className="product-view">
      <Popup
        message={popupMessage}
        type={popupType}
        onClose={() => setPopupMessage('')}
      />

      {product && (
        <>
          <div className="product-image">
            <img src={product.image} alt={product.name} />
          </div>
         {product.stockLeft >10 ?  <div className="ava">Available...</div> : <div className="avl">Only {product.stockLeft} left</div>}
          <div className="product-details">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-description">{product.description}</p>

            <div className="product-price-section">
              <div className="product-price">₹{product.discountedPrice.toFixed(2)}</div>
              {product.originalPrice && (
                <div>
                  <span className="product-original">₹{product.originalPrice.toFixed(2)}</span>
                  <span className="product-discount">
                    {Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)}% off
                  </span>
                </div>
              )}
            </div>

            <div className="product-quantity">
              <div className="quantity-control">
              <label className="quantity-label">Quantity  :  </label>
                <input
                  type="number"
                  className="qty-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <div>

                <button className="qty-btn" onClick={() => setQuantity(q => q + 1)}>
                  +
                </button>
              </div>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity === 1}
                >
                  −
                </button>
                </div>
            </div>

            <button
              className="add-to-cart"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? 'Adding to Cart...' : 'Add to Cart'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}