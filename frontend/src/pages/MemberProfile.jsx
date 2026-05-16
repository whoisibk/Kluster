import { useParams, useLocation, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import klusterAPI from '../services/api'

const MemberProfile = () => {
  const { id } = useParams()
  const location = useLocation()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savings, setSavings] = useState(null)
  const [loanEligibility, setLoanEligibility] = useState(null)
  const [loanModal, setLoanModal] = useState(false)
  const [loanApplied, setLoanApplied] = useState(false)
  const [enrolledProducts, setEnrolledProducts] = useState([])
  const [interestedWorkers, setInterestedWorkers] = useState([])

  const fetchProfileData = async () => {
    try {
      const [profileData, transactions, scoreData, clusters] = await Promise.all([
        klusterAPI.getMyProfile(),
        klusterAPI.getMyTransactions().catch(() => []),
        klusterAPI.getMyScore().catch(() => null),
        klusterAPI.getAllClusters().catch(() => []),
      ])

      const cluster = clusters.find(c => String(c.id) === String(profileData.cluster_id))
      const score = scoreData?.score ?? 0
      const growthRate = scoreData?.breakdown?.growth_trend?.growth_rate ?? 0
      const memberVolume = scoreData?.breakdown?.transaction_volume?.member_volume ?? 0

      const recentActivity = transactions.slice(0, 5).map(t => ({
        id: t.id,
        type: t.transaction_type === 'credit' ? 'transfer' : 'purchase',
        title: t.description || (t.transaction_type === 'credit' ? 'Money Received' : 'Payment Sent'),
        description: t.sender_ref ? `Ref: ${t.sender_ref}` : null,
        amount: `${t.transaction_type === 'credit' ? '+' : '-'}₦${Number(t.amount).toLocaleString('en-NG')}`,
        time: new Date(t.timestamp).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
      }))

      const baseProfile = {
        id: profileData.id,
        name: `${profileData.first_name} ${profileData.last_name}`,
        phone: profileData.phone,
        joinDate: new Date(profileData.created_at).toLocaleDateString('en-NG', {
          year: 'numeric', month: 'long', day: 'numeric',
        }),
        tier: profileData.role_in_cluster === 'leader' ? 'Cluster Leader' : 'Member',
        sector: cluster?.type || 'Not specified',
        location: cluster?.location || 'Not specified',
        activityScore: Math.round(score),
        scoreChange: Math.round(growthRate * 100),
        groupName: cluster?.name || 'N/A',
        creditBrief: null,
        eligibleAmount: memberVolume > 0 ? Math.round(memberVolume * 1.5) : 0,
        confidenceScore: Math.round(score),
        kycStatus: profileData.squad_virtual_account_id ? 'Verified' : 'Pending',
        accountNumber: profileData.squad_virtual_account_id || null,
        recentActivity,
      }

      setMember(baseProfile)
      setLoading(false)

      klusterAPI.getMyEconomicProfile()
        .then(economicProfile => {
          const totalVolume = economicProfile?.transaction_summary?.total_volume ?? memberVolume
          setMember(prev => ({
            ...prev,
            creditBrief: economicProfile?.profile || null,
            eligibleAmount: totalVolume > 0 ? Math.round(totalVolume * 1.5) : prev.eligibleAmount,
          }))
        })
        .catch(() => {})

      klusterAPI.prequalify().then(setLoanEligibility).catch(() => {})
    } catch (error) {
      console.error('Failed to load member:', error)
      setLoading(false)
    } finally {
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchProfileData()
  }

  useEffect(() => {
    if (location.state?.newMember) {
      setMember(location.state.newMember)
      setLoading(false)
      return
    }
    fetchProfileData()
  }, [id, location.state])

  const safeRecentActivity = member?.recentActivity ?? []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-light/10">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-40 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-28" />
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-gray-200 rounded-2xl" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-light/10">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-secondary-slate">Failed to load profile. Please try again.</p>
            <Link to="/login" className="mt-4 text-primary hover:underline block">Return to login</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-light/10">
      <Navbar />

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
              <button onClick={() => window.location.reload()} className="text-xs text-secondary-slate/60 hover:text-secondary-slate">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
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
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition text-sm text-secondary-slate/70 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
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
          {/* Left Column */}
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
                    <span className="font-medium text-secondary-slate">{member.sector}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-secondary-slate/60 text-sm">Location</span>
                    <span className="font-medium text-secondary-slate">{member.location}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-secondary-slate/60 text-sm">Node Join Date</span>
                    <span className="font-medium text-secondary-slate">{member.joinDate}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-secondary-slate/60 text-sm">Phone</span>
                    <span className="font-medium text-secondary-slate">{member.phone || 'Not provided'}</span>
                  </div>
                  {member.accountNumber && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-secondary-slate/60 text-sm">Virtual Account</span>
                      <span className="font-medium text-secondary-slate font-mono text-sm">{member.accountNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-secondary-slate/60 text-sm">KYC Status</span>
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${member.kycStatus === 'Verified' ? 'text-success' : 'text-yellow-500'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {member.kycStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Score Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-secondary-slate">Activity Score</h3>
                <div className={`flex items-center gap-1 text-sm ${member.scoreChange > 0 ? 'text-success' : member.scoreChange < 0 ? 'text-red-500' : 'text-secondary-slate/60'}`}>
                  {member.scoreChange > 0 ? '📈' : member.scoreChange < 0 ? '📉' : '—'} {Math.abs(member.scoreChange || 0)}%
                </div>
              </div>
              <div className="text-5xl font-bold text-primary mb-2">
                {member.activityScore}<span className="text-2xl text-secondary-slate/40">/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-secondary-orange rounded-full h-2 transition-all duration-700"
                  style={{ width: `${member.activityScore}%` }}
                />
              </div>
              {member.activityScore < 70 && (
                <p className="text-xs text-secondary-slate/50 mt-3">
                  Start transacting to increase your score!
                </p>
              )}
            </div>

            {/* Cluster Info Card */}
            <div className="bg-gradient-to-br from-secondary-gold/10 to-primary/10 rounded-2xl shadow-lg border border-secondary-gold/20 p-6">
              <h3 className="font-semibold text-secondary-slate mb-4">Cluster Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-secondary-slate/60">Group Name</p>
                  <p className="font-medium text-secondary-slate">{member.groupName}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-slate/60">Cluster Rank</p>
                  <div className="text-lg font-bold text-secondary-gold capitalize">{member.tier}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* Demand Signals Alert */}
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

            {/* Financial Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-bold text-secondary-slate">Financial Summary</h3>
              </div>
              <p className="text-secondary-slate/80 leading-relaxed">
                {member.creditBrief || 'No transactions yet. Start receiving payments to build your financial profile.'}
              </p>
            </div>

            {/* Loan Eligibility */}
            <div className={`rounded-2xl shadow-lg border p-6 ${loanEligibility?.eligible ? 'bg-gradient-to-r from-success/10 to-primary/10 border-success/20' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-secondary-slate flex items-center gap-2">
                  <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Micro-loan Eligibility
                </h3>
                {loanEligibility && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${loanEligibility.eligible ? 'bg-success/20 text-success' : 'bg-gray-100 text-secondary-slate/50'}`}>
                    {loanEligibility.eligible ? 'Eligible ✓' : 'Not yet eligible'}
                  </span>
                )}
              </div>

              {!loanEligibility ? (
                <p className="text-secondary-slate/50 text-sm">Checking eligibility…</p>
              ) : loanEligibility.eligible ? (
                <div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-success">₦{Math.round(loanEligibility.max_loan_amount).toLocaleString('en-NG')}</span>
                    <span className="text-secondary-slate/60 text-sm">max you can borrow</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/70 rounded-xl p-3">
                      <p className="text-xs text-secondary-slate/50">Your score</p>
                      <p className="font-bold text-secondary-slate">{Math.round(loanEligibility.individual_score)}/100</p>
                    </div>
                    <div className="bg-white/70 rounded-xl p-3">
                      <p className="text-xs text-secondary-slate/50">Cluster score</p>
                      <p className="font-bold text-secondary-slate">{Math.round(loanEligibility.cluster_score)}/100</p>
                    </div>
                  </div>
                  {loanApplied ? (
                    <div className="w-full py-3 bg-success/10 text-success text-sm font-semibold text-center rounded-xl">
                      Application submitted ✓ — Processing within 24hrs
                    </div>
                  ) : (
                    <button
                      onClick={() => setLoanModal(true)}
                      className="w-full py-3 bg-gradient-to-r from-success to-primary text-white font-semibold rounded-xl hover:from-success hover:to-primary-deep transition text-sm"
                    >
                      Apply for Micro-loan →
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className={`rounded-xl p-3 ${loanEligibility.individual_score >= 40 ? 'bg-success/10' : 'bg-red-50'}`}>
                      <p className="text-xs text-secondary-slate/50">Your score</p>
                      <p className={`font-bold ${loanEligibility.individual_score >= 40 ? 'text-success' : 'text-danger'}`}>
                        {Math.round(loanEligibility.individual_score)}/100
                      </p>
                      <p className="text-xs text-secondary-slate/40">Need 40+</p>
                    </div>
                    <div className={`rounded-xl p-3 ${loanEligibility.cluster_score >= 40 ? 'bg-success/10' : 'bg-red-50'}`}>
                      <p className="text-xs text-secondary-slate/50">Cluster score</p>
                      <p className={`font-bold ${loanEligibility.cluster_score >= 40 ? 'text-success' : 'text-danger'}`}>
                        {Math.round(loanEligibility.cluster_score)}/100
                      </p>
                      <p className="text-xs text-secondary-slate/40">Need 40+</p>
                    </div>
                  </div>
                  {loanEligibility.improvement_tips?.length > 0 && (
                    <div className="bg-secondary-gold/10 rounded-xl p-3">
                      <p className="text-xs font-semibold text-secondary-slate mb-1">How to qualify:</p>
                      {loanEligibility.improvement_tips.map((tip, i) => (
                        <p key={i} className="text-xs text-secondary-slate/70 mt-1">{tip}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Savings */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-bold text-secondary-slate">Savings Summary</h3>
              </div>
              {!savings ? (
                <p className="text-secondary-slate/50 text-sm">Loading savings data…</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary/5 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-primary">₦{Math.round(savings.monthly_savings).toLocaleString('en-NG')}</p>
                      <p className="text-xs text-secondary-slate/60 mt-1">Saved this month</p>
                    </div>
                    <div className="bg-secondary-gold/10 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-secondary-slate">₦{Math.round(savings.total_savings).toLocaleString('en-NG')}</p>
                      <p className="text-xs text-secondary-slate/60 mt-1">Total savings pot</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-secondary-slate/60">
                      Based on 10% of your ₦{Math.round(savings.monthly_volume).toLocaleString('en-NG')} monthly revenue across {savings.transaction_count} transactions.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
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
                            <span className="text-sm">{activity.type === 'transfer' ? '💸' : '🛒'}</span>
                            <p className="font-medium text-secondary-slate">{activity.title}</p>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-secondary-slate/60">{activity.description}</p>
                          )}
                          {activity.amount && (
                            <p className={`text-sm font-semibold mt-1 ${activity.amount.startsWith('+') ? 'text-success' : 'text-red-500'}`}>
                              {activity.amount}
                            </p>
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

            {/* Interested Workers */}
            {interestedWorkers.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-secondary-gold/20 to-secondary-orange/10 px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-secondary-slate flex items-center gap-2">
                    <svg className="w-5 h-5 text-secondary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Workers Interested in Your Cluster ({interestedWorkers.length})
                  </h3>
                  <p className="text-xs text-secondary-slate/50 mt-0.5">Job seekers who want to work here</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {interestedWorkers.map((w, idx) => (
                    <div key={w.interest_id || idx} className="px-6 py-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-secondary-orange/15 flex items-center justify-center text-secondary-orange font-bold text-sm flex-shrink-0">
                            {w.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-secondary-slate text-sm">{w.name}</div>
                            <div className="text-xs text-secondary-slate/50">{w.phone} · {w.location}</div>
                            {w.skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {w.skills.slice(0, 3).map(s => (
                                  <span key={s} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full capitalize">{s}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insurance */}
            {(() => {
              const sector = (member.sector || '').toLowerCase()
              let products = [
                { id: 'income', name: 'Income Protection', desc: 'Monthly payout if you cannot work due to illness or injury', premium: '₦300/mo' },
                { id: 'life', name: 'Group Life Cover', desc: 'Life insurance bundled with your cluster membership', premium: '₦200/mo' },
              ]
              if (sector.includes('artisan') || sector.includes('guild') || sector.includes('repair')) {
                products = [
                  { id: 'tools', name: 'Tools & Equipment Cover', desc: 'Protects tools and equipment from theft or damage', premium: '₦500/mo' },
                  { id: 'income', name: 'Income Protection', desc: 'Daily allowance if you cannot work due to illness', premium: '₦300/mo' },
                ]
              } else if (sector.includes('market') || sector.includes('trader') || sector.includes('cooperative')) {
                products = [
                  { id: 'stock', name: 'Stock Loss Insurance', desc: 'Compensation for goods lost to fire, flood, or theft', premium: '₦800/mo' },
                  { id: 'income', name: 'Income Protection', desc: 'Covers income disruption during illness or crisis', premium: '₦300/mo' },
                ]
              } else if (sector.includes('tailor') || sector.includes('fashion')) {
                products = [
                  { id: 'equip', name: 'Sewing Equipment Cover', desc: 'Protects machines from damage or theft', premium: '₦400/mo' },
                  { id: 'income', name: 'Income Protection', desc: 'Daily allowance if unable to work', premium: '₦300/mo' },
                ]
              }
              return (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6 text-secondary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <h3 className="text-lg font-bold text-secondary-slate">Insurance Products</h3>
                  </div>
                  <p className="text-xs text-secondary-slate/50 mb-4">Micro-insurance tailored for your cluster type</p>
                  <div className="space-y-3">
                    {products.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-secondary-orange/30 transition">
                        <div className="flex-1">
                          <p className="font-medium text-secondary-slate text-sm">{p.name}</p>
                          <p className="text-xs text-secondary-slate/50 mt-0.5">{p.desc}</p>
                          <p className="text-xs font-semibold text-secondary-orange mt-1">{p.premium}</p>
                        </div>
                        {enrolledProducts.includes(p.id) ? (
                          <span className="ml-3 text-xs bg-success/10 text-success font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">Enrolled ✓</span>
                        ) : (
                          <button
                            onClick={() => setEnrolledProducts(prev => [...prev, p.id])}
                            className="ml-3 text-xs bg-secondary-orange/10 text-secondary-orange font-semibold px-3 py-1.5 rounded-full hover:bg-secondary-orange hover:text-white transition whitespace-nowrap"
                          >
                            Get Covered
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Grow Network CTA */}
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

        <div className="mt-8 text-center">
          <p className="text-xs text-secondary-slate/40">© 2026 Team Hacktivity · Kluster Inc.</p>
        </div>
      </motion.div>

      {/* Loan Application Modal */}
      {loanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-success to-primary px-6 py-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">Apply for Micro-loan</h3>
                  <p className="text-white/80 text-sm mt-0.5">
                    Max eligible: ₦{Math.round(loanEligibility?.max_loan_amount ?? 0).toLocaleString('en-NG')}
                  </p>
                </div>
                <button onClick={() => setLoanModal(false)} className="text-white/70 hover:text-white text-2xl leading-none">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-success/5 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-secondary-slate/50 text-xs">Your activity score</p>
                    <p className="font-bold text-secondary-slate">{Math.round(loanEligibility?.individual_score ?? 0)}/100</p>
                  </div>
                  <div>
                    <p className="text-secondary-slate/50 text-xs">Cluster health score</p>
                    <p className="font-bold text-secondary-slate">{Math.round(loanEligibility?.cluster_score ?? 0)}/100</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-secondary-slate/70">
                This loan is calculated based on your transaction history and cluster health. Funds will be sent to your registered account.
              </p>
              <div className="bg-primary/5 rounded-xl p-3">
                <p className="text-xs text-secondary-slate/60">Recipient account: <span className="font-mono font-medium">{member.accountNumber || 'Virtual account on file'}</span></p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setLoanModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-secondary-slate/70 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setLoanModal(false); setLoanApplied(true) }}
                  className="flex-1 py-3 bg-gradient-to-r from-success to-primary text-white rounded-xl font-medium transition"
                >
                  Confirm Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MemberProfile
