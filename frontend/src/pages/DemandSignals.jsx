import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import klusterAPI from '../services/api'

const DS_CACHE_TTL = 120000

const getDSCache = (key) => {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const { ts, payload } = JSON.parse(raw)
    if (Date.now() - ts > DS_CACHE_TTL) return null
    return payload
  } catch { return null }
}

const setDSCache = (key, payload) => {
  try { sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), payload })) } catch {}
}

const DemandSignals = () => {
  const navigate = useNavigate()
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expressed, setExpressed] = useState({})
  const user = JSON.parse(sessionStorage.getItem('kluster_user') || '{}')
  const isJobSeeker = user.role === 'job_seeker'

  const handleExpressInterest = async (clusterId, signalType) => {
    try {
      await klusterAPI.expressInterest(clusterId, signalType)
      setExpressed(prev => ({ ...prev, [clusterId]: true }))
    } catch {
      setExpressed(prev => ({ ...prev, [clusterId]: true }))
    }
  }

  useEffect(() => {
    const cacheKey = isJobSeeker ? 'kluster_opportunities_v1' : 'kluster_demand_v1'

    const cached = getDSCache(cacheKey)
    if (cached) {
      setSignals(cached)
      setLoading(false)
    }

    const load = async () => {
      try {
        if (isJobSeeker) {
          const data = await klusterAPI.getOpportunities()
          const result = data?.opportunities ?? (Array.isArray(data) ? data : [])
          setSignals(result)
          setDSCache(cacheKey, result)
        } else {
          const data = await klusterAPI.getClusterDemand()
          const result = data?.signals || []
          setSignals(result)
          setDSCache(cacheKey, result)
        }
      } catch (err) {
        if (!cached) setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isJobSeeker])

  const strengthLabel = (strength) => {
    if (strength >= 0.7) return { label: 'High', cls: 'bg-secondary-orange/20 text-secondary-orange' }
    if (strength >= 0.4) return { label: 'Growing', cls: 'bg-secondary-gold/20 text-secondary-slate' }
    return { label: 'Emerging', cls: 'bg-primary/10 text-primary' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-light/10">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-slate">
              {isJobSeeker ? 'Opportunities' : 'Demand Signals'}
            </h1>
            <p className="text-secondary-slate/60 mt-1">
              {isJobSeeker
                ? 'Clusters actively looking for workers like you'
                : 'Labour demand detected from your cluster\'s transaction patterns'}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-secondary-slate/60 hover:text-secondary-slate flex items-center gap-1"
          >
            ← Back
          </button>
        </div>

        {loading && (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-16 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-2 bg-gray-100 rounded-full w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
            {error.includes('403') ? 'You need an active cluster to view demand signals.' : error}
          </div>
        )}

        {!loading && !error && signals.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📡</div>
            <h3 className="text-lg font-semibold text-secondary-slate mb-2">No signals detected yet</h3>
            <p className="text-secondary-slate/60 text-sm">
              {isJobSeeker
                ? 'No matching opportunities found. Complete your profile to improve matches.'
                : 'Signals appear as transaction volume and growth increase. Keep transacting!'}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {signals.map((signal, idx) => {
            const strength = strengthLabel(signal.strength ?? signal.signal_strength ?? 0)
            return (
              <div key={idx} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-deep to-primary px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-white font-bold capitalize">
                      {(signal.signal_type || signal.cluster_name || 'Signal').replace(/_/g, ' ')}
                    </h2>
                    {signal.cluster_name && isJobSeeker && (
                      <p className="text-primary-light text-sm mt-0.5">{signal.cluster_name}</p>
                    )}
                    {signal.cluster_location && (
                      <p className="text-primary-light/70 text-xs mt-0.5">{signal.cluster_location}</p>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${strength.cls}`}>
                    {strength.label} Demand
                  </span>
                </div>

                <div className="p-6">
                  {signal.description && (
                    <p className="text-secondary-slate/70 text-sm mb-4">{signal.description}</p>
                  )}

                  {signal.match_explanation && (
                    <div className="bg-primary/5 rounded-xl px-4 py-3 mb-4 text-sm text-secondary-slate/80 italic">
                      "{signal.match_explanation}"
                    </div>
                  )}

                  {signal.recommended_skills?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-secondary-slate/50 uppercase tracking-wide mb-2">Skills needed</p>
                      <div className="flex flex-wrap gap-2">
                        {signal.recommended_skills.map(skill => (
                          <span key={skill} className="bg-secondary-orange/10 text-secondary-orange text-xs px-3 py-1 rounded-full capitalize">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {signal.strength != null && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-secondary-slate/50 mb-1">
                        <span>Signal strength</span>
                        <span>{Math.round((signal.strength ?? 0) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-primary to-secondary-orange rounded-full h-1.5 transition-all duration-700"
                          style={{ width: `${Math.round((signal.strength ?? 0) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {isJobSeeker && signal.cluster_id && (
                    <div className="mt-4">
                      {expressed[signal.cluster_id] ? (
                        <div className="w-full py-2.5 rounded-xl bg-success/10 text-success text-sm font-semibold text-center">
                          Interest Sent ✓
                        </div>
                      ) : (
                        <button
                          onClick={() => handleExpressInterest(signal.cluster_id, signal.signal_type)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-deep to-primary text-white text-sm font-semibold hover:from-primary-deep hover:to-primary-deep transition"
                        >
                          I'm Interested →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DemandSignals
