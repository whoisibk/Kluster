import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Login = () => {
  const navigate = useNavigate()
  const [loginMethod, setLoginMethod] = useState('phone') // phone or id
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    verificationCode: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [error, setError] = useState('')

  // Mock user database (would be backend in production)
  const mockUsers = {
    '08031234567': {
      id: 'TRO-3892-ALPHA',
      name: 'Tunde Adebayo',
      role: 'cluster_leader',
      password: '123456',
      clusterId: 'CLU-001',
      clusterName: 'Oba Akran Phone Repair Association'
    },
    '08059876543': {
      id: 'MBR-12345-ACTIVE',
      name: 'Chioma Okafor',
      role: 'member',
      password: '123456',
      clusterId: 'CLU-001',
      clusterName: 'Oba Akran Phone Repair Association'
    },
    '08051122334': {
      id: 'MBR-67890-RISING',
      name: 'John Okonkwo',
      role: 'member',
      password: '123456',
      clusterId: 'CLU-003',
      clusterName: 'Abuja Tailors Cooperative'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate API call
    setTimeout(() => {
      const user = mockUsers[formData.identifier]
      
      if (user && user.password === formData.password) {
        // Store user session
        localStorage.setItem('kluster_user', JSON.stringify({
          id: user.id,
          name: user.name,
          role: user.role,
          clusterId: user.clusterId,
          clusterName: user.clusterName,
          isAuthenticated: true
        }))
        
        // Redirect based on role
        if (user.role === 'cluster_leader') {
          navigate('/dashboard/cluster')
        } else {
          navigate(`/member/${user.id}`)
        }
      } else {
        setError('Invalid phone number/ID or password. Try: 08031234567 / 123456')
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleSendVerificationCode = async () => {
    if (!formData.identifier) {
      setError('Please enter your phone number')
      return
    }
    // Simulate sending OTP
    alert(`Verification code sent to ${formData.identifier}`)
    setShowVerification(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-light/10">
      <Navbar />
      
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary-deep/10 rounded-full px-4 py-1.5 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-primary-deep text-xs font-semibold">WELCOME BACK</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-secondary-slate mb-3">
            Sign in to <span className="bg-gradient-to-r from-primary-deep to-primary bg-clip-text text-transparent">Kluster</span>
          </h1>
          <p className="text-secondary-slate/60">
            Access your economic identity and cluster insights
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-up">
          <div className="bg-gradient-to-r from-primary-deep to-primary px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Authentication Portal
            </h2>
            <p className="text-primary-light text-sm mt-1">Cluster leaders & members sign in here</p>
          </div>

          {/* Login Method Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('phone')
                setError('')
                setShowVerification(false)
              }}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                loginMethod === 'phone'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-secondary-slate/60 hover:text-secondary-slate'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Phone Number
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
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-secondary-slate/60 hover:text-secondary-slate'
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
              <div className="bg-danger/10 border border-danger/20 rounded-lg p-3">
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-secondary-slate mb-2">
                {loginMethod === 'phone' ? 'Phone Number' : 'Member / Cluster ID'}
              </label>
              <input
                type={loginMethod === 'phone' ? 'tel' : 'text'}
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                placeholder={loginMethod === 'phone' ? '0803 123 4567' : 'TRO-3892-ALPHA'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-slate mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                required
              />
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password? Send OTP
                </button>
              </div>
            </div>

            {showVerification && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-secondary-slate mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-deep to-primary hover:from-primary-deep/90 hover:to-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <span className="px-2 bg-white text-secondary-slate/60">New to Kluster?</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/signup"
                className="text-center px-4 py-2 border border-primary/30 text-primary-deep rounded-lg font-medium hover:bg-primary/5 transition"
              >
                Register as Leader
              </Link>
              <Link
                to="/member-signup"
                className="text-center px-4 py-2 border border-secondary-orange/30 text-secondary-orange rounded-lg font-medium hover:bg-secondary-orange/5 transition"
              >
                Join as Member
              </Link>
            </div>

            {/* Demo credentials info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-secondary-slate/60 text-center">
                Demo Credentials:<br />
                Leader: 08031234567 / 123456<br />
                Member: 08059876543 / 123456
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login