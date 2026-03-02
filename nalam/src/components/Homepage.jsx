import Navbar from './Navbar'
import Hero from './Hero'
import Products from './Products'
import Footer from './Footer'

function Homepage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Navbar />
      <div className="navbar-offset" />
      <Hero />
      <Products searchQuery={''} />
      <Footer />
    </div>
  )
}

export default Homepage
