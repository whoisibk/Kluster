import { useParams, useLocation, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const JobSeekerProfile = () => {
  const { id } = useParams()
  const location = useLocation()
  const jobSeeker = location.state?.jobSeeker

  // Mock additional details if not provided
  const profile = jobSeeker || {
    id: id,
    name: 'Chidi Okafor',
    skill: 'Phone Repair',
    experience: '3 years',
    rating: 4.8,
    phone: '08031234567',
    location: 'Ikeja, Lagos',
    portfolio: ['Phone screen repair', 'Battery replacement', 'Water damage repair'],
    availability: 'Available for full-time',
    about: 'Experienced phone repair technician with 3 years of experience. Specialized in iPhone and Samsung repairs.'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back button */}
        <Link to="/demand-signals" className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Demand Signals
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-700 to-teal-600 px-6 py-6 text-center">
            <div className="w-24 h-24 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-3">
              <span className="text-3xl font-bold text-white">
                {profile.name.charAt(0)}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white">{profile.name}</h1>
            <p className="text-teal-100">{profile.skill}</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500">Experience</span>
              <span className="font-medium text-gray-800">{profile.experience}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500">Rating</span>
              <span className="font-medium text-orange-500">★ {profile.rating}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium text-gray-800">{profile.phone}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500">Location</span>
              <span className="font-medium text-gray-800">{profile.location}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500">Availability</span>
              <span className="font-medium text-green-600">{profile.availability}</span>
            </div>
            
            <div className="pt-2">
              <h3 className="font-semibold text-gray-800 mb-2">About</h3>
              <p className="text-gray-600 text-sm">{profile.about}</p>
            </div>
            
            <div className="pt-2">
              <h3 className="font-semibold text-gray-800 mb-2">Skills & Services</h3>
              <div className="flex flex-wrap gap-2">
                {profile.portfolio.map((item, idx) => (
                  <span key={idx} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            
            <button className="w-full mt-4 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition">
              Contact Worker
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobSeekerProfile