import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import klusterAPI from '../services/api'

const EXP_LABELS = { less_than_1: 'Under 1 yr', '1_to_3': '1–3 yrs', '3_to_5': '3–5 yrs', '5_plus': '5+ yrs' }
const PREF_LABELS = { full_time: 'Full-time', part_time: 'Part-time', apprenticeship: 'Apprenticeship', contract: 'Contract' }

const parseBio = (bio) => {
  if (!bio) return {}
  const skillMatch = bio.match(/Skill level: (\w+)/)
  const expMatch = bio.match(/Experience: ([^\\.]+)/)
  const prefMatch = bio.match(/Looking for: ([^\\.]+)/)
  const description = bio.split(/\.\s*Skill level:/)[0].trim()
  return {
    description,
    skillLevel: skillMatch ? skillMatch[1] : null,
    experience: expMatch ? EXP_LABELS[expMatch[1].trim()] || expMatch[1].trim() : null,
    workPreference: prefMatch ? PREF_LABELS[prefMatch[1].trim()] || prefMatch[1].trim() : null,
  }
}

const DASH_CACHE_KEY = 'kluster_cluster_dash_v1'
const DASH_CACHE_TTL = 90000

const getDashCache = () => {
  try {
    const raw = sessionStorage.getItem(DASH_CACHE_KEY)
    if (!raw) return null
    const { ts, payload } = JSON.parse(raw)
    if (Date.now() - ts > DASH_CACHE_TTL) return null
    return payload
  } catch { return null }
}

const setDashCache = (payload) => {
  try { sessionStorage.setItem(DASH_CACHE_KEY, JSON.stringify({ ts: Date.now(), payload })) } catch {}
}

const ClusterDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [clusterData, setClusterData] = useState(null)
  const [leaderProfile, setLeaderProfile] = useState(null)
  const [financialSummary, setFinancialSummary] = useState(null)
  const [members, setMembers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [interestedWorkers, setInterestedWorkers] = useState([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteData, setInviteData] = useState({ fullName: '', phone: '' })
  const [inviting, setInviting] = useState(false)
  const [needsCluster, setNeedsCluster] = useState(false)
  const [clusterForm, setClusterForm] = useState({ name: '', type: '', location: '', description: '', languages: [] })
  const [creatingCluster, setCreatingCluster] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    try {
      const [myCluster, health, clusterMembers, leaderData, demand, workers, econProfile] = await Promise.all([
        klusterAPI.getMyCluster().catch(() => null),
        klusterAPI.getClusterHealth().catch(() => null),
        klusterAPI.getClusterMembers().catch(() => []),
        klusterAPI.getMyProfile().catch(() => null),
        klusterAPI.getClusterDemand().catch(() => null),
        klusterAPI.getInterestedWorkers().catch(() => null),
        klusterAPI.getMyEconomicProfile().catch(() => null),
      ])

      const breakdown = health?.breakdown ?? {}
      const totalMembers = breakdown.active_member_rate?.total_members ?? clusterMembers.length
      const activeMembers = breakdown.active_member_rate?.active_members ?? 0
      const currentVolume = breakdown.volume_trend?.current_volume ?? 0
      const growthRate = breakdown.volume_trend?.growth_rate ?? 0

      const clusterPayload = {
        ...(myCluster ?? {}),
        healthScore: Math.round(health?.score ?? 0),
        totalMembers: totalMembers || 0,
        activeMembers,
        currentVolume,
        growthRate,
        healthBreakdown: breakdown,
      }

      setClusterData(prev => ({ ...(prev ?? {}), ...clusterPayload }))
      setLeaderProfile(leaderData)
      setMembers(clusterMembers)
      setOpportunities(demand?.signals ?? [])
      setInterestedWorkers(workers?.workers ?? [])
      setFinancialSummary(econProfile)

      setDashCache({ clusterPayload, leaderData, clusterMembers, opportunities: demand?.signals ?? [], interestedWorkers: workers?.workers ?? [], financialSummary: econProfile })
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      if (error.status === 403 && !clusterData) setNeedsCluster(true)
    } finally {
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  useEffect(() => {
    const storedUser = sessionStorage.getItem('kluster_user')
    if (!storedUser) { navigate('/login'); return }
    const userData = JSON.parse(storedUser)
    if (userData.role !== 'cluster_leader') { navigate('/login'); return }
    setUser(userData)

    const cached = getDashCache()
    if (cached) {
      setClusterData(cached.clusterPayload)
      setLeaderProfile(cached.leaderData)
      setMembers(cached.clusterMembers)
      setOpportunities(cached.opportunities)
      setInterestedWorkers(cached.interestedWorkers)
      setFinancialSummary(cached.financialSummary)
    }

    fetchDashboardData()
  }, [navigate])

  const handleLogout = () => {
    sessionStorage.removeItem('kluster_user')
    sessionStorage.removeItem('kluster_token')
    navigate('/login')
  }

  const handleCreateCluster = async (e) => {
    e.preventDefault()
    setCreatingCluster(true)
    try {
      await klusterAPI.createCluster(clusterForm)
      setNeedsCluster(false)
      window.location.reload()
    } catch (err) {
      alert(`Failed to create cluster: ${err.message}`)
    } finally {
      setCreatingCluster(false)
    }
  }

  const handleSendInvite = async () => {
    if (!inviteData.fullName || !inviteData.phone) {
      alert("Please fill in the member's name and phone number")
      return
    }
    setInviting(true)
    const nameParts = inviteData.fullName.trim().split(' ')
    const first_name = nameParts[0]
    const last_name = nameParts.slice(1).join(' ') || first_name
    try {
      const newMember = await klusterAPI.addMemberToCluster({ first_name, last_name, phone: inviteData.phone, role_in_cluster: 'member' })
      setMembers(prev => [newMember, ...prev])
      setClusterData(prev => ({ ...prev, totalMembers: (prev.totalMembers || 0) + 1 }))
      alert(`${inviteData.fullName} has been added to your cluster.`)
      setInviteData({ fullName: '', phone: '' })
      setShowInviteModal(false)
    } catch (error) {
      alert(`Failed to add member: ${error.message}`)
    } finally {
      setInviting(false)
    }
  }

  const getHealthInfo = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-success', bg: 'bg-success/10', bar: 'bg-success' }
    if (score >= 60) return { label: 'Good', color: 'text-primary', bg: 'bg-primary/10', bar: 'bg-primary' }
    if (score >= 40) return { label: 'Fair', color: 'text-secondary-gold', bg: 'bg-secondary-gold/10', bar: 'bg-secondary-gold' }
    return { label: 'Needs attention', color: 'text-secondary-orange', bg: 'bg-secondary-orange/10', bar: 'bg-secondary-orange' }
  }

  const groupTypes = ['Tailors Association', 'Market Traders Association', 'Artisan Guild', 'Ajo/Savings Circle', 'Cooperative Society', 'Trade Union', 'Other']

  if (needsCluster) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-light/10">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-secondary-slate mb-2">Finish setting up your cluster</h2>
          <p className="text-secondary-slate/60 mb-8">Your account is ready. Tell us about your cluster.</p>
          <form onSubmit={handleCreateCluster} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-slate mb-1">Cluster Name</label>
              <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Oba Akran Phone Repair Association"
                value={clusterForm.name} onChange={e => setClusterForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-slate mb-1">Type</label>
              <select required className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-primary"
                value={clusterForm.type} onChange={e => setClusterForm(p => ({ ...p, type: e.target.value }))}>
                <option value="">Select type</option>
                {groupTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-slate mb-1">Location</label>
              <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Ikeja, Lagos"
                value={clusterForm.location} onChange={e => setClusterForm(p => ({ ...p, location: e.target.value }))} />
            </div>
            <button type="submit" disabled={creatingCluster}
              className="w-full bg-gradient-to-r from-primary-deep to-primary hover:from-primary-deep hover:to-primary-deep text-white font-semibold py-3 rounded-xl transition disabled:opacity-50">
              {creatingCluster ? 'Creating...' : 'Create Cluster'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (!user || !clusterData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-light/10">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="h-6 bg-gray-200 rounded-lg w-56 mb-6" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-52 bg-gray-200 rounded-2xl" />
              <div className="h-52 bg-gray-200 rounded-2xl" />
            </div>
            <div className="space-y-4">
              <div className="h-52 bg-gray-200 rounded-2xl" />
              <div className="h-28 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const healthInfo = getHealthInfo(clusterData.healthScore)
  const growthPct = (clusterData.growthRate * 100).toFixed(1)
  const isGrowthPositive = clusterData.growthRate >= 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-light/10">
      <Navbar />

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >

        {/* Breadcrumb + Actions */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-secondary-slate/60">
            <span>Dashboard</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-secondary-slate">Cluster Leader</span>
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
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary-orange to-secondary-gold text-white rounded-lg shadow-sm hover:shadow-md transition font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add Member
            </button>
            <Link
              to="/demand-signals"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition text-sm"
            >
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Demand Signals</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition text-sm text-secondary-slate/70"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column ── */}
          <div className="lg:col-span-1 space-y-6">

            {/* Cluster Identity Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-deep to-primary px-6 py-4">
                <h2 className="text-white font-bold">Cluster Profile</h2>
                <p className="text-primary-light text-sm">ID: {String(clusterData.id).slice(0, 8)}…</p>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary-orange/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary-deep">
                      {clusterData.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'CL'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-secondary-slate leading-tight">{clusterData.name}</h3>
                    <span className="inline-block bg-secondary-gold/20 text-secondary-slate text-xs font-semibold px-2 py-0.5 rounded-full mt-1">
                      Cluster Leader
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-secondary-slate/60 text-sm">Type</span>
                    <span className="font-medium text-secondary-slate text-sm">{clusterData.type || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-secondary-slate/60 text-sm">Location</span>
                    <span className="font-medium text-secondary-slate text-sm">{clusterData.location || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-secondary-slate/60 text-sm">Leader</span>
                    <span className="font-medium text-secondary-slate text-sm">{user.name}</span>
                  </div>
                  {leaderProfile?.phone && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-secondary-slate/60 text-sm">Phone</span>
                      <span className="font-medium text-secondary-slate text-sm">{leaderProfile.phone}</span>
                    </div>
                  )}
                  {leaderProfile?.squad_virtual_account_id && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-secondary-slate/60 text-sm">Virtual Account</span>
                      <span className="font-medium text-secondary-slate font-mono text-sm">{leaderProfile.squad_virtual_account_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-secondary-slate/60 text-sm">Total Members</span>
                    <span className="font-medium text-secondary-slate">{clusterData.totalMembers}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Score Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-secondary-slate">Cluster Health</h3>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${healthInfo.bg} ${healthInfo.color}`}>
                  {healthInfo.label}
                </span>
              </div>
              <div className="text-5xl font-bold text-primary mb-2">
                {clusterData.healthScore}<span className="text-2xl text-secondary-slate/40">/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className={`${healthInfo.bar} rounded-full h-2 transition-all duration-700`}
                  style={{ width: `${clusterData.healthScore}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs">
                <div>
                  <p className="text-secondary-slate/60">Active members</p>
                  <p className="font-semibold text-secondary-slate mt-0.5">{clusterData.activeMembers} / {clusterData.totalMembers}</p>
                </div>
                <div>
                  <p className="text-secondary-slate/60">Demand signals</p>
                  <p className="font-semibold text-secondary-slate mt-0.5">{opportunities.length} detected</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-secondary-gold/10 to-primary/10 rounded-2xl shadow-lg border border-secondary-gold/20 p-6">
              <h3 className="font-semibold text-secondary-slate mb-4">Leader Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="w-full flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-sm transition text-sm font-medium text-secondary-slate"
                >
                  <span>Add new member</span>
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <Link
                  to="/demand-signals"
                  className="w-full flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-sm transition text-sm font-medium text-secondary-slate"
                >
                  <span>View demand signals</span>
                  <svg className="w-4 h-4 text-secondary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-primary-deep to-primary rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Welcome back, {user.name?.split(' ')[0]} 👋</h1>
                  <p className="text-primary-light mt-1">{clusterData.name}</p>
                  <p className="text-primary-light/70 text-sm mt-1">{clusterData.location}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-3xl font-bold">{clusterData.totalMembers}</div>
                  <div className="text-primary-light text-sm">total members</div>
                </div>
              </div>
            </div>

            {/* Business Activity */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-bold text-secondary-slate">Business Activity</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-secondary-slate">
                    {clusterData.currentVolume > 0 ? `₦${clusterData.currentVolume.toLocaleString('en-NG')}` : '₦0'}
                  </div>
                  <div className="text-xs text-secondary-slate/60 mt-1">Monthly Volume</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className={`text-2xl font-bold ${isGrowthPositive ? 'text-success' : 'text-danger'}`}>
                    {isGrowthPositive ? '+' : ''}{growthPct}%
                  </div>
                  <div className="text-xs text-secondary-slate/60 mt-1">vs Last Month</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-secondary-slate">{transactions.length}</div>
                  <div className="text-xs text-secondary-slate/60 mt-1">Recent Txns</div>
                </div>
              </div>
              {isGrowthPositive && clusterData.currentVolume > 0 && (
                <div className="mt-4 flex items-center gap-2 bg-success/10 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm text-success font-medium">
                    Your cluster grew {growthPct}% this month — keep it up!
                  </span>
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-bold text-secondary-slate">Financial Summary</h3>
              </div>

              {financialSummary ? (
                <div className="space-y-4">
                  <p className="text-secondary-slate/80 leading-relaxed">{financialSummary.profile}</p>
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-secondary-slate/60">30-day Revenue</p>
                      <p className="font-bold text-secondary-slate mt-1">
                        ₦{Number(financialSummary.transaction_summary?.total_volume ?? 0).toLocaleString('en-NG')}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-secondary-slate/60">Unique Customers</p>
                      <p className="font-bold text-secondary-slate mt-1">
                        {financialSummary.transaction_summary?.unique_customers ?? 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-secondary-slate/60">Transactions</p>
                      <p className="font-bold text-secondary-slate mt-1">
                        {financialSummary.transaction_summary?.transaction_count ?? 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-secondary-slate/60">Activity Score</p>
                      <p className="font-bold text-primary mt-1">
                        {Math.round(financialSummary.score ?? 0)}/100
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary-slate/60 text-sm">
                  {clusterData.currentVolume > 0
                    ? 'Generating financial summary…'
                    : 'No transactions yet. Start receiving payments to build your financial profile.'}
                </p>
              )}
            </div>

            {/* Demand Signals */}
            <div className="bg-gradient-to-r from-secondary-orange/10 to-secondary-gold/10 rounded-2xl shadow-lg border border-secondary-orange/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-secondary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-lg font-bold text-secondary-slate">Demand Signals</h3>
                </div>
                <Link to="/demand-signals" className="text-sm text-secondary-orange hover:underline flex items-center gap-1">
                  View all →
                </Link>
              </div>

              {opportunities.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-secondary-slate/60 text-sm">Scanning for demand signals…</p>
                  <p className="text-xs text-secondary-slate/40 mt-1">Signals appear as transaction activity increases.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {opportunities.slice(0, 3).map((sig, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-secondary-slate capitalize">
                          {sig.signal_type?.replace(/_/g, ' ') || 'Activity signal'}
                        </p>
                        {sig.description && <p className="text-sm text-secondary-slate/60 mt-0.5">{sig.description}</p>}
                        {sig.recommended_skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {sig.recommended_skills.map(s => (
                              <span key={s} className="bg-secondary-orange/10 text-secondary-orange text-xs px-2 py-0.5 rounded-full capitalize">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${sig.strength >= 0.7 ? 'bg-secondary-orange/20 text-secondary-orange' : 'bg-secondary-gold/20 text-secondary-slate'}`}>
                        {sig.strength >= 0.7 ? 'High' : 'Growing'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Members */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-secondary-slate flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Members ({clusterData.totalMembers})
                </h3>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  + Add member
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {members.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-2">👥</div>
                    <p className="text-secondary-slate/60 text-sm">No members yet.</p>
                    <button onClick={() => setShowInviteModal(true)} className="mt-3 text-sm text-primary hover:underline">
                      Add your first member →
                    </button>
                  </div>
                ) : (
                  members.slice(0, 6).map((m, idx) => (
                    <div key={m.id || idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary-orange/20 flex items-center justify-center text-primary-deep font-semibold text-sm flex-shrink-0">
                          {m.first_name?.charAt(0)}{m.last_name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-secondary-slate text-sm">{m.first_name} {m.last_name}</div>
                          <div className="text-xs text-secondary-slate/50">{m.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {m.squad_virtual_account_id ? (
                          <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">Account ✓</span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-secondary-slate/50 px-2 py-0.5 rounded-full">No account</span>
                        )}
                        <span className="text-xs text-secondary-slate/40 capitalize">{m.role_in_cluster || 'member'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {members.length > 6 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center">
                  <span className="text-sm text-secondary-slate/50">+{members.length - 6} more members</span>
                </div>
              )}
            </div>

            {/* Interested Workers */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-secondary-gold/20 to-secondary-orange/10 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-secondary-slate flex items-center gap-2">
                  <svg className="w-5 h-5 text-secondary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Interested Workers ({interestedWorkers.length})
                </h3>
                <span className="text-xs text-secondary-slate/50">Job seekers who want to work here</span>
              </div>
              <div className="divide-y divide-gray-100">
                {interestedWorkers.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="text-secondary-slate/60 text-sm">No one has expressed interest yet.</p>
                    <p className="text-xs text-secondary-slate/40 mt-1">Job seekers browsing opportunities can tap "I'm Interested" to appear here.</p>
                  </div>
                ) : (
                  interestedWorkers.map((w, idx) => (
                    <div key={w.interest_id || idx} className="px-6 py-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-orange/20 to-secondary-gold/20 flex items-center justify-center text-secondary-orange font-bold text-sm flex-shrink-0">
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
                        {w.signal_type && (
                          <span className="text-xs bg-secondary-orange/10 text-secondary-orange px-2 py-1 rounded-full whitespace-nowrap capitalize flex-shrink-0">
                            {w.signal_type.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      {w.bio && (() => {
                        const { description, skillLevel, experience, workPreference } = parseBio(w.bio)
                        return (
                          <div className="mt-2 space-y-1.5 pl-13">
                            {description && <p className="text-xs text-secondary-slate/50">{description}</p>}
                            <div className="flex flex-wrap gap-1.5">
                              {skillLevel && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{skillLevel}</span>}
                              {experience && <span className="text-xs bg-secondary-gold/20 text-secondary-slate px-2 py-0.5 rounded-full">{experience}</span>}
                              {workPreference && <span className="text-xs bg-secondary-orange/10 text-secondary-orange px-2 py-0.5 rounded-full">{workPreference}</span>}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-secondary-slate/40">© 2026 Team Hacktivity · Kluster Inc.</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-primary-deep to-primary px-6 py-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">Add a Member</h3>
                  <p className="text-primary-light text-sm mt-0.5">A virtual account will be created automatically.</p>
                </div>
                <button onClick={() => setShowInviteModal(false)} className="text-white/70 hover:text-white text-2xl leading-none">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-slate mb-2">Full Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={inviteData.fullName}
                  onChange={e => setInviteData(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="e.g., Adeola Williams"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-slate mb-2">Phone Number <span className="text-danger">*</span></label>
                <input
                  type="tel"
                  value={inviteData.phone}
                  onChange={e => setInviteData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="08031234567"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="bg-primary/5 rounded-xl p-4">
                <p className="text-xs text-secondary-slate/70">
                  The member activates their account by visiting "Activate Account" and entering this phone number.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-secondary-slate/70 font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={handleSendInvite} disabled={inviting}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-deep to-primary text-white rounded-xl font-medium transition disabled:opacity-50">
                  {inviting ? 'Adding…' : 'Add to Cluster'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClusterDashboard
