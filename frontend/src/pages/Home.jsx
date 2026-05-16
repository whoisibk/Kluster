import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import StatsSection from '../components/StatsSection'
import ArchitectureSection from '../components/ArchitectureSection'
import { FaHeart } from "react-icons/fa";
import { Link } from 'react-router-dom'
import { MdChevronRight } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";





const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* // Add this section to attract job seekers */}

{/* Job Seeker Section */}

        <HeroSection />
        <StatsSection />
        <ArchitectureSection />
        <section className="py-20 bg-gradient-to-br from-teal-50 via-white to-orange-50/30">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <div className="inline-flex items-center gap-2 bg-teal-100 rounded-full px-4 py-1.5 mb-4">
          <FaHeart />
          <span className="text-teal-700 text-sm font-medium">For Workers</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          Find <span className="text-teal-600">Opportunities</span> Not Jobs
        </h2>
        <p className="text-gray-600 text-lg mb-6">
          Create your work profile and get discovered by growing business clusters.
          No applications. No job boards. Just real opportunities finding you.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link 
            to="/create-profile"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-teal-700 transition shadow-lg"
          >
            Create Work Profile
            <MdChevronRight />
          </Link>
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-50 transition"
          >
            View Dashboard
          </Link>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs">👩</div>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs">👨</div>
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs">👩</div>
          </div>
          <p className="text-sm text-gray-500">Join 1,200+ workers already connected</p>
        </div>
      </div>
      
      <div className="relative">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <FaUserCircle />
            </div>
            <div>
              <div className="font-semibold text-gray-800">Amina Bello</div>
              <div className="text-sm text-gray-500">Tailor • Yaba, Lagos</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-sm font-medium text-orange-700">🔥 Tailoring demand rising</div>
              <div className="text-xs text-gray-600">Yaba & surrounding area</div>
            </div>
            <div className="bg-teal-50 rounded-lg p-3">
              <div className="text-sm font-medium text-teal-700">👁️ Profile viewed by 5 clusters</div>
              <div className="text-xs text-gray-600">This week</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
        
        {/* Optional additional section for further content */}
        <section className="py-16 bg-primary-deep/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <blockquote className="text-xl italic text-secondary-slate/80 max-w-3xl mx-auto">
              "The informal economy isn't broken — it's invisible. Kluster makes it visible, 
              creditworthy, and investable."
            </blockquote>
            <div className="mt-6 text-primary-deep font-semibold">— Kluster Economic Intelligence Layer</div>
          </div>
        </section>
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-secondary-slate text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm opacity-80">
          <p>© 2026 Team Hacktivity · Kluster Inc. — Making Nigeria's Informal Economy Visible</p>
          <p className="mt-2">Intelligent economic platform connecting informal traders, job seekers, and financial services</p>
        </div>
      </footer>
    </div>
  )
}

export default Home