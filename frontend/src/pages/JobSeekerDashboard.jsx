import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import klusterAPI from '../services/api'


// Simple SVG Icons
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CameraIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const SparklesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const ZapIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const HeartIcon = () => (
  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
)

const ActivityIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const JobSeekerDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [interestedSignals, setInterestedSignals] = useState([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')


useEffect(() => {
  const loadDashboard = async () => {
    const storedUser = localStorage.getItem('kluster_user')
    if (!storedUser) {
      navigate('/login')
      return
    }
    
    const userData = JSON.parse(storedUser)
    if (userData.role !== 'job_seeker') {
      navigate('/login')
      return
    }
    
    setUser(userData)
    
    try {
      const dashboard = await klusterAPI.getWorkerDashboard(userData.id)
      setProfileData(dashboard)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    }
  }
  
  loadDashboard()
}, [navigate])
  // Opportunity signals (no cluster names exposed)
  const opportunitySignals = [
    {
      id: 1,
      title: 'Tailoring demand rising',
      location: 'Yaba & Surrounding',
      category: 'Tailoring',
      intensity: 'High',
      description: 'Growing clusters are looking for experienced tailors',
      action: 'Express Interest'
    },
    {
      id: 2,
      title: 'Dispatch riders needed',
      location: 'Lekki & Ikeja',
      category: 'Logistics',
      intensity: 'Growing',
      description: 'Delivery clusters expanding their teams',
      action: 'Join Opportunity Pool'
    },
    {
      id: 3,
      title: 'Phone repair activity increased',
      location: 'Computer Village',
      category: 'Tech Repair',
      intensity: 'Rising',
      description: 'Repair clusters seeing higher customer demand',
      action: 'Make Profile Visible'
    },
    {
      id: 4,
      title: 'Fashion clusters seeking apprentices',
      location: 'Island & Mainland',
      category: 'Fashion',
      intensity: 'Emerging',
      description: 'Learn while working with established designers',
      action: 'Express Interest'
    }
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const handleExpressInterest = (signalId, signalTitle) => {
    if (!interestedSignals.includes(signalId)) {
      setInterestedSignals([...interestedSignals, signalId])
      setToastMessage(`Interest expressed in: ${signalTitle}`)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading your opportunities...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 pb-24">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {getGreeting()}, {profileData.name} 👋
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-600 font-medium">{profileData.trade}</span>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1">
                  <LocationIcon />
                  <span className="text-gray-500 text-sm">{profileData.location}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <SparklesIcon />
                Your profile is active in the Kluster opportunity network
              </p>
            </div>
            <Link to="/edit-profile" className="p-2 text-gray-400 hover:text-teal-600 transition">
              <EditIcon />
            </Link>
          </div>
        </motion.div>

        {/* Profile Strength Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserIcon />
              <span className="font-semibold text-gray-800">Profile Strength</span>
            </div>
            <span className="text-teal-600 font-semibold">{profileData.profileStrength}%</span>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
            <div 
              className="bg-teal-600 rounded-full h-2 transition-all duration-500"
              style={{ width: `${profileData.profileStrength}%` }}
            ></div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="flex items-center gap-1.5">
              <CheckCircleIcon />
              <span className="text-sm text-green-600">{profileData.availability}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-teal-500"></div>
              <span className="text-sm text-gray-600">{profileData.skillLevel}</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 mt-3">
            Complete your profile to improve visibility to active clusters
          </p>
        </motion.div>

        {/* Opportunity Signals Section - MAIN SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <ZapIcon />
            <h2 className="text-lg font-semibold text-gray-800">Opportunity Signals</h2>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          
          <div className="space-y-3">
            {opportunitySignals.map((signal, idx) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className={`bg-white rounded-xl p-4 border transition-all ${
                  interestedSignals.includes(signal.id)
                    ? 'border-teal-300 bg-teal-50/30'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{signal.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <LocationIcon />
                      <span className="text-xs text-gray-500">{signal.location}</span>
                    </div>
                  </div>
                  <div className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${signal.intensity === 'High' ? 'bg-orange-100 text-orange-700' : ''}
                    ${signal.intensity === 'Growing' ? 'bg-teal-100 text-teal-700' : ''}
                    ${signal.intensity === 'Rising' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${signal.intensity === 'Emerging' ? 'bg-gray-100 text-gray-600' : ''}
                  `}>
                    {signal.intensity}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{signal.description}</p>
                
                {interestedSignals.includes(signal.id) ? (
                  <div className="flex items-center gap-2 text-teal-600 text-sm">
                    <CheckCircleIcon />
                    <span>Interest expressed ✓</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleExpressInterest(signal.id, signal.title)}
                    className="w-full py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition"
                  >
                    {signal.action} →
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Matching & Visibility Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-teal-50 to-teal-100/30 rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <EyeIcon />
            <h2 className="font-semibold text-gray-800">Your Visibility</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-2xl font-bold text-gray-800">{profileData.recommendationPools}</div>
              <div className="text-xs text-gray-600">Active recommendation pools</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-teal-600">{profileData.profileViews}</div>
              <div className="text-xs text-gray-600">Cluster profile views</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-600">Visibility score</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-teal-600">{profileData.visibilityScore}%</span>
              <span className="text-xs text-green-600">{profileData.visibilityIncrease}</span>
            </div>
          </div>
          
          <div className="w-full bg-white/50 rounded-full h-1.5 mt-2">
            <div 
              className="bg-teal-600 rounded-full h-1.5 transition-all"
              style={{ width: `${profileData.visibilityScore}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            Your profile is being surfaced to clusters looking for {profileData.trade}s
          </p>
        </motion.div>

        {/* Portfolio Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CameraIcon />
              <h2 className="text-lg font-semibold text-gray-800">Your Work</h2>
            </div>
            <button className="text-teal-600 text-sm font-medium">+ Add</button>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {profileData.portfolio.map((item) => (
              <div 
                key={item.id}
                className="aspect-square bg-gray-100 rounded-xl flex flex-col items-center justify-center border border-gray-200 hover:border-teal-300 transition cursor-pointer"
              >
                <CameraIcon />
                <span className="text-xs text-gray-500 mt-2 text-center px-1">{item.title}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <ActivityIcon />
            <h2 className="font-semibold text-gray-800">Recent Activity</h2>
          </div>
          
          <div className="space-y-3">
            {profileData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-gray-700 text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                </div>
                {activity.type === 'view' && <EyeIcon />}
                {activity.type === 'interest' && <HeartIcon />}
                {activity.type === 'upload' && <CameraIcon />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm z-50 flex items-center gap-2"
            >
              <CheckCircleIcon />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 max-w-2xl mx-auto"
      >
        <div className="flex gap-3">
          <Link 
            to="/edit-profile"
            className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium text-center hover:bg-gray-50 transition"
          >
            Edit Profile
          </Link>
          <Link 
            to="/update-availability"
            className="flex-1 py-3 border border-teal-600 text-teal-700 rounded-xl font-medium text-center hover:bg-teal-50 transition"
          >
            Update Status
          </Link>
          <button 
            className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition"
          >
            + Add Work
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default JobSeekerDashboard