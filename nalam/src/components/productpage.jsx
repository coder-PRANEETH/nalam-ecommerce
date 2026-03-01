import { useState, useEffect } from 'react'
import './productpage.css'
import Navbar from './Navbar'
import ProductView from './productview'
import Footer from './Footer'
import AddressModal from './AddressModal'
import Popup from './Popup'
import { useLocation } from 'react-router-dom'

export default function ProductPage() {
  const location = useLocation()
  const product = location.state?.product
  const [user, setUser] = useState(null)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [addressToEdit, setAddressToEdit] = useState(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const [popupMessage, setPopupMessage] = useState('')
  const [popupType, setPopupType] = useState('success')
  const [pendingCheckout, setPendingCheckout] = useState(false)
  const API_BASE = 'https://nalam-grocery.onrender.com'

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch('https://nalam-grocery.onrender.com/user', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => setUser(data))
        .catch(err => console.error('Failed to fetch user:', err))
    }
  }, [])

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  function handleAddressSaved(updatedUser) {
    setUser(updatedUser)
  }

  const grandTotal = +((product?.discountedPrice || 0) * 1.05).toFixed(2)

  async function handleCheckout() {
    if (!product) return
    const token = localStorage.getItem('token')
    if (!token) {
      setPopupType('error')
      setPopupMessage('Please log in to proceed with payment.')
      return
    }

    // Check if user has an address
    if (!user?.addresses || user.addresses.length === 0) {
      setPendingCheckout(true)
      setIsAddressModalOpen(true)
      return
    }

    setCheckingOut(true)

    try {
      // 1. Create Razorpay order
      const res = await fetch(`${API_BASE}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: grandTotal }),
      })

      if (!res.ok) throw new Error('Failed to create payment order')
      const { orderId, keyId, amount, currency } = await res.json()

      // 2. Open Razorpay checkout popup
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Nalam Grocery',
        description: product.name,
        order_id: orderId,
        handler: async function (response) {
          // 3. Verify payment & place order
          try {
            const verifyRes = await fetch(`${API_BASE}/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orders: [{
                  productId: product._id,
                  quantity: 1,
                  totalPrice: product.discountedPrice,
                }],
              }),
            })

            if (!verifyRes.ok) throw new Error('Payment verification failed')

            setPopupType('success')
            setPopupMessage('Payment successful! Your order has been placed.')
          } catch (err) {
            console.error('Verify error:', err)
            setPopupType('error')
            setPopupMessage('Payment verification failed. Contact support.')
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#5df74f' },
        modal: {
          ondismiss: function () {
            setCheckingOut(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (resp) {
        setPopupType('error')
        setPopupMessage(`Payment failed: ${resp.error.description}`)
        setCheckingOut(false)
      })
      rzp.open()
    } catch (err) {
      console.error('Checkout error:', err)
      setPopupType('error')
      setPopupMessage('Could not initiate payment. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <>
    <Navbar />
    <div className="navbar-offset" />

    <Popup
      message={popupMessage}
      type={popupType}
      onClose={() => setPopupMessage('')}
    />

    <div className="product-page">
    <ProductView product={product}/>
      <div className="checkout">
        <h2 className="checkout-title">Order Summary</h2>

        {/* Items */}
          <div className="checkout-items">
            <div className="checkout-item">
              <img src={product?.image} alt={product?.name} className="checkout-item-img" />
              <div className="checkout-item-info">
                <span className="checkout-item-name">{product?.name}</span>
                <span className="checkout-item-variant">Size: {product?.size} &nbsp;|&nbsp; Qty: {product?.quantity}</span>
              </div>
              <span className="checkout-item-price">₹{product?.price}</span>
            </div>
          </div>

          {/* <hr className="checkout-divider" /> */}

        {/* Promo Code */}
        {/* <div className="checkout-promo">
          <input
            type="text"
            className="checkout-promo-input"
            placeholder="Promo / coupon code"
          />
          <button className="checkout-promo-btn">Apply</button>
        </div> */}

        <hr className="checkout-divider" />

        {/* Price Breakdown */}
        <div className="checkout-breakdown">
          <div className="checkout-row">
            <span>Subtotal</span>
            <span>₹{product?.discountedPrice?.toFixed(2) || '0.00'}</span>
          </div>
          {product?.originalPrice && (
            <div className="checkout-row">
              <span>Discount</span>
              <span className="checkout-discount">- ₹{(product.originalPrice - product.discountedPrice).toFixed(2)}</span>
            </div>
          )}
          <div className="checkout-row">
            <span>Shipping</span>
            <span className="checkout-free">Free</span>
          </div>
          <div className="checkout-row">
            <span>Tax (5%)</span>
            <span>₹{(product?.discountedPrice * 0.05)?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        <hr className="checkout-divider" />

        {/* Total */}
        <div className="checkout-total">
          <span>Total</span>
          <span>₹{((product?.discountedPrice || 0) + ((product?.discountedPrice || 0) * 0.05)).toFixed(2)}</span>
        </div>

        <button
          className="checkout-button"
          onClick={handleCheckout}
          disabled={checkingOut}
        >
          {checkingOut ? 'Processing...' : 'Proceed to Payment'}
        </button>

        <p className="checkout-secure">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Secure checkout
        </p>

        <hr className="checkout-divider" />

        {/* Delivery Address */}
        {user && user.addresses && user.addresses.length > 0 ? (
          <div className="checkout-address">
            <div className="checkout-address-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <h3 className="checkout-address-title">Delivery Address</h3>
              <button className="checkout-address-edit" onClick={() => { setAddressToEdit(user.addresses.find(a => a.isDefault) || user.addresses[0]); setIsAddressModalOpen(true) }}>Edit</button>
            </div>

            {(() => {
              const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0]
              return (
                <div className="checkout-address-card">
                  <div className="checkout-address-name">
                    <span>{user.name}</span>
                    <span className="checkout-address-tag">{defaultAddr.label}</span>
                  </div>
                  {defaultAddr.street && <p className="checkout-address-line">{defaultAddr.street}</p>}
                  <p className="checkout-address-line">{defaultAddr.city}, {defaultAddr.state} — {defaultAddr.pincode}</p>
                  <p className="checkout-address-line">India</p>
                  {user.phone && (
                    <p className="checkout-address-phone">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.12 2.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                      </svg>
                      {user.phone}
                    </p>
                  )}
                </div>
              )
            })()}
          </div>
        ) : (
          <div className="checkout-address">
            <div className="checkout-address-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <h3 className="checkout-address-title">Delivery Address</h3>
              <button className="checkout-address-edit" onClick={() => setIsAddressModalOpen(true)}>Add Address</button>
            </div>
          </div>
        )}

        <hr className="checkout-divider" />

        
      </div>
    </div>
    <Footer />

    <AddressModal
      isOpen={isAddressModalOpen}
      onClose={() => { setIsAddressModalOpen(false); setAddressToEdit(null); setPendingCheckout(false) }}
      onSave={(updatedUser) => {
        handleAddressSaved(updatedUser)
        setIsAddressModalOpen(false)
        setAddressToEdit(null)
        if (pendingCheckout) {
          setPendingCheckout(false)
          setTimeout(() => handleCheckout(), 300)
        }
      }}
      existingAddresses={user?.addresses || []}
      addressToEdit={addressToEdit}
    />
    </>
  )
}
