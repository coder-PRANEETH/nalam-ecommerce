import Navbar from './Navbar'

import Products from './Products'
import Footer from './Footer'
import {useNavigate, useLocation } from 'react-router-dom'
import {useState, useEffect } from 'react'

function Search() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const query = location.state?.query || ''
    setSearchQuery(query)
  }, [location])

  // Scroll to top when search query changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [searchQuery])
  
    
    return (
        <>
        
            <Navbar />
            <div className="navbar-offset" />

            <Products  searchQuery={searchQuery} />
            <Footer />
        </>
    )
}


export default Search
