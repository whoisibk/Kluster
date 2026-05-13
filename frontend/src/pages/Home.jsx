import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import StatsSection from '../components/StatsSection'
import ArchitectureSection from '../components/ArchitectureSection'

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <ArchitectureSection />
        
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
          <p>© 2025 Kluster — Making Nigeria's Informal Economy Visible</p>
          <p className="mt-2">Intelligent economic platform connecting informal traders, job seekers, and financial services</p>
        </div>
      </footer>
    </div>
  )
}

export default Home