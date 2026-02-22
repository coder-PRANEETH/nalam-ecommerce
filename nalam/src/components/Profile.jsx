import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import Popup from './Popup'
import AddressModal from './AddressModal'
import './Profile.css'

const STATUS_COLOR = {
  Delivered:  'status-delivered',
  Returned:   'status-returned',
  Cancelled:  'status-cancelled',
  Processing: 'status-processing',
  Shipped:    'status-shipped',
  Pending:    'status-processing',
}

const TABS = ['Overview', 'Orders', 'Addresses', 'Payment', 'Account']

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [editMode, setEditMode]   = useState(false)
  const [user, setUser]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [formData, setFormData]   = useState({ name: '', email: '', phone: '', address: '' })
  const [saving, setSaving]       = useState(false)
  const [popupMessage, setPopupMessage] = useState('')
  const [popupType, setPopupType] = useState('success')
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [addressToEdit, setAddressToEdit] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch('http://localhost:3000/user', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user')
        return res.json()
      })
      .then((data) => {
        setUser(data)
        setFormData({
          name:    data.name    ?? '',
          email:   data.email   ?? '',
          phone:   data.phone   ?? '',
          address: data.address ?? '',
        })
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }


  function handleFormChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSaveChanges() {
    const token = localStorage.getItem('token')
    setSaving(true)

    try {
      const res = await fetch('http://localhost:3000/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setPopupType('error')
        setPopupMessage(data.error || 'Failed to update profile')
        setSaving(false)
        return
      }

      setUser(data.user)
      setEditMode(false)
      setPopupType('success')
      setPopupMessage('Profile updated successfully!')
      setSaving(false)
    } catch (err) {
      setPopupType('error')
      setPopupMessage('Network error. Please try again.')
      setSaving(false)
    }
  }

  function handleAddressSaved(updatedUser) {
    setUser(updatedUser)
  }

  async function handleRemoveAddress(addressIndex) {
    const token = localStorage.getItem('token')
    const updatedAddresses = user.addresses.filter((_, idx) => idx !== addressIndex)

    try {
      const res = await fetch('http://localhost:3000/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ addresses: updatedAddresses }),
      })

      const data = await res.json()
      if (!res.ok) {
        setPopupType('error')
        setPopupMessage(data.error || 'Failed to remove address')
        return
      }

      setUser(data.user)
      setPopupType('success')
      setPopupMessage('Address removed successfully!')
    } catch (err) {
      setPopupType('error')
      setPopupMessage('Network error. Please try again.')
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.'
    )
    if (!confirmed) return

    const token = localStorage.getItem('token')
    try {
      const res = await fetch('http://localhost:3000/user', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await res.json()
      if (!res.ok) {
        setPopupType('error')
        setPopupMessage(data.error || 'Failed to delete account')
        return
      }

      setPopupType('success')
      setPopupMessage('Account deleted successfully. Logging out...')
      setTimeout(() => {
        localStorage.removeItem('token')
        navigate('/login')
      }, 2000)
    } catch (err) {
      setPopupType('error')
      setPopupMessage('Network error. Please try again.')
    }
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="navbar-offset" />
      <p style={{ textAlign: 'center', padding: '4rem' }}>Loading profile...</p>
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

  const orders = user.orders ?? []
  const cartCount = user.cart?.length ?? 0

  return (
    <>
      <Navbar />
      <div className="navbar-offset" />

      <Popup
        message={popupMessage}
        type={popupType}
        onClose={() => setPopupMessage('')}
      />

      <div className="profile-page">

        {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar-circle">
                <span>{user.name.charAt(0)}</span>
              </div>
              <button className="avatar-upload-btn" title="Change photo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
            </div>

            <div className="profile-sidebar-info">
              <h2 className="profile-sidebar-name">{user.name}</h2>
              <p className="profile-sidebar-email">{user.email}</p>
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <span className="stat-value">{orders.length}</span>
                <span className="stat-label">Orders</span>
              </div>
              <div className="profile-stat-divider" />
              <div className="profile-stat">
                <span className="stat-value">{cartCount}</span>
                <span className="stat-label">Cart</span>
              </div>
            </div>

            <nav className="profile-nav">
              {TABS.map(tab => (
                <button
            key={tab}
            className={`profile-nav-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
                >
            {TAB_ICON[tab]}
            {tab}
                </button>
              ))}
            </nav>

            <button className="profile-logout-btn" onClick={logout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Log Out
            </button>
          </aside>

          {/* Main Content */}
        <main className="profile-main">

          {/* OVERVIEW */}
          {activeTab === 'Overview' && (
            <section className="profile-section">
              <div className="section-header">
                <h3 className="section-title">Personal Information</h3>
                <button className="edit-btn" onClick={() => {
                  if (editMode) {
                    setFormData({
                      name: user.name ?? '',
                      email: user.email ?? '',
                      phone: user.phone ?? '',
                      address: user.address ?? '',
                    })
                  }
                  setEditMode(e => !e)
                }}>
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editMode ? (
                <div className="profile-form">
                  {[
                    { label: 'Full Name', name: 'name',    type: 'text'  },
                    { label: 'Email',     name: 'email',   type: 'email', disabled: true },
                    { label: 'Phone',     name: 'phone',   type: 'tel'   },
                    
                  ].map(f => (
                    <div className="form-group" key={f.name}>
                      <label className="form-label">{f.label}</label>
                      <input
                        className="form-input"
                        type={f.type}
                        name={f.name}
                        value={formData[f.name]}
                        onChange={handleFormChange}
                        disabled={f.disabled}
                      />
                    </div>
                  ))}
                  <button className="save-btn" onClick={handleSaveChanges} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div className="info-grid">
                  {[
                    { label: 'Full Name',    value: user.name    },
                    { label: 'Email',        value: user.email   },
                    { label: 'Phone',        value: user.phone   },
                    {
  label: "Address",
  value: user.addresses.map((addr, index) => (
    <div key={index}>
      {addr.label}: {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
    </div>
  ))
}
,
                    { label: 'Member Since', value: formatDate(user.createdAt) },
                  ].map(row => (
                    <div className="info-row" key={row.label}>
                      <span className="info-label">{row.label}</span>
                      <span className="info-value">{row.value || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ORDERS */}
          {activeTab === 'Orders' && (
            <section className="profile-section">
              <div className="section-header">
                <h3 className="section-title">Order History</h3>
              </div>

              {orders.length === 0 ? (
                <p style={{ color: 'var(--text-muted, #888)', padding: '1rem 0' }}>No orders yet.</p>
              ) : (
                <div className="orders-table">
                  <div className="orders-thead">
                    <span>Order ID</span>
                    <span>Date</span>
                    <span>Items</span>
                    <span>Total</span>
                    <span>Status</span>
                    <span></span>
                  </div>
                  {orders.map(order => (
                    <div className="orders-row" key={order._id}>
                      <span className="order-id">#{String(order._id).slice(-6).toUpperCase()}</span>
                      <span className="order-date">{formatDate(order.orderedAt)}</span>
                      <span className="order-items">{order.quantity} item{order.quantity > 1 ? 's' : ''}</span>
                      <span className="order-total">₹{order.totalPrice.toFixed(2)}</span>
                      <span className={`order-status ${STATUS_COLOR[order.status] ?? ''}`}>{order.status}</span>
                      <button className="order-view-btn" onClick={() => navigate('/product')}>View</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ADDRESSES */}
          {activeTab === 'Addresses' && (
            <section className="profile-section">
              <div className="section-header">
                <h3 className="section-title">Saved Addresses</h3>
                <button className="edit-btn" onClick={() => setIsAddressModalOpen(true)}>+ Add New</button>
              </div>

              {user.addresses && user.addresses.length > 0 ? (
                <div className="address-list">
                  {user.addresses.map((addr, idx) => (
                    <div className="address-card" key={idx}>
                      <div className="address-card-top">
                        <span className="address-tag">{addr.label}</span>
                        {addr.isDefault && <span className="address-default">Default</span>}
                        <div className="address-actions">
                          <button className="addr-btn" onClick={() => { setAddressToEdit(addr); setIsAddressModalOpen(true) }}>Edit</button>
                          <button className="addr-btn addr-remove" onClick={() => handleRemoveAddress(idx)}>Remove</button>
                        </div>
                      </div>
                      {addr.street && <p className="address-text">{addr.street}</p>}
                      <p className="address-text">{addr.city}, {addr.state} — {addr.pincode}</p>
                      <p className="address-text">India</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted, #888)', padding: '1rem 0' }}>No addresses saved yet.</p>
              )}
            </section>
          )}

          {/* PAYMENT */}
          {activeTab === 'Payment' && (
            <section className="profile-section">
              <div className="section-header">
                <h3 className="section-title">Payment Methods</h3>
                <button className="edit-btn">+ Add UPI</button>
              </div>

              {user.payment?.upiIds && user.payment.upiIds.length > 0 ? (
                <div className="payment-list">
                  {user.payment.upiIds.map((upi, idx) => (
                    <div className="payment-card" key={idx}>
                      <div className="upi-icon">₹</div>
                      <div className="payment-card-info">
                        <span className="payment-card-type">{upi.label || 'UPI'}</span>
                        <span className="payment-card-num">{upi.upiId}</span>
                        <span className="payment-card-expiry">Added {new Date(upi.addedAt).toLocaleDateString('en-IN')}</span>
                      </div>
                      {upi.isDefault && <span className="payment-default">Default</span>}
                      <button className="addr-btn addr-remove">Remove</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted, #888)', padding: '1rem 0' }}>No payment methods added yet.</p>
              )}
            </section>
          )}

          {/* ACCOUNT */}
          {activeTab === 'Account' && (
            <section className="profile-section">
              <div className="section-header">
                <h3 className="section-title">Account</h3>
              </div>
              <div className="settings-list">
                <div className="settings-row">
                  <div className="settings-row-info">
                    <span className="settings-label">Change Password</span>
                    <span className="settings-sub">Last changed 3 months ago</span>
                  </div>
                  <button className="edit-btn" onClick={() => navigate('/forgot-password')}>Update</button>
                </div>
                <div className="settings-row">
                  <div className="settings-row-info">
                    <span className="settings-label">Delete Account</span>
                    <span className="settings-sub">Permanently remove your account and data</span>
                  </div>
                  <button className="addr-btn addr-remove" onClick={handleDeleteAccount}>Delete</button>
                </div>
              </div>
            </section>
          )}

        </main>
      </div>
      <Footer />

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => { setIsAddressModalOpen(false); setAddressToEdit(null) }}
        onSave={handleAddressSaved}
        existingAddresses={user?.addresses || []}
        addressToEdit={addressToEdit}
      />
    </>
  )
}

const TAB_ICON = {
  Overview:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Orders:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Addresses: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Payment:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Account:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
}
