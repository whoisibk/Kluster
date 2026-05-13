import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
 
const ClusterDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [clusterData, setClusterData] = useState(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [invitePhone, setInvitePhone] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
 
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
        { name: 'Adeola Williams', joined: '2 days ago', phone: '08031112233' },
        { name: 'Emeka Okafor', joined: '3 days ago', phone: '08034445566' },
        { name: 'Fatima Bello', joined: '5 days ago', phone: '08037778899' }
      ],
      opportunities: [
        { title: 'Phone repair demand increasing', location: 'Ikeja', urgency: 'High', potential: '₦500k/week' },
        { title: 'Accessory suppliers needed', location: 'Computer Village', urgency: 'Medium', potential: '₦300k/week' }
      ]
    })
  }, [navigate])
 
  const handleLogout = () => {
    localStorage.removeItem('kluster_user')
    navigate('/login')
  }
 
  const copyJoinCode = () => {
    navigator.clipboard.writeText(clusterData?.joinCode || '')
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }
 
  const handleSendInvite = () => {
    if (invitePhone.trim()) {
      alert(`✓ Invite sent to ${invitePhone}\n\nThey'll receive it on WhatsApp with your join code.`)
      setInvitePhone('')
      setShowInviteModal(false)
    }
  }
 
  // Helper function to get health score color and message
  const getHealthScoreInfo = (score) => {
    if (score >= 80) return { 
      color: 'text-teal-600', 
      bg: 'bg-teal-50', 
      label: '🎉 Excellent', 
      message: 'Your cluster is thriving! Keep going.' 
    }
    if (score >= 60) return { 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      label: '✓ Good', 
      message: 'Your cluster is growing strong.' 
    }
    if (score >= 40) return { 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50', 
      label: '⚠️ Fair', 
      message: 'Some areas to improve.' 
    }
    return { 
      color: 'text-orange-600', 
      bg: 'bg-orange-50', 
      label: '🔴 Needs Help', 
      message: 'Let\'s improve together.' 
    }
  }
 
  const healthInfo = getHealthScoreInfo(clusterData?.healthScore || 0)
 
  if (!user || !clusterData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading your cluster...</p>
          </div>
        </div>
      </div>
    )
  }
 
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Welcome Banner - Simplified */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold">Hello, {user.name.split(' ')[0]} 👋</h1>
              <p className="text-teal-100 mt-2 text-lg">{clusterData.name}</p>
              <p className="text-teal-100 text-sm mt-1">Cluster Score: <span className="font-bold text-white">{clusterData.healthScore}/100</span></p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 transition backdrop-blur"
              title="Sign out of your account"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="space-y-6">
          
          {/* PRIMARY: Cluster Health - The Most Important Card */}
          <div className={`${healthInfo.bg} rounded-3xl shadow-sm border-2 border-teal-100 p-8`}>
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cluster Health</h2>
                <p className={`text-lg font-semibold ${healthInfo.color}`}>{healthInfo.label}</p>
              </div>
            </div>
            
            {/* Big Score Display */}
            <div className="bg-white rounded-2xl p-8 mb-6 text-center shadow-sm">
              <div className="text-7xl font-bold text-teal-600 mb-2">{clusterData.healthScore}</div>
              <div className="text-gray-600 text-lg">Out of 100</div>
              <p className="text-gray-700 mt-4 text-base leading-relaxed">{healthInfo.message}</p>
              <p className="text-gray-600 text-sm mt-3">{clusterData.healthMessage}</p>
            </div>
            
            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-teal-600">{clusterData.totalMembers}</div>
                <div className="text-sm text-gray-600 mt-1">Members Total</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-emerald-600">{clusterData.activeMembers}</div>
                <div className="text-sm text-gray-600 mt-1">Active Now</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-orange-600">{clusterData.monthlyVolume}</div>
                <div className="text-sm text-gray-600 mt-1">This Month</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-green-600">↑{clusterData.growthRate}%</div>
                <div className="text-sm text-gray-600 mt-1">Growth Rate</div>
              </div>
            </div>
          </div>
 
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* QUICK ACTION: Invite Members */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Need more members?</h2>
              <p className="text-gray-600 mb-4">Grow your cluster by inviting more traders. Share your code or send personal invites.</p>
              <div className="flex gap-3 flex-wrap">
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition text-lg"
                >
                  + Add Members
                </button>
                <button 
                  onClick={copyJoinCode}
                  className={`px-6 py-3 rounded-xl font-bold text-lg transition ${
                    copiedCode 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {copiedCode ? '✓ Copied!' : '📋 Copy Code'}
                </button>
              </div>
            </div>
 
            {/* Recent Members */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">👥 New Members</h3>
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium">This week</span>
              </div>
              
              <div className="space-y-3">
                {clusterData.recentMembers.map((member, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-teal-50 to-transparent rounded-xl p-4 border border-teal-100 flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500 font-mono">{member.phone}</div>
                    </div>
                    <div className="text-xs text-gray-500 text-right whitespace-nowrap">{member.joined}</div>
                  </div>
                ))}
              </div>
            </div>
 
            {/* Growth Opportunities - The Smart Part */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">📡 New Opportunities</h3>
                <Link to="/demand-signals" className="text-sm text-teal-600 hover:text-teal-700 font-semibold">
                  See all →
                </Link>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">Based on market trends in your cluster</p>
              
              <div className="space-y-3">
                {clusterData.opportunities.map((opp, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-orange-50 to-transparent rounded-xl p-4 border border-orange-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">{opp.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{opp.location}</div>
                      </div>
                      {opp.urgency === 'High' && (
                        <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded-full font-bold">🔥 Trending</span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-orange-700 mt-2">Est. ₦{opp.potential.split('₦')[1]}/week</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
 
          {/* Call-to-Action Section */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to scale?</h3>
            <p className="mb-4 text-teal-100">Your cluster is thriving. Help more members get access to credit.</p>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="px-8 py-3 bg-white text-teal-600 rounded-xl font-bold hover:bg-gray-100 transition text-lg"
            >
              Invite More Members Now
            </button>
          </div>
 
        </div>
      </div>
 
      {/* Invite Modal - Simplified */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInviteModal(false)}>
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Invite a Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Their phone number
                </label>
                <input
                  type="tel"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendInvite()}
                  placeholder="0803 123 4567"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
                  autoFocus
                  aria-label="Phone number to invite"
                />
                <p className="text-xs text-gray-500 mt-2">We'll send them a WhatsApp message</p>
              </div>
              
              <div className="bg-teal-50 rounded-xl p-4 border-2 border-teal-200">
                <p className="text-xs text-gray-700 font-bold mb-2">They'll join with this code:</p>
                <code className="text-base font-mono font-bold text-teal-700 bg-white px-3 py-2 rounded block text-center border border-teal-300">
                  {clusterData.joinCode}
                </code>
              </div>
              
              <button
                onClick={handleSendInvite}
                disabled={!invitePhone.trim()}
                className={`w-full py-3 rounded-xl font-bold text-base transition ${
                  invitePhone.trim()
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Send Invite
              </button>
 
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-full py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
 
export default ClusterDashboard