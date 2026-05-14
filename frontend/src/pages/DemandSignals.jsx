import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import klusterAPI from '../services/api'


// Simple SVG Icons
const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const BriefcaseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const DemandSignals = () => {
  const navigate = useNavigate()
  const [selectedLocation, setSelectedLocation] = useState('LAGOS')
  const [selectedSignal, setSelectedSignal] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - would come from API
  const demandData = {
    surges: [
      { 
        id: 1, 
        location: 'IKEJA', 
        sector: 'Phone Repair', 
        intensity: 'High',
        workers: 12,
        interestedJobSeekers: [
          { id: 'JS-001', name: 'Chidi Okafor', skill: 'Phone Repair', experience: '3 years', rating: 4.8 },
          { id: 'JS-002', name: 'Amina Bello', skill: 'Electronics', experience: '2 years', rating: 4.5 },
          { id: 'JS-003', name: 'Femi Adeyemi', skill: 'Mobile Technician', experience: '5 years', rating: 4.9 }
        ]
      },
      { 
        id: 2, 
        location: 'YABA', 
        sector: 'Tailoring', 
        intensity: 'High',
        workers: 8,
        interestedJobSeekers: [
          { id: 'JS-004', name: 'Folake Musa', skill: 'Tailoring', experience: '4 years', rating: 4.7 },
          { id: 'JS-005', name: 'Ngozi Eze', skill: 'Fashion Design', experience: '6 years', rating: 4.9 },
          { id: 'JS-006', name: 'Tunde Bakare', skill: 'Pattern Making', experience: '2 years', rating: 4.3 }
        ]
      },
      { 
        id: 3, 
        location: 'LEKKI', 
        sector: 'Dispatch', 
        intensity: 'Medium',
        workers: 15,
        interestedJobSeekers: [
          { id: 'JS-007', name: 'Emeka Nwosu', skill: 'Delivery', experience: '2 years', rating: 4.4 },
          { id: 'JS-008', name: 'Blessing John', skill: 'Rider', experience: '3 years', rating: 4.6 }
        ]
      }
    ]
  }


useEffect(() => {
  const fetchSignals = async () => {
    setIsLoading(true)
    try {
      const data = await klusterAPI.getDemandSignals(selectedLocation)
      setDemandData(data)
    } catch (error) {
      console.error('Failed to load demand signals:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  fetchSignals()
}, [selectedLocation])

// Express interest
const handleExpressInterest = async (signalId) => {
  const user = JSON.parse(localStorage.getItem('kluster_user'))
  
  try {
    await klusterAPI.expressInterest(signalId, user.id)
    setToastMessage('Interest expressed successfully!')
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  } catch (error) {
    alert('Failed to express interest. Please try again.')
  }
}

  const handleViewProfile = (jobSeeker) => {
    // Navigate to job seeker profile (you may need to create this page)
    navigate(`/job-seeker/${jobSeeker.id}`, { state: { jobSeeker } })
  }

  const getIntensityColor = (intensity) => {
    switch(intensity) {
      case 'High': return 'bg-orange-100 text-orange-700'
      case 'Medium': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-green-100 text-green-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                Demand Signals
              </h1>
              <p className="text-gray-500">
                Workers interested in opportunities in your area
              </p>
            </div>
            
            {/* Location Selector */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="LAGOS">Lagos</option>
              <option value="ABUJA">Abuja</option>
              <option value="PH">Port Harcourt</option>
            </select>
          </div>
        </div>

        {/* Demand Signals Grid */}
        <div className="space-y-6">
          {demandData.surges.map((signal, idx) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Signal Header */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-white font-bold text-lg">{signal.sector}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <LocationIcon />
                      <span className="text-teal-100 text-sm">{signal.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getIntensityColor(signal.intensity)}`}>
                      {signal.intensity} Demand
                    </span>
                    <span className="text-teal-100 text-sm">
                      {signal.workers} workers needed
                    </span>
                  </div>
                </div>
              </div>

              {/* Interested Job Seekers List */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <UserIcon />
                  Interested Workers ({signal.interestedJobSeekers.length})
                </h3>
                
                <div className="space-y-3">
                  {signal.interestedJobSeekers.map((jobSeeker) => (
                    <div 
                      key={jobSeeker.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                      onClick={() => handleViewProfile(jobSeeker)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <span className="text-teal-700 font-semibold">
                            {jobSeeker.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{jobSeeker.name}</div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <BriefcaseIcon />
                              {jobSeeker.skill}
                            </span>
                            <span className="text-xs text-gray-500">{jobSeeker.experience}</span>
                            <span className="text-xs text-orange-500">★ {jobSeeker.rating}</span>
                          </div>
                        </div>
                      </div>
                      <button className="text-teal-600 hover:text-teal-700">
                        <ChevronRightIcon />
                      </button>
                    </div>
                  ))}
                </div>

                {/* View All Link */}
                {signal.interestedJobSeekers.length > 0 && (
                  <button className="w-full mt-4 text-center text-sm text-teal-600 hover:text-teal-700 font-medium py-2">
                    View all interested workers →
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {demandData.surges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📡</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No demand signals yet</h3>
            <p className="text-gray-500">Check back later for opportunities in your area</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DemandSignals