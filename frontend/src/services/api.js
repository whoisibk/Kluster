const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

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
    const err = new Error(body.detail || `API Error: ${response.status}`)
    err.status = response.status
    throw err
  }

  return await response.json()
}

export const klusterAPI = {
  // Auth endpoints
  signup: (data) => apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  login: (email, password) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  
  memberActivate: (data) => apiCall('/auth/member-activate', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  jobSeekerSignup: (data) => apiCall('/auth/job-seeker-signup', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Cluster endpoints
  createCluster: (data) => apiCall('/clusters/create', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  getMyCluster: () => apiCall('/clusters/me'),
  
  getAllClusters: () => apiCall('/clusters/all'),
  
  getClusterMembers: () => apiCall('/clusters/members'),
  
  addMemberToCluster: (data) => apiCall('/clusters/members', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  getClusterHealth: () => apiCall('/clusters/health'),
  
  getClusterDemand: () => apiCall('/clusters/demand'),
  
  getClusterTransactions: () => apiCall('/clusters/transactions'),
  
  // Member endpoints
  lookupMemberByPhone: (phone) => apiCall(`/members/lookup?phone=${phone}`),
  
  getMyProfile: () => apiCall('/members/me'),
  
  getMyTransactions: () => apiCall('/members/me/transactions'),
  
  getMyScore: () => apiCall('/members/me/score'),
  
  getMyEconomicProfile: () => apiCall('/members/me/profile'),
  
  // Job Seeker endpoints
  getJobSeekerProfile: () => apiCall('/job-seekers/me'),
  
  // Matching endpoints
  getOpportunities: () => apiCall('/matching/opportunities'),

  // Financial endpoints
  prequalify: () => apiCall('/financial/prequalify', { method: 'POST' }),

  disburse: (data) => apiCall('/financial/disburse', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Sim Transfer (for testing)
  simulatePayment: (data) => apiCall('/sim-transfer/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Webhook (usually backend to backend, but kept for reference)
  squadWebhook: (data) => apiCall('/webhooks/squad', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export default klusterAPI