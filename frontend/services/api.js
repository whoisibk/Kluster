const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://kluster-production-159b.up.railway.app'
console.log('[API] base URL:', API_BASE_URL)

const apiCall = async (endpoint, options = {}) => {
  const token = sessionStorage.getItem('kluster_token')
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const detail = body.detail || JSON.stringify(body) || response.statusText
    const err = new Error(detail)
    err.status = response.status
    throw err
  }
  return await response.json()
}

export const klusterAPI = {
  // Auth
  signup: (data) => apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  login: (email, password) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),

  registerCluster: (data) => apiCall('/clusters/create', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Members
  findMember: (phone) => apiCall(`/members/find?phone=${phone}`),
  activateMember: (data) => apiCall('/members/activate', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getMemberProfile: (memberId) => apiCall(`/members/${memberId}`),
  
  // Clusters
  getClusterDashboard: (clusterId) => apiCall(`/clusters/${clusterId}/dashboard`),
  getClusterHealth: (clusterId) => apiCall(`/clusters/${clusterId}/health`),
  inviteMember: (data) => apiCall('/clusters/invite', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Demand Signals
  getDemandSignals: (location) => apiCall(`/demand-signals?location=${location}`),
  expressInterest: (signalId, workerId) => apiCall('/demand-signals/interest', {
    method: 'POST',
    body: JSON.stringify({ signal_id: signalId, worker_id: workerId })
  }),
  
  // Job Seekers
  createWorkerProfile: (data) => apiCall('/workers/profile', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getWorkerDashboard: (workerId) => apiCall(`/workers/${workerId}/dashboard`),
  
  // Transactions
  getTransactions: (memberId) => apiCall(`/transactions?member_id=${memberId}`),
}

export default klusterAPI