import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import klusterAPI from '../services/api'
const Login = () => {
  const navigate = useNavigate()
  const [loginMethod, setLoginMethod] = useState('email')
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    verificationCode: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [error, setError] = useState('')

  // Get all registered users from sessionStorage
  const getRegisteredUsers = () => {
    const users = []
    // Check all sessionStorage keys that might contain user data
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key === 'kluster_user') {
        try {
          const user = JSON.parse(sessionStorage.getItem(key))
          if (user && user.email) {
            users.push(user)
          }
        } catch (e) {}
      }
    }
    return users
  }

  // Mock existing users (for demo purposes)
  const getMockUsers = () => {
    return {
      'tunde@kluster.com': {
        id: 'TRO-3892-ALPHA',
        name: 'Tunde Adebayo',
        role: 'cluster_leader',
        password: '123456',
        clusterId: 'CLU-001',
        clusterName: 'Oba Akran Phone Repair Association'
      },
      'chioma@kluster.com': {
        id: 'MBR-12345-ACTIVE',
        name: 'Chioma Okafor',
        role: 'member',
        password: '123456',
        clusterId: 'CLU-001',
        clusterName: 'Oba Akran Phone Repair Association'
      },
      'amina@kluster.com': {
        id: 'MBR-67890-RISING',
        name: 'Amina Bello',
        role: 'job_seeker',
        password: '123456',
        clusterId: null,
        clusterName: null
      }
    }
  }


const handleSubmit = async (e) => {
  e.preventDefault()
  setIsLoading(true)
  setError('')

  try {
    const response = await klusterAPI.login(formData.identifier, formData.password)
    sessionStorage.setItem('kluster_token', response.access_token)
    const payload = JSON.parse(atob(response.access_token.split('.')[1]))
    const meta = payload.user_metadata || {}
    const fullName = `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || formData.identifier

    // Detect role: try cluster leader first, then member
    try {
      const member = await klusterAPI.getMyProfile()
      if (member.role_in_cluster === 'leader') {
        sessionStorage.setItem('kluster_user', JSON.stringify({ role: 'cluster_leader', email: formData.identifier, name: fullName }))
        navigate('/dashboard/cluster')
      } else {
        sessionStorage.setItem('kluster_user', JSON.stringify({ role: 'member', email: formData.identifier, name: fullName }))
        navigate(`/member/${member.id}`)
      }
    } catch {
      try {
        await klusterAPI.getJobSeekerProfile()
        sessionStorage.setItem('kluster_user', JSON.stringify({ role: 'job_seeker', email: formData.identifier, name: fullName }))
        navigate('/dashboard/job-seeker')
      } catch {
        setError('Could not determine account type. Please contact support.')
      }
    }
  } catch (error) {
    setError('Invalid email or password')
  } finally {
    setIsLoading(false)
  }
}

  const handleSendVerificationCode = async () => {
    if (!formData.identifier) {
      setError('Please enter your email address')
      return
    }
    alert(`Verification code sent to ${formData.identifier}`)
    setShowVerification(true)
  }

  // Icons
  const EmailIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )

  const LockIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )

  const IdCardIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-4 0h4" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      <Navbar />
      
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-teal-100 rounded-full px-4 py-1.5 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
            </span>
            <span className="text-teal-700 text-xs font-semibold">WELCOME BACK</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Sign in to <span className="bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">Kluster</span>
          </h1>
          <p className="text-gray-500">
            Access your economic identity and opportunities
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-700 to-teal-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In Portal
            </h2>
            <p className="text-teal-100 text-sm mt-1">Cluster leaders, members & workers</p>
          </div>

          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('email')
                setError('')
                setShowVerification(false)
              }}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                loginMethod === 'email'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Address
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('id')
                setError('')
                setShowVerification(false)
              }}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                loginMethod === 'id'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-4 0h4" />
              </svg>
              Member ID
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {loginMethod === 'email' ? 'Email Address' : 'Member / Cluster ID'}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {loginMethod === 'email' ? <EmailIcon /> : <IdCardIcon />}
                </div>
                <input
                  type={loginMethod === 'email' ? 'email' : 'text'}
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  placeholder={loginMethod === 'email' ? 'you@example.com' : 'TRO-3892-ALPHA'}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <LockIcon />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  required
                />
              </div>
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  className="text-xs text-teal-600 hover:text-teal-700 hover:underline"
                >
                  Forgot password? Send OTP
                </button>
              </div>
            </div>

            {showVerification && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to Kluster?</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/leader-signup"
                className="text-center px-4 py-2 border border-teal-300 text-teal-700 rounded-lg font-medium hover:bg-teal-50 transition"
              >
                Register as Leader
              </Link>
              <Link
                to="/member-signup"
                className="text-center px-4 py-2 border border-orange-300 text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition"
              >
                Activate Account
              </Link>
            </div>

            <div className="text-center">
              <Link
                to="/create-profile"
                className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
              >
                Looking for work? Create a worker profile →
              </Link>
            </div>  
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login