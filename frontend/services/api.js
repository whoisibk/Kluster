// Mock API service - Replace with actual API calls to your FastAPI backend
const API_BASE_URL = 'http://localhost:8000/api' // Your FastAPI backend URL

class KlusterAPI {
  // Get demand signals for a specific location
  async getDemandSignals(location = 'LAGOS', timeRange = 'week') {
    try {
      // In production, this would call your FastAPI endpoint:
      // const response = await fetch(`${API_BASE_URL}/demand-signals?location=${location}&range=${timeRange}`)
      // return await response.json()
      
      // Mock data for now - this simulates what your backend would return
      return this.getMockDemandData(location, timeRange)
    } catch (error) {
      console.error('Error fetching demand signals:', error)
      return null
    }
  }

  // Get active nodes from your cluster data
  async getActiveNodes(clusterId = null) {
    try {
      // const response = await fetch(`${API_BASE_URL}/clusters/active-nodes`)
      // return await response.json()
      
      return this.getMockActiveNodes()
    } catch (error) {
      console.error('Error fetching active nodes:', error)
      return []
    }
  }

  // Get financial product eligibility based on demand
  async getFinancialProductsByDemand(demandSignalId) {
    try {
      // const response = await fetch(`${API_BASE_URL}/financial/products?demand_id=${demandSignalId}`)
      // return await response.json()
      
      return {
        available: ['Micro-Loans', 'Savings Plans', 'Group Insurance'],
        eligibleMembers: 342,
        totalDisbursed: '₦2.8M'
      }
    } catch (error) {
      console.error('Error fetching financial products:', error)
      return null
    }
  }

  // Get workers matching a demand signal
  async getMatchingWorkers(signalId) {
    try {
      // const response = await fetch(`${API_BASE_URL}/matching/workers?signal_id=${signalId}`)
      // return await response.json()
      
      return [
        { id: 1, name: 'John Doe', skill: 'Phone Repair', distance: '2km', score: 92 },
        { id: 2, name: 'Jane Smith', skill: 'Tailoring', distance: '3km', score: 88 }
      ]
    } catch (error) {
      console.error('Error fetching matching workers:', error)
      return []
    }
  }

  // Generate AI insights for demand signals
  async generateInsights(surgeData) {
    try {
      // const response = await fetch(`${API_BASE_URL}/ai/insights`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(surgeData)
      // })
      // return await response.json()
      
      return "Based on current demand signals, prioritize resource allocation to high-intensity clusters. Expected 40% increase in opportunities over next 7 days."
    } catch (error) {
      console.error('Error generating insights:', error)
      return null
    }
  }

  // Mock data - replace with real API calls
  getMockDemandData(location, timeRange) {
    const mockData = {
      LAGOS: {
        surges: [
          { id: 1, location: 'IKEJA', sector: 'Phone Repair', intensity: 92, workers: 12, growth: '+34%', clusterId: 'CLU-001' },
          { id: 2, location: 'YABA', sector: 'Tailoring', intensity: 87, workers: 8, growth: '+28%', clusterId: 'CLU-002' },
          { id: 3, location: 'LEKKI', sector: 'Dispatch', intensity: 78, workers: 15, growth: '+45%', clusterId: 'CLU-003' },
        ],
        overview: {
          members: 1240,
          transactions: 8452,
          totalVolume: '₦12.4M',
          activeClusters: 14,
          jobMatches: 47
        }
      },
      ABUJA: {
        surges: [
          { id: 1, location: 'WUSE', sector: 'Tailoring', intensity: 85, workers: 10, growth: '+25%', clusterId: 'CLU-004' },
          { id: 2, location: 'GWAGWALADA', sector: 'Farming', intensity: 76, workers: 20, growth: '+32%', clusterId: 'CLU-005' },
        ],
        overview: {
          members: 890,
          transactions: 5234,
          totalVolume: '₦7.2M',
          activeClusters: 8,
          jobMatches: 28
        }
      }
    }
    
    return mockData[location] || mockData.LAGOS
  }

  getMockActiveNodes() {
    return [
      { id: 1, name: 'SEYI', role: 'Mobile Technician', location: 'Ikeja', status: 'active', demand: 'high', clusterId: 'CLU-001', memberId: 'TRO-3892-ALPHA' },
      { id: 2, name: 'CHUKWU', role: 'Hardware Specialist', location: 'Ikeja', status: 'active', demand: 'critical', clusterId: 'CLU-001', memberId: 'MBR-12345' },
      { id: 3, name: 'MNEAKA', role: 'Master Tailor', location: 'Yaba', status: 'active', demand: 'high', clusterId: 'CLU-002', memberId: 'MBR-67890' },
      { id: 4, name: 'IFEOMA', role: 'Custom Fits', location: 'Yaba', status: 'active', demand: 'bulk_orders', clusterId: 'CLU-002', memberId: 'MBR-23456' },
      { id: 5, name: 'CHIMEDU', role: 'Dispatch Rider', location: 'Lekki', status: 'active', demand: 'high', clusterId: 'CLU-003', memberId: 'MBR-34567' },
      { id: 6, name: 'AMARA', role: 'Express Delivery', location: 'Lekki', status: 'active', demand: 'urgent', clusterId: 'CLU-003', memberId: 'MBR-45678' },
    ]
  }
}

export default new KlusterAPI()