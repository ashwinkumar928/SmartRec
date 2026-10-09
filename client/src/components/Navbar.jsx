import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="container navbar">
        <NavLink to="/" className="brand" aria-label="SmartRec home"><span className="brand-mark" aria-hidden="true">s</span>SmartRec<span className="brand-dot">.</span></NavLink>
        <nav aria-label="Main navigation">
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/social">Social</NavLink>
          <NavLink to="/analytics">Analytics</NavLink>
        </nav>
        <span className="environment-badge"><span />Simulation workspace</span>
      </div>
    </header>
  )
}

