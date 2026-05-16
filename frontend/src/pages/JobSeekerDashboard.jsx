import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import klusterAPI from '../services/api'

const EXP_LABELS = { less_than_1: 'Under 1 year', '1_to_3': '1–3 years', '3_to_5': '3–5 years', '5_plus': '5+ years' }
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

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const SparklesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const ZapIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const JS_CACHE_KEY = 'kluster_js_dash_v1'
const JS_CACHE_TTL = 90000

const getJSCache = () => {
  try {
    const raw = sessionStorage.getItem(JS_CACHE_KEY)
    if (!raw) return null
    const { ts, payload } = JSON.parse(raw)
    if (Date.now() - ts > JS_CACHE_TTL) return null
    return payload
  } catch { return null }
}

const setJSCache = (payload) => {
  try { sessionStorage.setItem(JS_CACHE_KEY, JSON.stringify({ ts: Date.now(), payload })) } catch {}
}

const JobSeekerDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [opportunities, setOpportunities] = useState([])
  const [interestedSignals, setInterestedSignals] = useState([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      const storedUser = sessionStorage.getItem('kluster_user')
      if (!storedUser) { navigate('/login'); return }

      const userData = JSON.parse(storedUser)
      if (userData.role !== 'job_seeker') { navigate('/login'); return }

      const cached = getJSCache()
      if (cached) {
        setProfile(cached.profile)
        setOpportunities(cached.opportunities ?? [])
        setLoading(false)
      }

      try {
        const data = await klusterAPI.getJobSeekerProfile()
        const skillCount = data.skills?.length ?? 0
        const hasLocation = !!data.location
        const hasBio = !!data.bio
        const profileStrength = Math.min(100, 40 + (skillCount >= 2 ? 30 : skillCount * 15) + (hasLocation ? 15 : 0) + (hasBio ? 15 : 0))

        const profilePayload = {
          id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          skills: data.skills ?? [],
          trade: data.skills?.length > 0 ? data.skills.join(', ') : 'Not specified',
          location: data.location || 'Not specified',
          language: data.language || 'English',
          bio: data.bio || null,
          isMatched: data.is_matched,
          profileStrength,
          joinDate: new Date(data.created_at).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' }),
        }
        setProfile(profilePayload)
        setJSCache({ profile: profilePayload, opportunities })
      } catch (err) {
        console.error('Failed to load job seeker profile:', err)
      } finally {
        setLoading(false)
      }

      // Load AI-matched opportunities in background
      klusterAPI.getOpportunities()
        .then(res => {
          const opps = res.opportunities ?? []
          setOpportunities(opps)
          setJSCache({ profile, opportunities: opps })
        })
        .catch(() => {})
    }

    loadDashboard()
  }, [navigate])

  const handleLogout = () => {
    sessionStorage.removeItem('kluster_user')
    sessionStorage.removeItem('kluster_token')
    navigate('/login')
  }

  const handleExpressInterest = (idx, title) => {
    if (!interestedSignals.includes(idx)) {
      setInterestedSignals(prev => [...prev, idx])
      setToastMessage(`Interest expressed in: ${title}`)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-7 bg-gray-200 rounded w-52 mb-6" />
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-36 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
          {[...Array(2)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-2xl mb-4" />)}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Could not load profile.</p>
            <button onClick={() => navigate('/login')} className="text-teal-600 hover:underline">Return to login</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 pb-24">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">

        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {getGreeting()}, {profile.name.split(' ')[0]} 👋
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-gray-600 font-medium capitalize">{profile.trade}</span>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <LocationIcon />
                  {profile.location}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <SparklesIcon />
                {profile.isMatched ? 'You have been matched to a cluster!' : 'Your profile is active in the Kluster network'}
              </p>
            </div>
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 border border-gray-200 rounded-lg">
              Sign out
            </button>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-semibold text-gray-800">Profile Strength</span>
            </div>
            <span className="text-teal-600 font-semibold">{profile.profileStrength}%</span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div className="bg-teal-600 rounded-full h-2 transition-all duration-500" style={{ width: `${profile.profileStrength}%` }} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400 text-xs">Skills</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.skills.length > 0 ? profile.skills.map(s => (
                  <span key={s} className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-xs capitalize">{s.replace(/_/g, ' ')}</span>
                )) : <span className="text-gray-400 text-xs">None listed</span>}
              </div>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Language</span>
              <p className="font-medium text-gray-700 mt-1">{profile.language}</p>
            </div>
          </div>

          {profile.bio && (() => {
            const { description, skillLevel, experience, workPreference } = parseBio(profile.bio)
            return (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                {description && <p className="text-sm text-gray-600">{description}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {skillLevel && <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full capitalize">{skillLevel}</span>}
                  {experience && <span className="text-xs bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full">{experience}</span>}
                  {workPreference && <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">{workPreference}</span>}
                </div>
              </div>
            )
          })()}

          <p className="text-xs text-gray-400 mt-3">Member since {profile.joinDate}</p>
        </motion.div>

        {/* Matched Badge */}
        {profile.isMatched && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircleIcon />
            </div>
            <div>
              <p className="font-semibold text-green-800 text-sm">You've been matched!</p>
              <p className="text-xs text-green-600">A cluster has shown interest in your skills.</p>
            </div>
          </motion.div>
        )}

        {/* Opportunities Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ZapIcon />
            <h2 className="text-lg font-semibold text-gray-800">Matched Opportunities</h2>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Live</span>
          </div>

          {opportunities.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-2">📡</div>
              <p className="text-gray-500 text-sm">Finding opportunities matched to your skills...</p>
              <p className="text-xs text-gray-400 mt-1">This updates as clusters in your area see activity.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {opportunities.map((opp, idx) => (
                <motion.div key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  className={`bg-white rounded-xl p-4 border transition-all ${interestedSignals.includes(idx) ? 'border-teal-300 bg-teal-50/30' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{opp.cluster_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <LocationIcon />
                        <span className="text-xs text-gray-500">{opp.cluster_location}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${opp.signal_strength >= 0.7 ? 'bg-orange-100 text-orange-700' : opp.signal_strength >= 0.4 ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>
                      {opp.signal_strength >= 0.7 ? 'High demand' : opp.signal_strength >= 0.4 ? 'Growing' : 'Emerging'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 capitalize">{opp.signal_type?.replace(/_/g, ' ')}</p>

                  {opp.match_explanation && (
                    <p className="text-xs text-gray-500 mb-3 italic">"{opp.match_explanation}"</p>
                  )}

                  {opp.recommended_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {opp.recommended_skills.map(s => (
                        <span key={s} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs capitalize">{s}</span>
                      ))}
                    </div>
                  )}

                  {interestedSignals.includes(idx) ? (
                    <div className="flex items-center gap-2 text-teal-600 text-sm">
                      <CheckCircleIcon />
                      <span>Interest expressed ✓</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleExpressInterest(idx, opp.cluster_name)}
                      className="w-full py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition"
                    >
                      Express Interest →
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Visibility Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-teal-50 to-teal-100/30 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <EyeIcon />
            <h2 className="font-semibold text-gray-800">Your Visibility</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-2xl font-bold text-gray-800">{opportunities.length}</div>
              <div className="text-xs text-gray-600">Matched opportunities</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-teal-600">{profile.profileStrength}%</div>
              <div className="text-xs text-gray-600">Profile strength</div>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {profile.skills.length > 0
              ? `Your profile is being surfaced to clusters looking for ${profile.skills[0].replace(/_/g, ' ')} skills.`
              : 'Add skills to your profile to get matched with clusters.'}
          </p>
        </motion.div>

        {/* Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm z-50 flex items-center gap-2"
            >
              <CheckCircleIcon />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Link to="/demand-signals"
            className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium text-center hover:bg-gray-50 transition text-sm">
            Browse Opportunities
          </Link>
          <Link to="/create-profile"
            className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-medium text-center hover:bg-teal-700 transition text-sm">
            Update Profile
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default JobSeekerDashboard
