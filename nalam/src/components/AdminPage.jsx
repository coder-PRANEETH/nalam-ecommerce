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
  const [orders, setOrders]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('All')
  const [selected, setSelected]   = useState(null)
  const [updating, setUpdating]   = useState(false)
  const [popupMsg, setPopupMsg]   = useState('')
  const [popupType, setPopupType] = useState('success')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchOrders()
  }, [filter])

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

  async function updateStatus(orderId, newStatus) {
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

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (loading) return <Loading />

  return (
    <div className="admin-wrapper">
      {popupMsg && <Popup message={popupMsg} type={popupType} onClose={() => setPopupMsg('')} />}

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Nalam Admin</h2>
        </div>
        <nav className="admin-nav">
          <button className="admin-nav-btn active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Orders
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
          <h1>Order Management</h1>
          <div className="admin-stats">
            <div className="stat-card">
              <span className="stat-num">{orders.length}</span>
              <span className="stat-label">{filter === 'All' ? 'Total' : filter} Orders</span>
            </div>
          </div>
        </header>

        {/* Filter Tabs */}
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

        <div className="admin-content">
          {/* Orders Table */}
          <div className={`admin-orders-panel ${selected ? 'shrunk' : ''}`}>
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
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
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
                      <td>{order.userName}</td>
                      <td>{order.product?.name || '—'}</td>
                      <td>{order.quantity}</td>
                      <td>₹{order.totalPrice}</td>
                      <td><span className={`admin-badge ${STATUS_COLOR[order.status]}`}>{order.status}</span></td>
                      <td>{formatDate(order.orderedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Detail Panel */}
          {selected && (
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
                      onClick={() => updateStatus(selected._id, s)}
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
        </div>
      </main>
    </div>
  )
}
