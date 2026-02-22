import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import Popup from './Popup'
import './Carts.css'

export default function Carts() {
  const [items, setItems]     = useState([])
  const [originalItems, setOriginalItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [popupMessage, setPopupMessage] = useState('')
  const [popupType, setPopupType] = useState('success')
  const [saving, setSaving] = useState(false)
  const [cartUpdated, setCartUpdated] = useState(false)
  const navigate = useNavigate()
  

  useEffect(() => {
    const token = localStorage.getItem('token')
    Promise.all([
      fetch('http://localhost:3000/user', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => {
        if (!r.ok) throw new Error('Failed to fetch user')
        return r.json()
      }),
      fetch('http://localhost:3000/products').then(r => {
        if (!r.ok) throw new Error('Failed to fetch products')
        return r.json()
      }),
    ])
      .then(([user, products]) => {
        const cart = user?.cart ?? []

        const productMap = {}
        products.forEach(p => { productMap[p._id] = p })

        const cartItems = cart
          .map(cartItem => {
            const product = productMap[cartItem.product]
            if (!product) return null
            return {
              ...product,
              id:    product._id,
              price: product.discountedPrice,
              qty:   cartItem.quantity,
              cartItemId: cartItem._id,
            }
          })
          .filter(Boolean)

        setItems(cartItems)
        setOriginalItems(cartItems)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  function updateQty(id, delta) {
    setCartUpdated(true)
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    )
  }

  function removeItem(id) {
    setCartUpdated(true)
    setItems(prev => prev.filter(item => item.id !== id))
  }

  async function updateCart() {
    const token = localStorage.getItem('token')
    setSaving(true)

    try {
      const updatedCart = items.map(item => ({
        product: item.id,
        quantity: item.qty,
        _id: item.cartItemId,
      }))

      const res = await fetch('http://localhost:3000/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cart: updatedCart }),
      })

      if (!res.ok) {
        throw new Error('Failed to update cart')
      }

      setOriginalItems(items)
      setSaving(false)
      setCartUpdated(false)
      setPopupType('success')
      setPopupMessage('Cart updated successfully')
    } catch (err) {
      console.error('Error updating cart:', err)
      setSaving(false)
      setPopupType('error')
      setPopupMessage('Failed to update cart. Please try again.')
    }
  }

  function handleCancel() {
    setItems(originalItems)
    setCartUpdated(false)
  }

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  if (loading) return (
    <>
      <Navbar />
      <div className="navbar-offset" />
      <p style={{ textAlign: 'center', padding: '4rem' }}>Loading cart...</p>
      <Footer />
    </>
  )

  if (error) return (
    <>
      <Navbar />
      <div className="navbar-offset" />
      <p style={{ textAlign: 'center', padding: '4rem' }}>Error: {error}</p>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar />
      <div className="navbar-offset" />

      <Popup
        message={popupMessage}
        type={popupType}
        onClose={() => setPopupMessage('')}
      />

      <div className="cart-page">
        <h1 className="cart-heading">Your Cart <span className="cart-count">{items.length} items</span></h1>

        <div className="cart-layout">

          {/* Table */}
          <div className="cart-table-wrapper">
            <div className="cart-header-row">
              <span className="col-photo">Photo</span>
              <span className="col-name">Name</span>
              <span className="col-category">Category</span>
              <span className="col-price">Price</span>
              <span className="col-qty">Qty</span>
              <span className="col-subtotal">Subtotal</span>
              <span className="col-remove"></span>
            </div>

            {items.length === 0 ? (
              <div className="cart-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
                <p>Your cart is empty.</p>
              </div>
            ) : (
              items.map(item => (
                <div className="cart-row" key={item.id}>
                  <div className="col-photo">
                    <img src={item.image} alt={item.name} className="cart-img" />
                  </div>
                  <div className="col-name">
                    <span className="cart-item-name">{item.name}</span>
                  </div>
                  <div className="col-category">
                    <span className="cart-item-category">{item.category}</span>
                  </div>
                  <div className="col-price">
                    <span className="cart-item-price">₹{item.price.toFixed(2)}</span>
                  </div>
                  <div className="col-qty">
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                      <span className="qty-value">{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, +1)}>+</button>
                    </div>
                  </div>
                  <div className="col-subtotal">
                    <span className="cart-item-subtotal">₹{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                  <div className="col-remove">
                    <button className="cart-remove-btn" onClick={() => removeItem(item.id)} aria-label="Remove item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary Panel */}
          <div className="cart-summary">
            <h2 className="cart-summary-title">Summary</h2>

            <div className="cart-summary-row">
              <span>Subtotal ({items.length} items)</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span className="cart-free">Free</span>
            </div>
            <div className="cart-summary-row">
              <span>Tax (5%)</span>
              <span>₹{(total * 0.05).toFixed(2)}</span>
            </div>

            <hr className="cart-summary-divider" />

            <div className="cart-summary-total">
              <span>Total</span>
              <span>₹{(total * 1.05).toFixed(2)}</span>
            </div>

            <button className="cart-checkout-btn">Proceed to Checkout</button>

            <button className="cart-continue-btn" onClick={() => navigate('/')}>← Continue Shopping</button>
          </div>

        </div>

        {/* Update and Cancel Buttons */}
        { cartUpdated && (
          <div className="cart-actions">
            <button className="cart-cancel-btn" onClick={handleCancel}>Cancel</button>
            <button className="cart-update-btn" onClick={updateCart} disabled={saving}>
              {saving ? 'Updating...' : 'Update Cart'}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}
