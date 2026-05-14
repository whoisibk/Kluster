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
  const [recentMembers, setRecentMembers] = useState([])
  const [opportunities, setOpportunities] = useState([])

 useEffect(() => {
  const loadDashboard = async () => {
    const storedUser = localStorage.getItem('kluster_user')
    if (!storedUser) {
      navigate('/login')
      return
    }
    
    const userData = JSON.parse(storedUser)
    if (userData.role !== 'cluster_leader') {
      navigate('/login')
      return
    }
    
    setUser(userData)
    
    try {
      // Fetch real data from backend
      const myCluster = await klusterAPI.getMyCluster()
      const health = await klusterAPI.getClusterHealth()
      const members = await klusterAPI.getClusterMembers()
      const demand = await klusterAPI.getClusterDemand()
      
      setClusterData({
        ...myCluster,
        healthScore: health.score,
        healthStatus: health.status,
        healthMessage: health.message,
        recentMembers: members.slice(0, 3),
        opportunities: demand.signals
      })
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    }
  }
  
  loadDashboard()
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
    
    // Add new member to recent members list
    const newMember = {
      name: inviteData.fullName,
      joined: 'Just now',
      phone: inviteData.phone,
      email: inviteData.email || 'Not provided'
    }
    
    setRecentMembers(prev => [newMember, ...prev.slice(0, 2)])
    
    // Update cluster data with new member count
    setClusterData(prev => ({
      ...prev,
      totalMembers: prev.totalMembers + 1,
      recentMembers: [newMember, ...prev.recentMembers.slice(0, 2)]
    }))
    
    alert(`Invite sent to ${inviteData.fullName} at ${inviteData.phone}`)
    setInviteData({ fullName: '', phone: '', email: '', role: '' })
    setShowInviteModal(false)
  }

  const getHealthScoreInfo = (score) => {
    if (score >= 80) return { color: 'text-teal-600', bg: 'bg-teal-50', label: 'Excellent', message: 'Your cluster is thriving!' }
    if (score >= 60) return { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Good', message: 'Your cluster is on a solid path.' }
    if (score >= 40) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Fair', message: 'Some areas need attention.' }
    return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Needs attention', message: 'Invite more members to grow.' }
  }

  if (!user || !clusterData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const healthInfo = getHealthScoreInfo(clusterData.healthScore)

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
              <p className="text-teal-200 text-xs mt-1">{user.location}</p>
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
          
          {/* Cluster Health Card */}
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
            
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle 
                    cx="56" cy="56" r="50" fill="none" stroke="#14b8a6" strokeWidth="8" 
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
                <div className="text-xs text-teal-600 mt-1">{clusterData.activeMembers} active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{clusterData.monthlyVolume}</div>
                <div className="text-sm text-gray-500">Monthly Volume</div>
                <div className="text-xs text-green-600 mt-1">↑ {clusterData.growthRate}% growth</div>
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
                {opportunities.map((opp, idx) => (
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
                {recentMembers.map((member, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <div>
                      <div className="font-medium text-gray-800">{member.name}</div>
                      <div className="text-xs text-gray-400">{member.phone}</div>
                      {member.email && <div className="text-xs text-gray-400">{member.email}</div>}
                    </div>
                    <div className="text-xs text-gray-500">{member.joined}</div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowInviteModal(true)}
                className="w-full mt-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Invite New Member
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

          {/* Invite Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <h3 className="text-xl font-semibold text-gray-800">Invite a Member</h3>
                    </div>
                    <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Add a new member to your cluster</p>
                </div>
                
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={inviteData.fullName} 
                      onChange={handleInviteChange}
                      placeholder="e.g., Adeola Williams" 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={inviteData.phone} 
                      onChange={handleInviteChange}
                      placeholder="0803 123 4567" 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-gray-400 text-xs">(Optional)</span></label>
                    <input 
                      type="email" 
                      name="email" 
                      value={inviteData.email} 
                      onChange={handleInviteChange}
                      placeholder="adeola@example.com" 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500" 
                    />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-600 mb-2">They'll join with this code:</p>
                    <code className="text-sm font-mono text-teal-700 bg-white px-3 py-1.5 rounded block text-center border border-gray-200">
                      {clusterData.joinCode}
                    </code>
                  </div>
                  <button 
                    onClick={handleSendInvite} 
                    className="w-full py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition"
                  >
                    Send Invite
                  </button>
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