import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import Loading from './Loading'

export default function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null)
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) { setIsAdmin(false); return }

    fetch('https://nalam-grocery.onrender.com/auth/check-admin', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setIsAdmin(data.isAdmin === true))
      .catch(() => setIsAdmin(false))
  }, [token])

  if (isAdmin === null) return <Loading />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
