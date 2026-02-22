import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import './App.css'
import PageTransition from './components/PageTransition'
import Homepage from './components/Homepage'
import ProductPage from './components/productpage'
import Carts from './components/Carts'
import Profile from './components/Profile'
import Login from './components/Login'
import ForgotPassword from './components/ForgotPassword'
import ProtectedRoute from './components/ProtectedRoute'
import LoginRoute from './components/LoginRoute'
import Search from './components/search'

function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes key={location.pathname}>
        <Route path="/" element={<PageTransition><Homepage /></PageTransition>} />
        <Route path="/product" element={<PageTransition><ProductPage /></PageTransition>} />
        <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><ProtectedRoute><Carts /></ProtectedRoute></PageTransition>} />
        <Route path="/profile" element={<PageTransition><ProtectedRoute><Profile /></ProtectedRoute></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginRoute><Login /></LoginRoute></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
