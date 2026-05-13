import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const DemandSignals = () => {
  const [selectedLocation, setSelectedLocation] = useState('LAGOS')
  const [timeRange, setTimeRange] = useState('week') // day, week, month
  const [selectedSignal, setSelectedSignal] = useState(null)

  // Mock demand signals data
  const demandSignals = {
    surges: [
      { id: 1, location: 'IKEJA', sector: 'Phone Repair', intensity: 92, workers: 12, growth: '+34%' },
      { id: 2, location: 'YABA', sector: 'Tailoring', intensity: 87, workers: 8, growth: '+28%' },
      { id: 3, location: 'LEKKI', sector: 'Dispatch', intensity: 78, workers: 15, growth: '+45%' },
      { id: 4, location: 'SURULERE', sector: 'Catering', intensity: 71, workers: 6, growth: '+22%' },
      { id: 5, location: 'ABULE-EGBA', sector: 'Auto Repair', intensity: 65, workers: 4, growth: '+18%' },
    ],
    activeNodes: [
      { id: 1, name: 'SEYI', role: 'Mobile Technician', location: 'Ikeja', status: 'active', demand: 'high' },
      { id: 2, name: 'CHUKWU', role: 'Hardware Specialist', location: 'Ikeja', status: 'active', demand: 'critical' },
      { id: 3, name: 'MNEAKA', role: 'Master Tailor', location: 'Yaba', status: 'active', demand: 'high' },
      { id: 4, name: 'IFEOMA', role: 'Custom Fits', location: 'Yaba', status: 'active', demand: 'bulk_orders' },
      { id: 5, name: 'CHIMEDU', role: 'Dispatch Rider', location: 'Lekki', status: 'active', demand: 'high' },
      { id: 6, name: 'AMARA', role: 'Express Delivery', location: 'Lekki', status: 'active', demand: 'urgent' },
    ],
    overview: {
      members: 1240,
      transactions: 8452,
      totalVolume: '₦12.4M',
      activeClusters: 14,
      jobMatches: 47
    },
    financialProducts: {
      available: ['Micro-Loans', 'Savings Plans', 'Group Insurance'],
      eligibleMembers: 342,
      totalDisbursed: '₦2.8M'
    }
  }

  const getIntensityColor = (intensity) => {
    if (intensity >= 90) return 'bg-danger'
    if (intensity >= 75) return 'bg-secondary-orange'
    if (intensity >= 60) return 'bg-secondary-gold'
    return 'bg-primary'
  }

  const getDemandBadge = (demand) => {
    switch(demand) {
      case 'critical': return <span className="bg-danger/20 text-danger text-xs px-2 py-0.5 rounded-full">Critical</span>
      case 'high': return <span className="bg-secondary-orange/20 text-secondary-orange text-xs px-2 py-0.5 rounded-full">High Demand</span>
      case 'bulk_orders': return <span className="bg-secondary-gold/20 text-secondary-gold-dark text-xs px-2 py-0.5 rounded-full">Bulk Orders</span>
      case 'urgent': return <span className="bg-danger/20 text-danger text-xs px-2 py-0.5 rounded-full">Urgent</span>
      default: return <span className="bg-primary/20 text-primary-deep text-xs px-2 py-0.5 rounded-full">Active</span>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-light/10">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-secondary-slate/60 mb-2">
                <Link to="/" className="hover:text-primary">Home</Link>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-secondary-slate">Demand Signals</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-secondary-slate">
                Demand <span className="bg-gradient-to-r from-secondary-orange to-secondary-gold bg-clip-text text-transparent">Signals</span>
              </h1>
              <p className="text-secondary-slate/60 mt-1">
                Localized intelligence map for Lagos cluster activity
              </p>
            </div>
            
            <button className="bg-gradient-to-r from-primary-deep to-primary text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              GENERATE INSIGHT
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6 bg-white rounded-full p-1 inline-flex shadow-sm border border-gray-100">
          {['day', 'week', 'month'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition capitalize ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'text-secondary-slate/60 hover:text-secondary-slate'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Active Surges & Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Surges Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-secondary-orange to-secondary-gold px-6 py-4">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Active Surges
                </h2>
                <p className="text-white/80 text-sm">Real-time demand hotspots across Lagos</p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {demandSignals.surges.map((surge) => (
                    <div
                      key={surge.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:shadow-md transition cursor-pointer"
                      onClick={() => setSelectedSignal(surge)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-secondary-slate">{surge.location}</span>
                          <span className="text-xs text-secondary-slate/60">{surge.sector}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-success">{surge.growth} growth</span>
                          <span className="text-secondary-slate/60">{surge.workers} workers needed</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`w-16 h-16 rounded-full ${getIntensityColor(surge.intensity)} bg-opacity-20 flex items-center justify-center`}>
                          <span className={`text-lg font-bold ${getIntensityColor(surge.intensity).replace('bg-', 'text-')}`}>
                            {surge.intensity}%
                          </span>
                        </div>
                        <p className="text-xs text-secondary-slate/60 mt-1">intensity</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lagos Network Map Visualization */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-deep to-primary px-6 py-4">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  LAGOS NETWORK
                </h2>
                <p className="text-primary-light text-sm">Cluster intelligence map</p>
              </div>
              <div className="p-6">
                {/* Active Nodes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {demandSignals.activeNodes.map((node) => (
                    <div
                      key={node.id}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:shadow-md transition bg-white"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-secondary-slate">{node.name}</span>
                          {getDemandBadge(node.demand)}
                        </div>
                        <p className="text-xs text-secondary-slate/60">{node.role}</p>
                        <p className="text-xs text-primary-deep mt-1">{node.location}</p>
                      </div>
                      <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                        <span className="text-xs text-secondary-slate/60 ml-2">Active</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map Legend */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-secondary-slate mb-2">ACTIVITY LEGEND</h4>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-xs text-secondary-slate/70">TECH & REPAIR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-secondary-gold"></div>
                      <span className="text-xs text-secondary-slate/70">ARTISANAL</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-secondary-orange"></div>
                      <span className="text-xs text-secondary-slate/70">LOGISTICS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Overview & Insights */}
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-secondary-slate flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  OVERVIEW
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-secondary-slate/60">MEMBERS</span>
                  <span className="text-2xl font-bold text-secondary-slate">{demandSignals.overview.members.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-slate/60">TRANSACTIONS</span>
                  <span className="text-2xl font-bold text-secondary-slate">{demandSignals.overview.transactions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-slate/60">TOTAL VOLUME</span>
                  <span className="text-2xl font-bold text-secondary-gold">{demandSignals.overview.totalVolume}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-slate/60">ACTIVE CLUSTERS</span>
                  <span className="text-xl font-bold text-primary">{demandSignals.overview.activeClusters}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-secondary-slate/60">JOB MATCHES AVAILABLE</span>
                  <span className="text-xl font-bold text-secondary-orange">{demandSignals.overview.jobMatches}</span>
                </div>
              </div>
            </div>

            {/* Demand Signals Summary */}
            <div className="bg-gradient-to-br from-secondary-orange/5 to-secondary-gold/5 rounded-2xl shadow-lg border border-secondary-orange/20 overflow-hidden">
              <div className="bg-gradient-to-r from-secondary-orange to-secondary-gold px-6 py-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  DEMAND SIGNALS
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-slate/70">Total Active Signals</span>
                    <span className="font-bold text-secondary-orange">{demandSignals.surges.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-slate/70">Highest Intensity</span>
                    <span className="font-bold text-danger">92% (Ikeja)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-slate/70">Fastest Growing</span>
                    <span className="font-bold text-success">Lekki (+45%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Products */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-secondary-slate flex items-center gap-2">
                  <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  FINANCIAL PRODUCTS
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-secondary-slate/60 mb-2">Available Products</p>
                    <div className="flex flex-wrap gap-2">
                      {demandSignals.financialProducts.available.map((product, idx) => (
                        <span key={idx} className="bg-success/10 text-success-dark text-xs px-2 py-1 rounded-full">
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-secondary-slate/70">Eligible Members</span>
                    <span className="font-bold text-success">{demandSignals.financialProducts.eligibleMembers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-slate/70">Total Disbursed</span>
                    <span className="font-bold text-primary">{demandSignals.financialProducts.totalDisbursed}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-primary/5 to-primary-deep/5 rounded-2xl shadow-lg border border-primary/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="font-bold text-secondary-slate">AI INSIGHTS</h3>
              </div>
              <p className="text-sm text-secondary-slate/70">
                Based on current demand signals, prioritize resource allocation to <strong className="text-primary">Ikeja</strong> and <strong className="text-primary">Yaba</strong> clusters. Expected 40% increase in opportunities over next 7 days.
              </p>
              <button className="mt-3 text-xs text-primary hover:underline">
                View detailed analysis →
              </button>
            </div>
          </div>
        </div>

        {/* Selected Signal Modal */}
        {selectedSignal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-secondary-slate">{selectedSignal.location}</h3>
                <button
                  onClick={() => setSelectedSignal(null)}
                  className="text-secondary-slate/60 hover:text-secondary-slate"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-secondary-slate/60">Sector</span>
                  <span className="font-medium">{selectedSignal.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-slate/60">Demand Intensity</span>
                  <span className={`font-bold ${selectedSignal.intensity >= 90 ? 'text-danger' : 'text-secondary-orange'}`}>
                    {selectedSignal.intensity}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-slate/60">Growth Rate</span>
                  <span className="text-success">{selectedSignal.growth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-slate/60">Workers Needed</span>
                  <span className="font-bold">{selectedSignal.workers}</span>
                </div>
                <div className="pt-4">
                  <button className="w-full bg-primary text-white py-2 rounded-lg font-semibold">
                    View Matching Workers
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DemandSignals