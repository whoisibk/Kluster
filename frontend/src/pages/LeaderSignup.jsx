import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'
import klusterAPI from '../services/api'

const LeaderSignup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    groupName: '',
    groupType: '',
    memberCount: '',
    location: '',
    verificationId: '',
    verificationType: 'NIN'
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const groupTypes = [
    'Tailors Association',
    'Market Traders Association',
    'Artisan Guild',
    'Ajo/Savings Circle',
    'Cooperative Society',
    'Trade Union',
    'Other'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear password error when user types
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('')
    }
  }

  // Generate a random member ID
  const generateMemberId = () => {
    const prefixes = ['TRO', 'KLU', 'MRK', 'ART', 'AJU']
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const randomNum = Math.floor(Math.random() * 9000) + 1000
    const suffix = ['ALPHA', 'BETA', 'GAMMA', 'DELTA'][Math.floor(Math.random() * 4)]
    return `${randomPrefix}-${randomNum}-${suffix}`
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

  // In the handleSubmit function - update the navigation
// In LeaderSignup.jsx - This would send data to backend
const handleSubmit = async (e) => {
  e.preventDefault()
  if (!agreeTerms) return
  if (!validatePassword()) return
  
  setIsSubmitting(true)

  try {
    const response = await klusterAPI.signup({
      full_name: formData.fullName,  // Note: backend might expect snake_case
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
      group_name: formData.groupName,
      group_type: formData.groupType,
      member_count: formData.memberCount,
      location: formData.location,
      verification_id: formData.verificationId,
      verification_type: formData.verificationType
    })
    
    if (response.user) {
      localStorage.setItem('kluster_user', JSON.stringify(response.user))
      localStorage.setItem('kluster_token', response.token)
      navigate('/dashboard/cluster')
    }
  } catch (error) {
    console.error('Registration failed:', error)
    alert('Registration failed. Please try again.')
  } finally {
    setIsSubmitting(false)
  }
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-light/10">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary-deep/10 rounded-full px-4 py-1.5 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-primary-deep text-xs font-semibold">CLUSTER LEADER REGISTRATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-secondary-slate mb-3">
            Register Your <span className="bg-gradient-to-r from-primary-deep to-primary bg-clip-text text-transparent">Community</span>
          </h1>
          <p className="text-secondary-slate/60 max-w-2xl mx-auto">
            One cluster leader brings hundreds of members. Start your economic journey today.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</div>
              <span className="ml-2 text-sm font-medium text-secondary-slate">Info</span>
            </div>
            <div className="w-12 h-0.5 bg-primary/30"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</div>
              <span className="ml-2 text-sm font-medium text-secondary-slate">Group</span>
            </div>
            <div className="w-12 h-0.5 bg-primary/30"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">3</div>
              <span className="ml-2 text-sm font-medium text-secondary-slate">Security</span>
            </div>
            <div className="w-12 h-0.5 bg-primary/30"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">4</div>
              <span className="ml-2 text-sm font-medium text-secondary-slate">Verify</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-up">
          <div className="bg-gradient-to-r from-primary-deep to-primary px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cluster Leader Signup
            </h2>
            <p className="text-primary-light text-sm mt-1">Join the invisible economy revolution</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-secondary-slate mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-slate mb-2">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Oluwaseun Adebayo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-slate mb-2">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="0803 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-slate mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="leader@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-slate mb-2">
                    City/Location <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Ikeja, Lagos"
                  />
                </div>
              </div>
            </div>

            {/* Group Information Section */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-secondary-slate mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-secondary-orange/10 text-secondary-orange flex items-center justify-center text-sm font-bold">2</span>
                Group Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-slate mb-2">
                    Guild/Group Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="groupName"
                    required
                    value={formData.groupName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Oba Akran Phone Repair Association"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-slate mb-2">
                    Group Type <span className="text-danger">*</span>
                  </label>
                  <select
                    name="groupType"
                    required
                    value={formData.groupType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white"
                  >
                    <option value="">Select group type</option>
                    {groupTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-slate mb-2">
                    Estimated Members <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="memberCount"
                    required
                    value={formData.memberCount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="50"
                  />
                </div>
              </div>
            </div>

            {/* Security Section - NEW */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-secondary-slate mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-secondary-gold/10 text-secondary-gold flex items-center justify-center text-sm font-bold">3</span>
                Create Password
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-slate mb-2">
                    Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Minimum 6 characters"
                  />
                  <p className="text-xs text-secondary-slate/50 mt-1">
                    Use at least 6 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-slate mb-2">
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
              {passwordError && (
                <div className="mt-2 text-danger text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {passwordError}
                </div>
              )}
            </div>

            {/* Verification Section */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-secondary-slate mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">4</span>
                Identity Verification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-slate mb-2">
                    Verification Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="verificationType"
                        value="NIN"
                        checked={formData.verificationType === 'NIN'}
                        onChange={handleChange}
                        className="text-primary focus:ring-primary"
                      />
                      <span>NIN</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="verificationType"
                        value="BVN"
                        checked={formData.verificationType === 'BVN'}
                        onChange={handleChange}
                        className="text-primary focus:ring-primary"
                      />
                      <span>BVN</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-slate mb-2">
                    {formData.verificationType} Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="verificationId"
                    required
                    value={formData.verificationId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder={formData.verificationType === 'NIN' ? '12345678901' : '12345678901'}
                  />
                </div>
              </div>
              <p className="text-xs text-secondary-slate/50 mt-2">
                Your information is encrypted and secure. Used only for KYC compliance.
              </p>
            </div>

            {/* Terms and Submit */}
            <div className="pt-4 border-t border-gray-100">
              <label className="flex items-center gap-3 mb-6">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <span className="text-sm text-secondary-slate/80">
                  I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and 
                  <a href="#" className="text-primary hover:underline"> Privacy Policy</a>
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary-deep to-primary hover:from-primary-deep/90 hover:to-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Your Cluster...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Create Cluster & Get Started
                  </>
                )}
              </button>

              <p className="text-center text-xs text-secondary-slate/50 mt-4">
                By creating a cluster, you agree to our data processing terms. 
                Your community will receive Squad virtual accounts automatically.
              </p>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-secondary-slate/60">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in here →
            </Link>
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-primary-deep/5 rounded-xl p-4 border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-primary-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-secondary-slate text-sm">What happens next?</h4>
              <p className="text-secondary-slate/60 text-xs mt-1">
                After registration, you'll be taken to your member profile where you can:
                • View your Activity Score and Cluster Rank
                • Track financial qualifications as they build
                • Invite members to join your cluster
                • Monitor transaction activity and growth signals
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaderSignup