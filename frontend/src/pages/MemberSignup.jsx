import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import klusterAPI from '../../services/api'

// Simple SVG Icons
const PhoneIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const EnvelopeIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const LockIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const CameraIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const MemberSignup = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: find account, 2: activate account
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [foundProfile, setFoundProfile] = useState(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    profileImage: null
  })
  const [isActivating, setIsActivating] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Mock profiles that would come from backend based on phone number
  const mockProfiles = {
    '08031234567': {
      name: 'Folake Musa',
      cluster: 'Yaba Tailors Guild',
      clusterId: 'CLU-002',
      location: 'Yaba, Lagos',
      role: 'Tailor',
      phone: '08031234567',
      joinDate: '2024-01-15'
    },
    '08059876543': {
      name: 'Chimamanda Nwosu',
      cluster: 'Computer Village Phone Association',
      clusterId: 'CLU-001',
      location: 'Ikeja, Lagos',
      role: 'Phone Repair Technician',
      phone: '08059876543',
      joinDate: '2024-01-20'
    },
    '08051122334': {
      name: 'John Okonkwo',
      cluster: 'Abuja Tailors Cooperative',
      clusterId: 'CLU-003',
      location: 'Wuse, Abuja',
      role: 'Master Tailor',
      phone: '08051122334',
      joinDate: '2024-01-10'
    }
  }

const handleSubmit = async (e) => {
  e.preventDefault()
  if (!agreeTerms) return
  if (!validatePassword()) return
  
  setIsSubmitting(true)

  try {
    const response = await klusterAPI.registerCluster({
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
      groupName: formData.groupName,
      groupType: formData.groupType,
      memberCount: formData.memberCount,
      location: formData.location,
      verificationId: formData.verificationId,
      verificationType: formData.verificationType
    })
    
    if (response.success) {
      localStorage.setItem('kluster_user', JSON.stringify(response.user))
      localStorage.setItem('kluster_token', response.token)
      navigate('/dashboard/cluster', { state: { newCluster: true } })
    }
  } catch (error) {
    alert('Registration failed. Please try again.')
  } finally {
    setIsSubmitting(false)
  }
}

  const validatePassword = () => {
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match')
      return false
    }
    return true
  }

  const handleFindAccount = async () => {
  setIsSearching(true)
  setError('')

  try {
    const profile = await klusterAPI.lookupMemberByPhone(phoneNumber)
    
    if (profile) {
      setFoundProfile(profile)
      setStep(2)
    } else {
      setError('No account found. Ask your cluster leader to add you first.')
    }
  } catch (error) {
    setError('Unable to find account. Please try again.')
  } finally {
    setIsSearching(false)
  }
}
// Activate account
const handleActivateAccount = async () => {
  if (!validatePassword()) return

  setIsActivating(true)

  try {
    const response = await klusterAPI.memberActivate({
      phone: foundProfile.phone,
      email: formData.email,
      password: formData.password
    })
    
    if (response.user) {
      localStorage.setItem('kluster_user', JSON.stringify(response.user))
      localStorage.setItem('kluster_token', response.token)
      navigate(`/member/${response.user.id}`)
    }
  } catch (error) {
    setActivationError('Activation failed. Please try again.')
  } finally {
    setIsActivating(false)
  }
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      <Navbar />
      
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-16">
        
        {/* Step 1: Find Account */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center">
                    <span className="text-3xl font-bold text-teal-700">K</span>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  Already added to a cluster?
                </h1>
                <p className="text-gray-500 text-sm">
                  Enter your phone number to find and activate your account
                </p>
              </div>

              {/* Phone Input Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <PhoneIcon />
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0803 123 4567"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
                        onKeyPress={(e) => e.key === 'Enter' && handleFindAccount()}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Enter the phone number your cluster leader used to add you
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-3"
                    >
                      <p className="text-red-600 text-sm">{error}</p>
                    </motion.div>
                  )}

                  <button
                    onClick={handleFindAccount}
                    disabled={isSearching}
                    className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Finding your account...
                      </>
                    ) : (
                      'Find My Account →'
                    )}
                  </button>
                </div>
              </div>

              {/* Help Text */}
              <p className="text-center text-xs text-gray-400">
                Don't have a cluster?{' '}
                <Link to="/signup" className="text-teal-600 hover:underline">
                  Register as a cluster leader →
                </Link>
              </p>
            </motion.div>
          )}

          {/* Step 2: Activate Account */}
          {step === 2 && foundProfile && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-1.5 mb-4">
                  <CheckCircleIcon />
                  <span className="text-green-700 text-xs font-semibold">PROFILE FOUND</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  Complete your setup
                </h1>
                <p className="text-gray-500 text-sm">
                  We found your cluster profile. Activate your account to get started.
                </p>
              </div>

              {/* Profile Preview Card */}
              <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-teal-200 flex items-center justify-center">
                    <span className="text-xl font-semibold text-teal-700">
                      {foundProfile.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{foundProfile.name}</h3>
                    <p className="text-sm text-gray-600">{foundProfile.cluster}</p>
                    <p className="text-xs text-gray-500 mt-1">{foundProfile.role} • {foundProfile.location}</p>
                  </div>
                </div>
              </div>

              {/* Activation Form */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-gray-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <EnvelopeIcon />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Create Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <LockIcon />
                      </div>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Minimum 6 characters"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <LockIcon />
                      </div>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Confirm your password"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {passwordError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm flex items-center gap-1"
                    >
                      <span>⚠️</span> {passwordError}
                    </motion.div>
                  )}

                  {/* Optional Profile Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture <span className="text-gray-400">(Optional)</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-teal-300 transition cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" id="profileImage" />
                      <label htmlFor="profileImage" className="cursor-pointer block">
                        <CameraIcon />
                        <span className="text-teal-600 text-sm font-medium block mt-1">Upload photo</span>
                        <p className="text-xs text-gray-400 mt-1">Show your face to your community</p>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleActivateAccount}
                    disabled={isActivating}
                    className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                  >
                    {isActivating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Activating Account...
                      </>
                    ) : (
                      'Activate Account →'
                    )}
                  </button>
                </div>
              </div>

              <p className="text-center text-xs text-gray-400">
                By activating, you agree to Kluster's Terms of Service
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MemberSignup