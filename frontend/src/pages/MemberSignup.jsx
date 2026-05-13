import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'

const MemberSignup = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    clusterCode: '',
    clusterName: '',
    occupation: '',
    skills: [],
    language: '',
    location: '',
    referralCode: '',
    verificationId: '',
    verificationType: 'NIN'
  })
  
  const [availableClusters, setAvailableClusters] = useState([])
  const [selectedCluster, setSelectedCluster] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showClusterSearch, setShowClusterSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const skillOptions = [
    'Tailoring', 'Electronics Repair', 'Sales', 'Customer Service',
    'Delivery', 'Carpentry', 'Plumbing', 'Hair Styling', 'Catering',
    'Driving', 'Farming', 'Bead Making', 'Shoemaking', 'Painting'
  ]

  const languageOptions = [
    'English', 'Yoruba', 'Hausa', 'Igbo', 'Pidgin'
  ]

  // Mock available clusters (would come from API)
  useEffect(() => {
    // Simulate fetching clusters from backend
    const mockClusters = [
      {
        id: 'CLU-001',
        name: 'Oba Akran Phone Repair Association',
        code: 'PHONE-LAG-001',
        type: 'Artisan Guild',
        location: 'Computer Village, Ikeja',
        leaderName: 'Tunde Adebayo',
        memberCount: 87,
        healthScore: 82,
        joinCode: 'KLUSTER-PHONE-001'
      },
      {
        id: 'CLU-002',
        name: 'Balogun Market Traders Union',
        code: 'MRKT-LAG-002',
        type: 'Market Traders Association',
        location: 'Balogun Market, Lagos Island',
        leaderName: 'Mrs. Folake Williams',
        memberCount: 234,
        healthScore: 91,
        joinCode: 'KLUSTER-MRKT-002'
      },
      {
        id: 'CLU-003',
        name: 'Abuja Tailors Cooperative',
        code: 'TAILOR-ABJ-003',
        type: 'Cooperative Society',
        location: 'Wuse Market, Abuja',
        leaderName: 'Mr. John Okonkwo',
        memberCount: 156,
        healthScore: 78,
        joinCode: 'KLUSTER-TAILOR-003'
      },
      {
        id: 'CLU-004',
        name: 'Kano Ajo Savings Circle',
        code: 'AJU-KAN-004',
        type: 'Ajo/Savings Circle',
        location: 'Kano City, Kano',
        leaderName: 'Hajiya Aisha Bello',
        memberCount: 45,
        healthScore: 95,
        joinCode: 'KLUSTER-AJO-004'
      }
    ]
    setAvailableClusters(mockClusters)
    
    // Check if cluster code was passed from leader invite
    if (location.state?.clusterCode) {
      setFormData(prev => ({ ...prev, clusterCode: location.state.clusterCode }))
      const cluster = mockClusters.find(c => c.joinCode === location.state.clusterCode)
      if (cluster) {
        setSelectedCluster(cluster)
        setFormData(prev => ({ ...prev, clusterName: cluster.name }))
      }
    }
  }, [location.state])

  const filteredClusters = availableClusters.filter(cluster =>
    cluster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cluster.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cluster.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        skills: checked 
          ? [...prev.skills, value]
          : prev.skills.filter(skill => skill !== value)
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleClusterCodeVerify = async () => {
    if (!formData.clusterCode) {
      alert('Please enter a cluster code')
      return
    }
    
    setIsVerifying(true)
    // Simulate API call to verify cluster code
    setTimeout(() => {
      const cluster = availableClusters.find(c => c.joinCode === formData.clusterCode)
      if (cluster) {
        setSelectedCluster(cluster)
        setFormData(prev => ({ ...prev, clusterName: cluster.name }))
        alert(`Successfully joined ${cluster.name}!`)
      } else {
        alert('Invalid cluster code. Please check and try again.')
        setSelectedCluster(null)
        setFormData(prev => ({ ...prev, clusterName: '' }))
      }
      setIsVerifying(false)
    }, 1000)
  }

  const selectClusterFromList = (cluster) => {
    setSelectedCluster(cluster)
    setFormData(prev => ({ 
      ...prev, 
      clusterCode: cluster.joinCode,
      clusterName: cluster.name 
    }))
    setShowClusterSearch(false)
  }

  // Generate random member ID
  const generateMemberId = () => {
    const prefixes = ['MBR', 'TRD', 'WRK', 'ART', 'VND']
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const randomNum = Math.floor(Math.random() * 90000) + 10000
    const suffix = ['ACTIVE', 'NEW', 'GROWING', 'RISING'][Math.floor(Math.random() * 4)]
    return `${randomPrefix}-${randomNum}-${suffix}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!agreeTerms) {
      alert('Please agree to the terms and conditions')
      return
    }
    
    if (!selectedCluster) {
      alert('Please enter a valid cluster code or select a cluster')
      return
    }
    
    if (formData.skills.length === 0) {
      alert('Please select at least one skill')
      return
    }
    
    setIsSubmitting(true)
    
    // Simulate API call to register member
    setTimeout(() => {
      // Create member profile
      const memberProfile = {
        id: generateMemberId(),
        name: formData.fullName,
        tier: 'New Member',
        sector: formData.occupation,
        location: formData.location || selectedCluster.location,
        joinDate: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        kycStatus: 'Pending',
        activityScore: 0,
        scoreChange: 0,
        clusterRank: 'New Member',
        rankDescription: 'Just joined the cluster. Start transacting to build your economic identity.',
        eligibleAmount: 0,
        confidenceScore: 0,
        creditBrief: 'New cluster member. Economic profile will develop as transactions flow through the platform. Complete KYC verification to unlock financial services.',
        groupName: selectedCluster.name,
        groupId: selectedCluster.id,
        memberCount: selectedCluster.memberCount,
        phone: formData.phone,
        email: formData.email,
        skills: formData.skills,
        language: formData.language,
        occupation: formData.occupation,
        recentActivity: [
          {
            id: 1,
            title: `Joined ${selectedCluster.name}`,
            description: `Became a member of ${selectedCluster.name}`,
            time: 'Just now',
            type: 'registration'
          },
          {
            id: 2,
            title: 'Squad Virtual Account Created',
            description: 'Ready to receive and send payments',
            time: 'Just now',
            type: 'account'
          },
          {
            id: 3,
            title: 'KYC Initiated',
            description: 'Verification pending submission',
            time: 'Just now',
            type: 'kyc'
          }
        ]
      }
      
      setIsSubmitting(false)
      
      // Navigate to member profile
      navigate(`/member/${memberProfile.id}`, { 
        state: { 
          newMember: memberProfile,
          isNewMember: true 
        } 
      })
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-light/10">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary-deep/10 rounded-full px-4 py-1.5 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-primary-deep text-xs font-semibold">JOIN A CLUSTER</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-secondary-slate mb-3">
            Join a <span className="bg-gradient-to-r from-secondary-orange to-secondary-gold bg-clip-text text-transparent">Cluster</span>
          </h1>
          <p className="text-secondary-slate/60 max-w-2xl mx-auto">
            Connect with your community, build your economic identity, and access financial services.
            No bank account required.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</div>
              <span className="ml-2 text-sm font-medium text-secondary-slate">Cluster</span>
            </div>
            <div className="w-12 h-0.5 bg-primary/30"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</div>
              <span className="ml-2 text-sm font-medium text-secondary-slate">Your Info</span>
            </div>
            <div className="w-12 h-0.5 bg-primary/30"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">3</div>
              <span className="ml-2 text-sm font-medium text-secondary-slate">Skills</span>
            </div>
            <div className="w-12 h-0.5 bg-primary/30"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">4</div>
              <span className="ml-2 text-sm font-medium text-secondary-slate">Verify</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-up">
          <div className="bg-gradient-to-r from-primary-deep to-primary px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Member Registration
            </h2>
            <p className="text-primary-light text-sm mt-1">Join an existing cluster and start building your economic identity</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Cluster Selection Section */}
            <div>
              <h3 className="text-lg font-semibold text-secondary-slate mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-secondary-orange/10 text-secondary-orange flex items-center justify-center text-sm font-bold">1</span>
                Find Your Cluster
              </h3>
              
              {/* Option 1: Enter Cluster Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-slate mb-2">
                  Cluster Join Code (from your cluster leader)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="clusterCode"
                    value={formData.clusterCode}
                    onChange={handleChange}
                    placeholder="e.g., KLUSTER-PHONE-001"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleClusterCodeVerify}
                    disabled={isVerifying}
                    className="px-4 py-2 bg-secondary-orange text-white rounded-lg font-medium hover:bg-secondary-orange/90 transition disabled:opacity-50"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
                {selectedCluster && (
                  <div className="mt-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium text-success-dark">Connected to: {selectedCluster.name}</span>
                    </div>
                    <p className="text-xs text-secondary-slate/60 mt-1">
                      Location: {selectedCluster.location} | Members: {selectedCluster.memberCount} | Health Score: {selectedCluster.healthScore}/100
                    </p>
                  </div>
                )}
              </div>

              {/* Option 2: Browse Clusters */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowClusterSearch(!showClusterSearch)}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Don't have a code? Browse available clusters
                </button>
                
                {showClusterSearch && (
                  <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredClusters.map(cluster => (
                        <button
                          key={cluster.id}
                          type="button"
                          onClick={() => selectClusterFromList(cluster)}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition"
                        >
                          <div className="font-medium text-secondary-slate">{cluster.name}</div>
                          <div className="text-xs text-secondary-slate/60 mt-1">
                            {cluster.location} • {cluster.type} • {cluster.memberCount} members
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-primary">Health: {cluster.healthScore}/100</div>
                            <div className="text-xs text-secondary-gold">Join code: {cluster.joinCode}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information Section */}
            {selectedCluster && (
              <>
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-secondary-slate mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</span>
                    Your Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-slate mb-2">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="Chioma Okafor"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-slate mb-2">
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="0803 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-slate mb-2">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="chioma@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-slate mb-2">
                        Occupation <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        required
                        value={formData.occupation}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="Phone Accessories Seller"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-slate mb-2">
                        Preferred Language
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      >
                        <option value="">Select language</option>
                        {languageOptions.map(lang => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-slate mb-2">
                        Location (Optional)
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="Ikeja, Lagos"
                      />
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-secondary-slate mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-secondary-gold/10 text-secondary-gold flex items-center justify-center text-sm font-bold">3</span>
                    Your Skills
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {skillOptions.map(skill => (
                      <label key={skill} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="skills"
                          value={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={handleChange}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-sm text-secondary-slate">{skill}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-secondary-slate/50 mt-2">
                    Select all that apply. This helps us match you with opportunities.
                  </p>
                </div>

                {/* Verification Section */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-secondary-slate mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">4</span>
                    Identity Verification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-slate mb-2">
                        Verification Type
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="verificationType"
                            value="NIN"
                            checked={formData.verificationType === 'NIN'}
                            onChange={handleChange}
                            className="text-primary focus:ring-primary"
                          />
                          <span>NIN</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="verificationType"
                            value="BVN"
                            checked={formData.verificationType === 'BVN'}
                            onChange={handleChange}
                            className="text-primary focus:ring-primary"
                          />
                          <span>BVN</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-slate mb-2">
                        {formData.verificationType} Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="verificationId"
                        required
                        value={formData.verificationId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder={formData.verificationType === 'NIN' ? '12345678901' : '12345678901'}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-secondary-slate/50 mt-2">
                    Your information is encrypted and secure. Used only for KYC compliance.
                  </p>
                </div>

                {/* Referral Code (Optional) */}
                <div className="pt-2">
                  <label className="block text-sm font-medium text-secondary-slate mb-2">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Enter code if referred by a member"
                  />
                </div>

                {/* Terms and Submit */}
                <div className="pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-3 mb-6">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <span className="text-sm text-secondary-slate/80">
                      I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and 
                      <a href="#" className="text-primary hover:underline"> Privacy Policy</a>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary-deep to-primary hover:from-primary-deep/90 hover:to-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Joining Cluster...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Join Cluster & Get Started
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Benefits Box */}
        <div className="mt-8 bg-gradient-to-r from-primary-deep/5 to-secondary-orange/5 rounded-xl p-4 border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-primary-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-secondary-slate text-sm">What happens after joining?</h4>
              <p className="text-secondary-slate/60 text-xs mt-1">
                • You'll receive a Squad virtual account automatically<br />
                • Start transacting to build your Activity Score<br />
                • Qualify for micro-loans and financial products<br />
                • Get matched with economic opportunities in your cluster<br />
                • Build a portable economic identity that grows with you
              </p>
            </div>
          </div>
        </div>

        {/* Alternative: Become a Leader */}
        <div className="mt-4 text-center">
          <p className="text-sm text-secondary-slate/60">
            Don't see your cluster?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-primary hover:underline font-medium"
            >
              Register as a Cluster Leader →
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default MemberSignup