const API_BASE_URL = 'https://kluster-production-159b.up.railway.app'

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('kluster_token')
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export const klusterAPI = {
  // Auth
  login: (email, password) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  
  registerCluster: (data) => apiCall('/clusters/register', {
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