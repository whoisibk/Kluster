import { useParams, useLocation, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'

const MemberProfile = () => {
  const { id } = useParams()
  const location = useLocation()
  const [member, setMember] = useState(null)
  
  useEffect(() => {
    // Check if we have new member data from navigation state
    if (location.state?.newMember) {
      setMember(location.state.newMember)
    } else {
      // Mock existing member data (would come from API in production)
      const existingMember = {
        id: id || 'TRO-3892-ALPHA',
        name: 'Tunde Adebayo',
        tier: 'Tier 1 Vendor',
        sector: 'Phone Accessories',
        location: 'Computer Village, Ikeja',
        joinDate: '2023.04.12',
        kycStatus: 'Verified',
        activityScore: 94,
        scoreChange: 2.4,
        clusterRank: 'Top 5%',
        rankDescription: 'High centrality node. Frequent liquidity provider within the regional network.',
        eligibleAmount: 450000,
        confidenceScore: 88,
        creditBrief: 'Consistent weekly inflows and rising repeat customer activity suggest stable business growth and strong repayment reliability. Recommendation: Prime candidate for elevated credit facilities to stimulate further cluster growth.',
        groupName: 'Oba Akran Phone Repair Association',
        memberCount: 87,
        phone: '08031234567',
        email: 'tunde.adebayo@example.com',
        recentActivity: [
          {
            id: 1,
            title: 'Bulk screen purchase - Computer Village',
            amount: '₦142,000',
            vendor: 'Eeeka Electronics',
            time: 'T-Minus 2 Hours',
            type: 'purchase'
          },
          {
            id: 2,
            title: 'Initiated bulk transfer',
            description: 'Routing through Alpha Cluster',
            time: 'Yesterday, 14:38',
            type: 'transfer'
          },
          {
            id: 3,
            title: 'Credit facility re-evaluation',
            description: 'List increased by 15%',
            time: '2023.10.24',
            type: 'evaluation'
          },
          {
            id: 4,
            title: 'KYC Documentation Updated',
            time: '2023.10.20',
            type: 'kyc'
          }
        ]
      }
      setMember(existingMember)
    }
  }, [id, location.state])

  // Safe fallback for recentActivity
  const safeRecentActivity = member?.recentActivity || []

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-light/10">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-secondary-slate">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-light/10">
      <Navbar />
      
      {/* Show success banner for new registrations */}
      {location.state?.newMember && (
        <div className="bg-success/10 border-b border-success/20 animate-slide-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-success-dark">Welcome to Kluster!</p>
                  <p className="text-xs text-secondary-slate/70">Your account has been activated. Start exploring opportunities.</p>
                </div>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="text-xs text-secondary-slate/60 hover:text-secondary-slate"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with share button and Demand Signals */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-secondary-slate/60 mb-2">
              <span>Dashboard</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-secondary-slate">Member Profile</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/demand-signals"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary-orange to-secondary-gold text-white rounded-lg shadow-sm hover:shadow-md transition font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm">View Demand Signals</span>
            </Link>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="text-sm">Share Profile</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Member Info Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Member Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-deep to-primary px-6 py-4">
                <h2 className="text-white font-bold">Member Profile</h2>
                <p className="text-primary-light text-sm">ID: {member.id}</p>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary-orange/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-deep">
                      {member.name?.split(' ').map(n => n[0]).join('') || 'MB'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-secondary-slate">{member.name}</h3>
                    <span className="inline-block bg-secondary-gold/20 text-secondary-gold-dark text-xs font-semibold px-2 py-0.5 rounded-full">
                      {member.tier || 'Member'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-secondary-slate/60 text-sm">Sector</span>
                    <span className="font-medium text-secondary-slate">{member.sector || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-secondary-slate/60 text-sm">Location</span>
                    <span className="font-medium text-secondary-slate">{member.location || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-secondary-slate/60 text-sm">Node Join Date</span>
                    <span className="font-medium text-secondary-slate">{member.joinDate || 'Just joined'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-secondary-slate/60 text-sm">Phone</span>
                    <span className="font-medium text-secondary-slate">{member.phone || 'Not provided'}</span>
                  </div>
                  {member.email && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-secondary-slate/60 text-sm">Email</span>
                      <span className="font-medium text-secondary-slate text-sm">{member.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-secondary-slate/60 text-sm">KYC Status</span>
                    <span className="inline-flex items-center gap-1 text-success text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {member.kycStatus || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Score Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-secondary-slate">Activity Score</h3>
                <div className="flex items-center gap-1 text-success text-sm">
                  {member.scoreChange > 0 ? '📈' : member.scoreChange < 0 ? '📉' : '✓'} {Math.abs(member.scoreChange || 0)}%
                </div>
              </div>
              <div className="text-5xl font-bold text-primary mb-2">{member.activityScore || 0}<span className="text-2xl text-secondary-slate/40">/100</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-primary to-secondary-orange rounded-full h-2" style={{ width: `${member.activityScore || 0}%` }}></div>
              </div>
              {(member.activityScore || 0) < 70 && (
                <p className="text-xs text-secondary-slate/50 mt-3">
                  Start transacting to increase your score!
                </p>
              )}
            </div>

            {/* Cluster Info Card */}
            <div className="bg-gradient-to-br from-secondary-gold/10 to-primary/10 rounded-2xl shadow-lg border border-secondary-gold/20 p-6">
              <h3 className="font-semibold text-secondary-slate mb-2">Cluster Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-secondary-slate/60">Group Name</p>
                  <p className="font-medium text-secondary-slate">{member.groupName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-slate/60">Members</p>
                  <p className="font-medium text-secondary-slate">{member.memberCount || '0'} members</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-slate/60">Cluster Rank</p>
                  <div className="text-lg font-bold text-secondary-gold">{member.clusterRank || 'New Member'}</div>
                  <p className="text-xs text-secondary-slate/70 mt-1">{member.rankDescription || 'Just joined the cluster'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions for New Users */}
            {location.state?.newMember && (
              <div className="bg-gradient-to-r from-primary/5 to-secondary-orange/5 rounded-2xl shadow-lg border border-primary/20 p-6">
                <h3 className="font-semibold text-secondary-slate mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Next Steps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition">
                    <div className="text-lg mb-1">👥</div>
                    <div className="font-medium text-sm">Connect with Cluster</div>
                    <div className="text-xs text-secondary-slate/60">Meet your community</div>
                  </button>
                  <button className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition">
                    <div className="text-lg mb-1">💰</div>
                    <div className="font-medium text-sm">Make First Transaction</div>
                    <div className="text-xs text-secondary-slate/60">Start building history</div>
                  </button>
                  <Link to="/demand-signals" className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition block">
                    <div className="text-lg mb-1">📡</div>
                    <div className="font-medium text-sm">View Opportunities</div>
                    <div className="text-xs text-secondary-slate/60">Find demand signals near you</div>
                  </Link>
                </div>
              </div>
            )}

            {/* Demand Signals Alert Card */}
            <Link to="/demand-signals" className="block bg-gradient-to-r from-secondary-orange/10 to-secondary-gold/10 rounded-2xl shadow-lg border border-secondary-orange/20 p-6 hover:shadow-xl transition cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary-orange/20 flex items-center justify-center group-hover:scale-110 transition">
                    <svg className="w-6 h-6 text-secondary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-secondary-slate">Demand Opportunities Available!</h3>
                    <p className="text-sm text-secondary-slate/60">View real-time labor demand and economic signals in your area</p>
                  </div>
                </div>
                <div className="text-secondary-orange group-hover:translate-x-1 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Credit Officer Brief - Renamed to Financial Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-bold text-secondary-slate">Financial Summary</h3>
              </div>
              <p className="text-secondary-slate/80 leading-relaxed">{member.creditBrief || 'Complete your profile to see financial insights.'}</p>
            </div>

            {/* Financial Qualification */}
            <div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-2xl shadow-lg border border-success/20 p-6">
              <h3 className="font-semibold text-secondary-slate mb-4">Financial Qualification</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-success">
                  {member.eligibleAmount > 0 ? `₦${member.eligibleAmount.toLocaleString()}` : 'Pending'}
                </span>
                <span className="text-secondary-slate/60">Eligible Amount</span>
              </div>
              {member.confidenceScore > 0 && (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-secondary-slate/70">Confidence Score:</div>
                  <div className="flex-1 max-w-xs">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-success rounded-full h-2" style={{ width: `${member.confidenceScore}%` }}></div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-success">{member.confidenceScore}%</div>
                </div>
              )}
              {(!member.eligibleAmount || member.eligibleAmount === 0) && (
                <button className="mt-4 text-sm text-primary hover:underline">
                  Learn how to qualify →
                </button>
              )}
            </div>

            {/* Recent Node Activity - Fixed with safe check */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-secondary-slate flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Activity
                </h3>
                <Link to="/demand-signals" className="text-xs text-secondary-orange hover:underline flex items-center gap-1">
                  View opportunities →
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {safeRecentActivity.length > 0 ? (
                  safeRecentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {activity.type === 'purchase' && <span className="text-sm">🛒</span>}
                            {activity.type === 'transfer' && <span className="text-sm">💸</span>}
                            {activity.type === 'evaluation' && <span className="text-sm">📊</span>}
                            {activity.type === 'kyc' && <span className="text-sm">✅</span>}
                            {activity.type === 'registration' && <span className="text-sm">🎉</span>}
                            {activity.type === 'account' && <span className="text-sm">🏦</span>}
                            {activity.type === 'activation' && <span className="text-sm">✨</span>}
                            <p className="font-medium text-secondary-slate">{activity.title}</p>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-secondary-slate/60">{activity.description}</p>
                          )}
                          {activity.vendor && (
                            <p className="text-xs text-secondary-slate/50">Vendor: {activity.vendor}</p>
                          )}
                          {activity.amount && (
                            <p className="text-sm font-semibold text-primary mt-1">{activity.amount}</p>
                          )}
                        </div>
                        <div className="text-xs text-secondary-slate/40 whitespace-nowrap ml-4">{activity.time}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-2">📭</div>
                    <p className="text-secondary-slate/60 text-sm">No recent activity yet</p>
                    <p className="text-xs text-secondary-slate/40 mt-1">Start transacting to see your activity here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Invite Members CTA for cluster leaders */}
            <div className="bg-primary-deep/5 rounded-xl p-4 border border-primary/20">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-slate text-sm">Grow Your Network</h4>
                    <p className="text-secondary-slate/60 text-xs mt-1">
                      Invite others to join your cluster. Stronger clusters unlock better opportunities for everyone.
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-deep transition whitespace-nowrap">
                  Invite Others
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Protocol */}
        <div className="mt-8 text-center">
          <p className="text-xs text-secondary-slate/40">© 2024 KLUSTER INTELLIGENCE. PROTOCOL v1.0.4</p>
        </div>
      </div>
    </div>
  )
}

export default MemberProfile