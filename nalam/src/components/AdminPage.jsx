import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Loading from './Loading'
import Popup from './Popup'
import './AdminPage.css'

const API = 'https://nalam-grocery.onrender.com'
const STATUSES = ['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled']

const STATUS_COLOR = {
  Pending:   'admin-status-pending',
  Shipped:   'admin-status-shipped',
  Delivered: 'admin-status-delivered',
  Cancelled: 'admin-status-cancelled',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminPage() {
  const [tab, setTab]             = useState('Orders')
  const [orders, setOrders]       = useState([])
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('All')
  const [selected, setSelected]   = useState(null)
  const [updating, setUpdating]   = useState(false)
  const [popupMsg, setPopupMsg]   = useState('')
  const [popupType, setPopupType] = useState('success')
  const [editForm, setEditForm]   = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({
    productId: '', name: '', category: '', description: '',
    originalPrice: '', discountedPrice: '', image: '', stockLeft: ''
  })
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (tab === 'Orders') {
      fetchOrders()
    } else {
      fetchProducts()
    }
  }, [tab, filter])

  async function fetchOrders() {
    setLoading(true)
    try {
      const url = filter === 'All' ? `${API}/admin/orders` : `${API}/admin/orders?status=${filter}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 403) { navigate('/'); return }
      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      setOrders(data)
    } catch (err) {
      setPopupMsg(err.message)
      setPopupType('error')
    } finally {
      setLoading(false)
    }
  }

  async function fetchProducts() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 403) { navigate('/'); return }
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      setPopupMsg(err.message)
      setPopupType('error')
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    setUpdating(true)
    try {
      const res = await fetch(`${API}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      setOrders(prev => prev.map(o => o._id === orderId ? data.order : o))
      if (selected?._id === orderId) setSelected(data.order)
      setPopupMsg(`Order status updated to ${newStatus}`)
      setPopupType('success')
    } catch (err) {
      setPopupMsg(err.message)
      setPopupType('error')
    } finally {
      setUpdating(false)
    }
  }

  async function updateProduct(productId) {
    setUpdating(true)
    try {
      const res = await fetch(`${API}/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      setProducts(prev => prev.map(p => p._id === productId ? data.product : p))
      setSelected(data.product)
      setPopupMsg('Product updated successfully')
      setPopupType('success')
    } catch (err) {
      setPopupMsg(err.message)
      setPopupType('error')
    } finally {
      setUpdating(false)
    }
  }

  async function addProduct() {
    setUpdating(true)
    try {
      const payload = {
        ...addForm,
        originalPrice: parseFloat(addForm.originalPrice),
        discountedPrice: parseFloat(addForm.discountedPrice),
        stockLeft: parseInt(addForm.stockLeft),
      }
      const res = await fetch(`${API}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add product')
      setProducts(prev => [data.product, ...prev])
      setShowAddForm(false)
      setAddForm({ productId: '', name: '', category: '', description: '', originalPrice: '', discountedPrice: '', image: '', stockLeft: '' })
      setPopupMsg('Product added successfully')
      setPopupType('success')
    } catch (err) {
      setPopupMsg(err.message)
      setPopupType('error')
    } finally {
      setUpdating(false)
    }
  }

  function selectProduct(product) {
    setSelected(product)
    setEditForm({
      name: product.name,
      description: product.description,
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice,
      stockLeft: product.stockLeft,
      category: product.category,
    })
  }

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (loading) return <Loading />

  const showOrders = tab === 'Orders'
  const showProducts = tab === 'Products'

  return (
    <div className="admin-wrapper">
      {popupMsg && <Popup message={popupMsg} type={popupType} onClose={() => setPopupMsg('')} />}

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Nalam Admin</h2>
        </div>
        <nav className="admin-nav">
          <button
            className={`admin-nav-btn ${tab === 'Orders' ? 'active' : ''}`}
            onClick={() => { setTab('Orders'); setSelected(null); setFilter('All') }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Orders
          </button>
          <button
            className={`admin-nav-btn ${tab === 'Products' ? 'active' : ''}`}
            onClick={() => { setTab('Products'); setSelected(null) }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4M9 2v4m6-4v4M3 6h18" /></svg>
            Products
          </button>
        </nav>
        <button className="admin-logout-btn" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>{tab === 'Orders' ? 'Order' : 'Product'} Management</h1>
          <div className="admin-stats">
            <div className="stat-card">
              <span className="stat-num">{showOrders ? orders.length : products.length}</span>
              <span className="stat-label">{showOrders ? (filter === 'All' ? 'Total' : filter) : 'Total'} {showOrders ? 'Orders' : 'Products'}</span>
            </div>
          </div>
        </header>

        {/* Filter Tabs - Only for Orders */}
        {showOrders && (
          <div className="admin-filters">
            {STATUSES.map(s => (
              <button
                key={s}
                className={`filter-btn ${filter === s ? 'active' : ''}`}
                onClick={() => { setFilter(s); setSelected(null) }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="admin-content">
          {/* Orders Table */}
          {showOrders && (
            <div className={`admin-orders-panel ${selected ? 'shrunk mobile-hidden' : ''}`}>
              {orders.length === 0 ? (
                <div className="admin-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p>No {filter !== 'All' ? filter.toLowerCase() : ''} orders found</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th className="hide-mobile">Customer</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th className="hide-mobile">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr
                        key={order._id}
                        className={`admin-row ${selected?._id === order._id ? 'selected' : ''}`}
                        onClick={() => setSelected(order)}
                      >
                        <td className="order-id">#{order._id.slice(-6)}</td>
                        <td className="hide-mobile">{order.userName}</td>
                        <td>{order.product?.name || '—'}</td>
                        <td>{order.quantity}</td>
                        <td>₹{order.totalPrice}</td>
                        <td><span className={`admin-badge ${STATUS_COLOR[order.status]}`}>{order.status}</span></td>
                        <td className="hide-mobile">{formatDate(order.orderedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Add Product Modal */}
          {showAddForm && (
            <div className="add-product-overlay" onClick={() => setShowAddForm(false)}>
              <div className="add-product-modal" onClick={e => e.stopPropagation()}>
                <div className="detail-header">
                  <h3>Add New Product</h3>
                  <button className="detail-close" onClick={() => setShowAddForm(false)}>✕</button>
                </div>
                <div className="add-product-form">
                  <div className="detail-section">
                    <h4>Product ID</h4>
                    <input type="text" className="edit-input" placeholder="e.g. PROD-001" value={addForm.productId} onChange={e => setAddForm({...addForm, productId: e.target.value})} />
                  </div>
                  <div className="detail-section">
                    <h4>Name</h4>
                    <input type="text" className="edit-input" placeholder="Product name" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} />
                  </div>
                  <div className="detail-section">
                    <h4>Category</h4>
                    <input type="text" className="edit-input" placeholder="e.g. Nuts, Spices" value={addForm.category} onChange={e => setAddForm({...addForm, category: e.target.value})} />
                  </div>
                  <div className="detail-section">
                    <h4>Description</h4>
                    <textarea className="edit-input" rows="3" placeholder="Min 20 characters" value={addForm.description} onChange={e => setAddForm({...addForm, description: e.target.value})} />
                  </div>
                  <div className="detail-section">
                    <div className="price-grid">
                      <div>
                        <h4>Original Price</h4>
                        <input type="number" className="edit-input" placeholder="0" value={addForm.originalPrice} onChange={e => setAddForm({...addForm, originalPrice: e.target.value})} />
                      </div>
                      <div>
                        <h4>Discounted Price</h4>
                        <input type="number" className="edit-input" placeholder="0" value={addForm.discountedPrice} onChange={e => setAddForm({...addForm, discountedPrice: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <div className="detail-section">
                    <h4>Image URL</h4>
                    <input type="text" className="edit-input" placeholder="product.jpg" value={addForm.image} onChange={e => setAddForm({...addForm, image: e.target.value})} />
                  </div>
                  
                  <div className="detail-section">
                    <h4>Stock Left</h4>
                    <input type="number" className="edit-input" placeholder="0" value={addForm.stockLeft} onChange={e => setAddForm({...addForm, stockLeft: e.target.value})} />
                  </div>
                  <div className="detail-section">
                    <button className="save-btn" disabled={updating} onClick={addProduct}>
                      {updating ? 'Adding...' : 'Add Product'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {showProducts && (
            <div className={`admin-products-panel ${selected ? 'shrunk mobile-hidden' : ''}`}>
              <button className="add-product-btn" onClick={() => { setShowAddForm(true); setSelected(null) }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M12 5v14M5 12h14" /></svg>
                Add Product
              </button>
              {products.length === 0 ? (
                <div className="admin-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4M9 2v4m6-4v4M3 6h18" />
                  </svg>
                  <p>No products found</p>
                </div>
              ) : (
                <div className="products-grid">
                  {products.map(product => (
                    <div
                      key={product._id}
                      className={`product-card ${selected?._id === product._id ? 'selected' : ''}`}
                      onClick={() => selectProduct(product)}
                    >
                      {product.coverImage && (
                        <img src={product.coverImage} alt={product.name} className="product-card-img" />
                      )}
                      <div className="product-card-info">
                        <h3>{product.name}</h3>
                        <p className="product-card-category">{product.category}</p>
                        <p className="product-card-price">₹{product.discountedPrice}</p>
                        <p className="product-card-stock">Stock: {product.stockLeft}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Order Detail Panel */}
          {showOrders && selected && (
            <div className="admin-detail-panel">
              <div className="detail-header">
                <h3>Order Details</h3>
                <button className="detail-close" onClick={() => setSelected(null)}>✕</button>
              </div>

              <div className="detail-section">
                <h4>Product</h4>
                <div className="detail-product">
                  {selected.product?.coverImage && (
                    <img src={selected.product.coverImage} alt={selected.product?.name} className="detail-product-img" />
                  )}
                  <div>
                    <p className="detail-product-name">{selected.product?.name || '—'}</p>
                    <p className="detail-product-price">₹{selected.product?.discountedPrice} × {selected.quantity}</p>
                    <p className="detail-total">Total: ₹{selected.totalPrice}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Customer Info</h4>
                <div className="detail-info-grid">
                  <div className="detail-info-item">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{selected.userName}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selected.userEmail}</span>
                  </div>
                  <div className="detail-info-item">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{selected.userPhone || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Delivery Address</h4>
                {selected.userAddress?.city ? (
                  <div className="detail-address">
                    {selected.userAddress.label && <span className="address-label-tag">{selected.userAddress.label}</span>}
                    <p>{selected.userAddress.street}</p>
                    <p>{selected.userAddress.city}, {selected.userAddress.state}</p>
                    <p>PIN: {selected.userAddress.pincode}</p>
                  </div>
                ) : (
                  <p className="detail-muted">No address provided</p>
                )}
              </div>

              <div className="detail-section">
                <h4>Update Status</h4>
                <div className="detail-status-btns">
                  {['Pending', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                    <button
                      key={s}
                      className={`status-update-btn ${STATUS_COLOR[s]} ${selected.status === s ? 'current' : ''}`}
                      disabled={updating || selected.status === s}
                      onClick={() => updateOrderStatus(selected._id, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="detail-section detail-meta">
                <p>Ordered: {formatDate(selected.orderedAt)}</p>
                <p>Order ID: {selected._id}</p>
              </div>
            </div>
          )}

          {/* Product Detail Panel */}
          {showProducts && selected && (
            <div className="admin-detail-panel">
              <div className="detail-header">
                <h3>Product Details</h3>
                <button className="detail-close" onClick={() => setSelected(null)}>✕</button>
              </div>

              {selected.coverImage && (
                <div className="detail-product-img-wrapper">
                  <img src={selected.coverImage} alt={selected.name} className="detail-product-img-large" />
                </div>
              )}

              <div className="detail-section">
                <h4>Product ID</h4>
                <p className="detail-value">{selected.productId}</p>
              </div>

              <div className="detail-section">
                <h4>Name</h4>
                <input
                  type="text"
                  className="edit-input"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>

              <div className="detail-section">
                <h4>Category</h4>
                <input
                  type="text"
                  className="edit-input"
                  value={editForm.category || ''}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                />
              </div>

              <div className="detail-section">
                <h4>Description</h4>
                <textarea
                  className="edit-input"
                  rows="3"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                />
              </div>

              <div className="detail-section">
                <div className="price-grid">
                  <div>
                    <h4>Original Price</h4>
                    <input
                      type="number"
                      className="edit-input"
                      value={editForm.originalPrice || ''}
                      onChange={(e) => setEditForm({...editForm, originalPrice: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <h4>Discounted Price</h4>
                    <input
                      type="number"
                      className="edit-input"
                      value={editForm.discountedPrice || ''}
                      onChange={(e) => setEditForm({...editForm, discountedPrice: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Stock Left</h4>
                <input
                  type="number"
                  className="edit-input"
                  value={editForm.stockLeft || ''}
                  onChange={(e) => setEditForm({...editForm, stockLeft: parseInt(e.target.value)})}
                />
              </div>

              <div className="detail-section">
                <button
                  className="save-btn"
                  disabled={updating}
                  onClick={() => updateProduct(selected._id)}
                >
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>

              <div className="detail-section detail-meta">
                <p>Product ID: {selected._id}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
