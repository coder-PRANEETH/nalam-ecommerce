import Navbar from './Navbar'
import Hero from './Hero'
import Products from './Products'
import Footer from './Footer'

function Homepage() {
  return (
    <>
      <Navbar />
      <div className="navbar-offset" />
      <Hero />
      <Products searchQuery={''} />
      <Footer />
    </>
  )
}

export default Homepage
