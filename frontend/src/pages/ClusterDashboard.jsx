import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const ClusterDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [clusterData, setClusterData] = useState(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteData, setInviteData] = useState({
    fullName: '',
    phone: '',
    email: '',
    role: ''
  })
  const [isSendingInvite, setIsSendingInvite] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('kluster_user')
    if (!storedUser) {
      navigate('/login')
      return
    }
    
    const userData = JSON.parse(storedUser)
    if (userData.role !== 'cluster_leader') {
      navigate(`/member/${userData.id}`)
      return
    }
    
    setUser(userData)
    
    setClusterData({
      name: 'Oba Akran Phone Association',
      healthScore: 82,
      healthStatus: 'Growing',
      healthMessage: 'Your cluster has shown consistent growth this month with strong member participation.',
      totalMembers: 87,
      activeMembers: 71,
      monthlyVolume: '₦2.4M',
      growthRate: 15,
      joinCode: 'KLUSTER-PHONE-001',
      demandSignals: 3,
      recentMembers: [
        { name: 'Adeola Williams', joined: '2 days ago', phone: '08031112233', email: 'adeola@example.com' },
        { name: 'Emeka Okafor', joined: '3 days ago', phone: '08034445566', email: 'emeka@example.com' },
        { name: 'Fatima Bello', joined: '5 days ago', phone: '08037778899', email: 'fatima@example.com' }
      ],
      opportunities: [
        { title: 'Phone repair demand increasing', location: 'Ikeja', urgency: 'High' },
        { title: 'Accessory suppliers needed', location: 'Computer Village', urgency: 'Medium' }
      ]
    })
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('kluster_user')
    navigate('/login')
  }

  const copyJoinCode = () => {
    navigator.clipboard.writeText(clusterData?.joinCode || '')
    alert('Join code copied! Share with potential members.')
  }

  const handleInviteChange = (e) => {
    const { name, value } = e.target
    setInviteData(prev => ({ ...prev, [name]: value }))
  }

  const handleSendInvite = () => {
    if (!inviteData.fullName || !inviteData.phone) {
      alert('Please fill in the member\'s name and phone number')
      return
    }
    
    setIsSendingInvite(true)
    
    // Simulate sending invite
    setTimeout(() => {
      console.log('Invite sent:', inviteData)
      alert(`Invite sent to ${inviteData.fullName} at ${inviteData.phone}`)
      setInviteData({ fullName: '', phone: '', email: '', role: '' })
      setShowInviteModal(false)
      setIsSendingInvite(false)
    }, 1000)
  }

  const handleInviteViaWhatsApp = () => {
    const message = `Join my cluster "${clusterData?.name}" on Kluster! Use join code: ${clusterData?.joinCode}`
    const whatsappUrl = `https://wa.me/${inviteData.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleInviteViaSMS = () => {
    const message = `Join my cluster "${clusterData?.name}" on Kluster! Join code: ${clusterData?.joinCode}`
    window.location.href = `sms:${inviteData.phone}?body=${encodeURIComponent(message)}`
  }

  // Helper function to get health score color and message
  const getHealthScoreInfo = (score) => {
    if (score >= 80) return { color: 'text-teal-600', bg: 'bg-teal-50', label: 'Excellent', message: 'Your cluster is thriving!' }
    if (score >= 60) return { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Good', message: 'Your cluster is on a solid path.' }
    if (score >= 40) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Fair', message: 'Some areas need attention.' }
    return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Needs attention', message: 'Let\'s improve together.' }
  }

  const healthInfo = getHealthScoreInfo(clusterData?.healthScore || 0)

  if (!user || !clusterData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Icons
  const UserPlusIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  )

  const MailIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )

  const PhoneIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )

  const UserIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )

  const WhatsAppIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.588 2.014.896 3.149.896h.002c3.18 0 5.767-2.586 5.768-5.766.002-3.18-2.585-5.768-5.766-5.768zm2.392 8.244c-.129.324-.536.619-.88.634-.33.016-.533.052-1.488-.279-.979-.34-1.665-.894-2.326-1.688-.663-.794-1.04-1.621-1.166-2.487-.016-.11-.029-.221.003-.327.032-.107.088-.188.165-.265.069-.069.138-.086.184-.151.053-.073.059-.133.097-.222.045-.108.039-.203-.019-.3-.068-.115-.421-.826-.585-1.137-.15-.287-.302-.394-.447-.404-.181-.013-.363-.015-.542-.015-.167 0-.361.047-.556.203-.159.128-.639.623-.63 1.581.009.758.629 1.773.842 2.129.27.455 1.239 2.034 2.582 2.663.673.316 1.465.434 1.978.448.509.014.869-.096 1.147-.284.336-.226.507-.527.608-.847.101-.321.045-.596-.025-.785-.07-.189-.216-.327-.381-.455-.165-.128-.309-.214-.461-.283-.152-.07-.265-.14-.336-.139-.07.001-.14.07-.21.14-.07.07-.27.354-.351.413-.07.058-.152.072-.253.036-.101-.036-.266-.099-.497-.271-.279-.204-.508-.426-.677-.645-.195-.25-.319-.59-.366-.888-.048-.299.022-.5.061-.617.039-.117.093-.198.121-.234.029-.036.043-.054.072-.083.029-.029.043-.036.072-.094.029-.058.036-.152-.022-.273-.058-.121-.258-.51-.398-.701-.151-.205-.301-.241-.417-.259-.101-.015-.203-.015-.304-.015-.101 0-.203.015-.297.029-.139.022-.369.083-.562.297-.187.207-.735.679-.735 1.674 0 .995.814 1.964.926 2.099.112.135 1.38 2.106 3.191 2.942.458.211.85.327 1.188.427.382.095.7.147 1.011.147.421 0 .777-.181 1.007-.44.203-.228.34-.519.427-.832.087-.313.119-.579.119-.808.0-.229-.058-.4-.129-.528-.071-.128-.158-.228-.26-.299-.102-.071-.186-.107-.258-.131-.072-.024-.129-.036-.173-.036-.044 0-.087.012-.13.036-.043.024-.139.059-.224.165-.072.094-.202.254-.281.317-.079.063-.129.083-.202.095-.072.012-.158 0-.274-.047-.085-.035-.186-.083-.302-.155-.51-.316-.798-.668-.936-.895-.119-.197-.174-.35-.217-.59-.043-.24.022-.367.058-.438.036-.07.072-.094.108-.158.036-.063.058-.106.079-.158.022-.053.038-.115.022-.183-.016-.069-.058-.158-.12-.267-.062-.109-.217-.33-.325-.438-.108-.108-.216-.154-.288-.166-.072-.012-.144-.012-.216-.012-.058 0-.116.025-.174.037z" />
    </svg>
  )

  const SmsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Welcome Banner */}
      <div className="bg-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Welcome back, {user.name.split(' ')[0]} 👋</h1>
              <p className="text-teal-100 mt-1 text-sm">{clusterData.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <div className="space-y-6">
          
          {/* Cluster Health Card - Primary Focus with Score */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏘️</span>
                <h2 className="text-lg font-semibold text-gray-800">Cluster Health</h2>
              </div>
              <div className={`${healthInfo.bg} rounded-full px-3 py-1`}>
                <span className={`text-sm font-medium ${healthInfo.color}`}>{healthInfo.label}</span>
              </div>
            </div>
            
            {/* Health Score - Visual Ring */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - clusterData.healthScore / 100)}`}
                    className="transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-3xl font-bold text-gray-800">{clusterData.healthScore}</div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <p className="text-gray-700 text-lg font-medium mb-1">{healthInfo.message}</p>
                <p className="text-gray-500 text-sm">{clusterData.healthMessage}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <div className="text-2xl font-bold text-gray-800">{clusterData.totalMembers}</div>
                <div className="text-sm text-gray-500">Total Members</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{clusterData.activeMembers}</div>
                <div className="text-sm text-gray-500">Active this month</div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Business Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📈</span>
                <h2 className="text-lg font-semibold text-gray-800">Business Activity</h2>
              </div>
              
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-800">{clusterData.monthlyVolume}</div>
                <div className="text-sm text-gray-500 mt-1">Total this month</div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">↑</span>
                  <span className="text-sm font-medium text-green-700">{clusterData.growthRate}% growth</span>
                </div>
                <div className="text-xs text-green-600 mt-1">Compared to last month</div>
              </div>
            </div>

            {/* Growth Opportunities */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📡</span>
                  <h2 className="text-lg font-semibold text-gray-800">Growth Opportunities</h2>
                </div>
                <Link to="/demand-signals" className="text-sm text-teal-600 hover:text-teal-700">
                  View all →
                </Link>
              </div>
              
              <div className="space-y-3">
                {clusterData.opportunities.map((opp, idx) => (
                  <div key={idx} className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-gray-800">{opp.title}</div>
                      {opp.urgency === 'High' && (
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">Trending</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{opp.location}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Members */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">👥</span>
                <h2 className="text-lg font-semibold text-gray-800">Recent Members</h2>
              </div>
              
              <div className="space-y-3">
                {clusterData.recentMembers.map((member, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <div>
                      <div className="font-medium text-gray-800">{member.name}</div>
                      <div className="text-xs text-gray-400">{member.phone}</div>
                      <div className="text-xs text-gray-400">{member.email}</div>
                    </div>
                    <div className="text-xs text-gray-500">{member.joined}</div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setShowInviteModal(true)}
                className="w-full mt-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition flex items-center justify-center gap-2"
              >
                <UserPlusIcon />
                + Invite New Member
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚡</span>
                <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <span className="text-gray-700">Invite members</span>
                  <span className="text-gray-400">→</span>
                </button>
                
                <button 
                  onClick={copyJoinCode}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <span className="text-gray-700">Share join code</span>
                  <span className="text-gray-400 font-mono text-sm">{clusterData.joinCode}</span>
                </button>
                
                <Link 
                  to="/demand-signals"
                  className="w-full flex items-center justify-between p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition"
                >
                  <span className="text-orange-700 font-medium">View demand signals</span>
                  <span className="text-orange-500">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Enhanced Invite Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <UserPlusIcon />
                      <h3 className="text-xl font-semibold text-gray-800">Invite a Member</h3>
                    </div>
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Add a new member to your cluster</p>
                </div>
                
                <div className="p-6 space-y-5">
                  {/* Full Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <UserIcon />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={inviteData.fullName}
                        onChange={handleInviteChange}
                        placeholder="e.g., Adeola Williams"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  
                  {/* Phone Number Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <PhoneIcon />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={inviteData.phone}
                        onChange={handleInviteChange}
                        placeholder="0803 123 4567"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <MailIcon />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={inviteData.email}
                        onChange={handleInviteChange}
                        placeholder="adeola@example.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  
                  {/* Role/Position Field (Optional) */}
                  
                  
                 
                  
                  {/* Invite Buttons */}
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={handleSendInvite}
                      disabled={isSendingInvite}
                      className="w-full py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSendingInvite ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Sending Invite...
                        </>
                      ) : (
                        <>
                          <MailIcon />
                          Send Email Invite
                        </>
                      )}
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleInviteViaWhatsApp}
                        disabled={!inviteData.phone}
                        className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <WhatsAppIcon />
                        WhatsApp
                      </button>
                      <button
                        onClick={handleInviteViaSMS}
                        disabled={!inviteData.phone}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <SmsIcon />
                        SMS
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 text-center pt-2">
                    They'll receive a link to complete their registration
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClusterDashboard