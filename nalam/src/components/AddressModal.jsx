import { useState, useEffect } from 'react'
import Popup from './Popup'
import './AddressModal.css'

export default function AddressModal({ isOpen, onClose, onSave, existingAddresses = [], addressToEdit = null }) {
  const [formData, setFormData] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [popupMessage, setPopupMessage] = useState('')
  const [popupType, setPopupType] = useState('success')

  useEffect(() => {
    if (addressToEdit) {
      setFormData(addressToEdit)
    } else {
      setFormData({
        label: 'Home',
        street: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
      })
    }
    setErrors({})
  }, [addressToEdit, isOpen])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validateForm() {
    const newErrors = {}
    if (!formData.street.trim()) newErrors.street = 'Street address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits'
    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    const token = localStorage.getItem('token')

    try {
      let updatedAddresses

      if (addressToEdit) {
        // Edit mode: update existing address
        updatedAddresses = existingAddresses.map(addr =>
          addr._id === addressToEdit._id ? formData : addr
        )
      } else {
        // Add mode: add new address
        updatedAddresses = [...existingAddresses, formData]
      }

      const res = await fetch('https://nalam-grocery.onrender.com/user', {
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
        setPopupMessage(data.error || 'Failed to save address')
        setSaving(false)
        return
      }

      setPopupType('success')
      setPopupMessage(addressToEdit ? 'Address updated successfully!' : 'Address added successfully!')
      setSaving(false)

      setTimeout(() => {
        onSave(data.user)
        handleClose()
      }, 1500)
    } catch (err) {
      setPopupType('error')
      setPopupMessage('Network error. Please try again.')
      setSaving(false)
    }
  }

  function handleClose() {
    setFormData({
      label: 'Home',
      street: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    })
    setErrors({})
    setPopupMessage('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <Popup
        message={popupMessage}
        type={popupType}
        onClose={() => setPopupMessage('')}
      />

      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{addressToEdit ? 'Edit Address' : 'Add New Address'}</h2>
            <button className="modal-close" onClick={handleClose}>&times;</button>
          </div>

          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Address Type</label>
              <select
                name="label"
                value={formData.label}
                onChange={handleChange}
                className="form-input"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                name="street"
                placeholder="e.g., 42, MG Road"
                value={formData.street}
                onChange={handleChange}
                className={`form-input ${errors.street ? 'input-error' : ''}`}
              />
              {errors.street && <span className="field-error">{errors.street}</span>}
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g., Bengaluru"
                  value={formData.city}
                  onChange={handleChange}
                  className={`form-input ${errors.city ? 'input-error' : ''}`}
                />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="e.g., Karnataka"
                  value={formData.state}
                  onChange={handleChange}
                  className={`form-input ${errors.state ? 'input-error' : ''}`}
                />
                {errors.state && <span className="field-error">{errors.state}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                name="pincode"
                placeholder="e.g., 560034"
                value={formData.pincode}
                onChange={handleChange}
                className={`form-input ${errors.pincode ? 'input-error' : ''}`}
              />
              {errors.pincode && <span className="field-error">{errors.pincode}</span>}
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
              <span className="checkbox-custom" />
              Set as default address
            </label>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? (addressToEdit ? 'Updating...' : 'Adding...') : (addressToEdit ? 'Update Address' : 'Add Address')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
