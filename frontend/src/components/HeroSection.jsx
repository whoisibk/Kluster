const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-primary-light/10 py-20 lg:py-28">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary-deep/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-primary-deep text-sm font-semibold">PROTOTYPE: 1.0 ACTIVE — LARGE REVENUE</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-secondary-slate max-w-4xl mx-auto animate-slide-up">
          Making Nigeria's{' '}
          <span className="bg-gradient-to-r from-primary-deep via-primary to-secondary-orange bg-clip-text text-transparent">
            Informal Economy
          </span>{' '}
          Visible.
        </h1>

        {/* Description */}
        <p className="mt-6 text-lg text-secondary-slate/70 max-w-2xl mx-auto leading-relaxed">
          Kluster transforms transaction flows into economic identity, opportunity detection, and financial access. 
          We illuminate the hidden nodes of the market.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-primary hover:bg-primary-deep text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 group">
            <span>CREATE CLUSTER </span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <button className="border-2 border-primary/30 text-primary-deep hover:bg-primary/5 px-8 py-3 rounded-full font-semibold transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>WATCH DEMO</span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default HeroSection