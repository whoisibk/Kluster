import { useState } from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-deep to-primary rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="font-bold text-2xl tracking-tight text-secondary-slate">KLUSTER</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold bg-gray-100 text-primary-deep px-2 py-0.5 rounded-full uppercase tracking-wide">
              Econ Intel
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {['Network', 'Intelligence'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-secondary-slate/80 hover:text-primary-deep font-medium text-sm transition-colors duration-200"
              >
                {item}
              </a>
            ))}
            
            {/* Login Button */}
            <Link
              to="/login"
              className="text-primary-deep hover:text-primary font-medium text-sm transition-colors duration-200 border border-primary-deep/30 px-4 py-1.5 rounded-full"
            >
              Sign In
            </Link>
            
            {/* Create Cluster Button */}
            <Link
              to="/leader-signup"
              className="bg-gradient-to-r from-primary-deep to-primary hover:from-primary-deep/90 hover:to-primary/90 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Cluster
            </Link>
            
            {/* Join Cluster Button */}
            <Link
              to="/member-signup"
              className="bg-secondary-orange hover:bg-secondary-orange/90 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Join Cluster
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-secondary-slate hover:text-primary-deep focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            {['Network', 'Intelligence'].map((item) => (
              <a
                key={item}
                href="#"
                className="block py-2 text-secondary-slate hover:text-primary-deep font-medium"
              >
                {item}
              </a>
            ))}
            
            {/* Mobile Login */}
            <Link
              to="/login"
              className="block w-full text-center mt-3 text-primary-deep border border-primary-deep/30 px-5 py-2 rounded-full text-sm font-semibold"
            >
              Sign In
            </Link>
            
            {/* Mobile Create Cluster */}
            <Link
              to="/leader-signup"
              className="block w-full text-center mt-3 bg-gradient-to-r from-primary-deep to-primary text-white px-5 py-2 rounded-full text-sm font-semibold"
            >
              Create Cluster
            </Link>
            
            {/* Mobile Join Cluster */}
            <Link
              to="/member-signup"
              className="block w-full text-center mt-3 bg-secondary-orange text-white px-5 py-2 rounded-full text-sm font-semibold"
            >
              Join Cluster
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar