import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const searchRef = useRef(null)

  // Fetch products on component mount
  useEffect(() => {
    fetch('https://nalam-grocery.onrender.com/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to fetch products:', err))
  }, [])

  // Fetch user cart count
  useEffect(() => {
    if (!token) {
      setCartCount(0)
      return
    }

    fetch('https://nalam-grocery.onrender.com/user', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch user')
        return res.json()
      })
      .then(data => {
        setCartCount(data.cart?.length || 0)
      })
      .catch(err => {
        console.error('Failed to fetch cart:', err)
        setCartCount(0)
      })
  }, [token])

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts([])
      setShowSuggestions(false)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    )
    setFilteredProducts(filtered)
    setShowSuggestions(filtered.length > 0)
  }, [searchQuery, products])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSuggestionClick(product) {
    navigate('/product', { state: { product } })
    setSearchQuery('')
    setShowSuggestions(false)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav className="navbar">
      {/* Left - Logo */}
      <div className="navbar-logo">
        <Link to="/" className="logo-link">
          <img src="/logo.png" alt="Nalam Logo" />
          <span className="logo-text">Nalam</span>
        </Link>
      </div>

      {/* Center - Search Bar */}
      <div className="navbar-search" ref={searchRef}>
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <form onSubmit={(e) => {
            e.preventDefault();
            navigate('/search', { state: { query: searchQuery } });

          }}>

          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() !== '' && setShowSuggestions(filteredProducts.length > 0)}
            />
            </form>
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && filteredProducts.length > 0 && (
          <div className="search-suggestions">
            {filteredProducts.slice(0, 8).map((product) => (
              <div
                key={product._id}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(product)}
              >
                <img src={product.image} alt={product.name} className="suggestion-img" />
                <div className="suggestion-info">
                  <span className="suggestion-name">{product.name}</span>
                  <span className="suggestion-price">₹{product.discountedPrice || product.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right - Nav Buttons + Profile */}
      <div className="navbar-actions">


        <button className="nav-btn cart-btn" onClick={() => navigate('/cart')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
          <span>Cart</span>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>

        {/* Profile / Login / Logout */}
        <div className="navbar-profile">
          {token ? (
            <>
              <button className="profile-btn" onClick={() => navigate('/profile')}>
                <div className="profile-avatar">
                  <svg viewBox="0 0 24 24" fill="none" aria-labelledby='Profile' stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </button>
              <button className="nav-btn logout-btn" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="3" y2="12"/>
                </svg>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button className="nav-btn login-btn" onClick={() => navigate('/login')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
