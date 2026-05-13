import { useParams, useLocation, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'

const MemberProfile = () => {
  const { id } = useParams()
  const location = useLocation()
  const [member, setMember] = useState(null)
  const [showShareToast, setShowShareToast] = useState(false)
  
  useEffect(() => {
    if (location.state?.newMember) {
      setMember(location.state.newMember)
    } else {
      const existingMember = {
        id: id || 'TRO-3892-ALPHA',
        name: 'Tunde Adebayo',
        role: 'Phone Accessories Vendor',
        location: 'Computer Village, Ikeja',
        joinDate: 'April 2023',
        kycStatus: 'Verified',
        activityScore: 94,
        scoreChange: 2.4,
        clusterName: 'Oba Akran Phone Association',
        memberCount: 87,
        phone: '08031234567',
        email: 'tunde.adebayo@example.com',
        recentActivity: [
          { id: 1, title: 'Sold phone accessories', amount: '₦142,000', time: '2 hours ago', type: 'sale' },
          { id: 2, title: 'Sent payment to supplier', amount: '₦50,000', time: 'Yesterday', type: 'payment' },
          { id: 3, title: 'Loan repayment', amount: '₦25,000', time: '2 days ago', type: 'repayment' }
        ],
        clusterHealth: 'Healthy',
        growthTrend: '+15% this month',
        opportunities: [
          { title: 'Phone repair demand rising', location: 'Ikeja', urgency: 'High' },
          { title: 'Accessory bulk orders', location: 'Computer Village', urgency: 'Medium' }
        ]
      }
      setMember(existingMember)
    }
  }, [id, location.state])

  const handleShareProfile = () => {
    navigator.clipboard.writeText(`Join my cluster on Kluster! Use code: ${member?.id}`)
    setShowShareToast(true)
    setTimeout(() => setShowShareToast(false), 3000)
  }

  if (!member) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Welcome Banner */}
      <div className="bg-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold">Welcome back, {member.name.split(' ')[0]} 👋</h1>
          <p className="text-teal-100 mt-1 text-sm">Your business hub is ready</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Main Grid */}
        <div className="space-y-6">
          
          {/* Business Health Card - Primary Focus */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💚</span>
                <h2 className="text-lg font-semibold text-gray-800">Your Business Health</h2>
              </div>
              <span className="text-sm text-teal-600 font-medium">Updated today</span>
            </div>
            
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Your business is <span className="font-semibold text-teal-700">thriving</span> this month. 
              Activity is up {member.scoreChange}% compared to last month.
            </p>
            
            <div className="flex items-center gap-4 pt-2">
              <div>
                <div className="text-3xl font-bold text-gray-800">{member.activityScore}</div>
                <div className="text-sm text-gray-500">Activity Score</div>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <div>
                <div className="text-lg font-semibold text-teal-600">{member.growthTrend}</div>
                <div className="text-sm text-gray-500">Growth</div>
              </div>
            </div>
          </div>

          {/* Two Column Layout for Medium Screens+ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Your Cluster */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏘️</span>
                <h2 className="text-lg font-semibold text-gray-800">Your Cluster</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Cluster Name</div>
                  <div className="font-medium text-gray-800 mt-1">{member.clusterName}</div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="font-medium text-gray-800 mt-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      {member.clusterHealth}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Members</div>
                    <div className="font-medium text-gray-800 mt-1">{member.memberCount}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💰</span>
                <h2 className="text-lg font-semibold text-gray-800">Financial Summary</h2>
              </div>
              
              <div className="bg-teal-50 rounded-xl p-4 mb-4">
                <div className="text-sm text-teal-700 mb-1">You may qualify for</div>
                <div className="text-3xl font-bold text-teal-700">₦450,000</div>
                <div className="text-xs text-teal-600 mt-1">Based on your business activity</div>
              </div>
              
              <button className="w-full py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition">
                Check eligibility →
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                </div>
                <Link to="/demand-signals" className="text-sm text-teal-600 hover:text-teal-700">
                  View all →
                </Link>
              </div>
              
              <div className="space-y-3">
                {member.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <div className="font-medium text-gray-800">{activity.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{activity.time}</div>
                    </div>
                    {activity.amount && (
                      <div className="font-semibold text-gray-700">{activity.amount}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📡</span>
                <h2 className="text-lg font-semibold text-gray-800">Opportunities Near You</h2>
              </div>
              
              <div className="space-y-3">
                {member.opportunities.map((opp, idx) => (
                  <div key={idx} className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-gray-800">{opp.title}</div>
                      {opp.urgency === 'High' && (
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">Hot</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{opp.location}</div>
                  </div>
                ))}
              </div>
              
              <Link to="/demand-signals" className="block text-center mt-4 py-2 text-teal-600 text-sm font-medium hover:text-teal-700">
                Find more opportunities →
              </Link>
            </div>
          </div>

          {/* Simple Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <span className="text-xl font-semibold text-teal-700">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Location</div>
                <div className="font-medium text-gray-800">{member.location}</div>
              </div>
              <div>
                <div className="text-gray-500">Member since</div>
                <div className="font-medium text-gray-800">{member.joinDate}</div>
              </div>
              <div>
                <div className="text-gray-500">KYC</div>
                <div className="text-teal-600 font-medium">{member.kycStatus}</div>
              </div>
              <div>
                <div className="text-gray-500">Phone</div>
                <div className="font-medium text-gray-800">{member.phone}</div>
              </div>
            </div>
            
            <button onClick={handleShareProfile} className="w-full mt-4 py-2 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
              Share Profile
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {showShareToast && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm z-50">
            Profile link copied!
          </div>
        )}
      </div>
    </div>
  )
}

export default MemberProfile