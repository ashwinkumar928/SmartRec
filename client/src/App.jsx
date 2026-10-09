import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetails from './pages/ProductDetails'
import SocialFeed from './pages/SocialFeed'
import Analytics from './pages/Analytics'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <main id="main-content" className="container" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/social" element={<SocialFeed />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<section className="empty-state"><h1>Page not found</h1><p>Let’s get you back to discovering.</p><Link className="button primary" to="/">Back to home</Link></section>} />
        </Routes>
      </main>
      <footer className="site-footer container"><Link className="brand" to="/">SmartRec<span className="brand-dot">.</span></Link><span>Behavior. Insight. Discovery.</span><span>Recommendation simulation platform</span></footer>
    </BrowserRouter>
  )
}

