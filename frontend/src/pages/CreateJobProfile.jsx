import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import klusterAPI from '../services/api'

// Simple SVG Icon Components
const UserIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const LocationIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ScissorsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
  </svg>
)

const WrenchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const BikeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 6h3l3 4-3 4H5l-3-4 3-4h6z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 6v10" />
  </svg>
)

const HammerIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.5 8.5L12 5l-3.5 3.5M12 5v13" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11h-3.5a1.5 1.5 0 01-1.5-1.5V8a1.5 1.5 0 011.5-1.5H19a1.5 1.5 0 011.5 1.5v1.5A1.5 1.5 0 0119 11z" />
  </svg>
)

const BriefcaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-4 h-4 text-teal-700" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const TargetIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const AwardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447 2.724A1 1 0 013 21.382V5.618a1 1 0 011.447-.894L9 7" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const CameraIcon = () => (
  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const UploadIcon = () => (
  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const HeartIcon = () => (
  <svg className="w-3 h-3 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
)

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const CreateJobProfile = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    location: '',
    language: '',
    workTypes: [],
    skillLevel: '',
    experience: '',
    workedWithCustomers: false,
    ownsTools: false,
    hasMentor: false,
    workPreference: '',
    showWorkPhotos: false,
    workDescription: '',
    certificates: []
  })

  const workTypeOptions = [
    { id: 'tailor', name: 'Tailor', icon: ScissorsIcon, category: 'craft' },
    { id: 'hair_stylist', name: 'Hair Stylist', icon: SparklesIcon, category: 'beauty' },
    { id: 'phone_repair', name: 'Phone Repair', icon: WrenchIcon, category: 'tech' },
    { id: 'carpenter', name: 'Carpenter', icon: HammerIcon, category: 'craft' },
    { id: 'dispatch_rider', name: 'Dispatch Rider', icon: BikeIcon, category: 'logistics' },
    { id: 'welder', name: 'Welder', icon: WrenchIcon, category: 'craft' },
    { id: 'fashion_designer', name: 'Fashion Designer', icon: ScissorsIcon, category: 'craft' },
    { id: 'caterer', name: 'Caterer', icon: SparklesIcon, category: 'service' },
    { id: 'mechanic', name: 'Mechanic', icon: WrenchIcon, category: 'tech' },
    { id: 'other', name: 'Other', icon: BriefcaseIcon, category: 'other' }
  ]

  const skillLevels = [
    { value: 'beginner', label: 'Beginner', description: 'Learning and building skills', icon: TargetIcon },
    { value: 'intermediate', label: 'Intermediate', description: 'Confident in daily work', icon: TrendingUpIcon },
    { value: 'experienced', label: 'Experienced', description: 'Expert in your craft', icon: AwardIcon }
  ]

  const experienceOptions = [
    { value: 'less_than_1', label: 'Less than 1 year' },
    { value: '1_to_3', label: '1–3 years' },
    { value: '3_to_5', label: '3–5 years' },
    { value: '5_plus', label: '5+ years' }
  ]

  const workPreferences = [
    { value: 'full_time', label: 'Full-time', icon: BriefcaseIcon, description: 'Focus on work daily' },
    { value: 'part_time', label: 'Part-time', icon: ClockIcon, description: 'Balance with other things' },
    { value: 'apprenticeship', label: 'Apprenticeship', icon: UsersIcon, description: 'Learn while working' },
    { value: 'contract', label: 'Contract jobs', icon: CalendarIcon, description: 'Project-based work' }
  ]

  const handleWorkTypeToggle = (workTypeId) => {
    setFormData(prev => ({
      ...prev,
      workTypes: prev.workTypes.includes(workTypeId)
        ? prev.workTypes.filter(id => id !== workTypeId)
        : [...prev.workTypes, workTypeId]
    }))
  }

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setCurrentStep(prev => prev - 1)
  }


const handleSubmit = async () => {
  setIsSubmitting(true)

  const nameParts = formData.fullName.trim().split(' ')
  const first_name = nameParts[0]
  const last_name = nameParts.slice(1).join(' ') || first_name

  const bioParts = []
  if (formData.workDescription) bioParts.push(formData.workDescription)
  if (formData.skillLevel) bioParts.push(`Skill level: ${formData.skillLevel}`)
  if (formData.experience) bioParts.push(`Experience: ${formData.experience}`)
  if (formData.workPreference) bioParts.push(`Looking for: ${formData.workPreference}`)

  try {
    await klusterAPI.jobSeekerSignup({
      email: formData.email,
      password: formData.password,
      first_name,
      last_name,
      phone: formData.phoneNumber,
      skills: formData.workTypes,
      language: formData.language || 'English',
      location: formData.location,
      bio: bioParts.join('. ') || null,
    })

    alert('Profile created! You can now sign in.')
    navigate('/login')
  } catch (error) {
    alert(`Failed to create profile: ${error.message}`)
  } finally {
    setIsSubmitting(false)
  }
}
  const canProceed = () => {
    switch(currentStep) {
      case 1:
        return formData.fullName && formData.email && formData.password && formData.phoneNumber && formData.location
      case 2:
        return formData.workTypes.length > 0
      case 3:
        return formData.skillLevel
      case 4:
        return formData.experience
      case 5:
        return formData.workPreference
      default:
        return true
    }
  }

  const stepTitles = [
    { number: 1, title: 'About you' },
    { number: 2, title: 'Your work' },
    { number: 3, title: 'Skill level' },
    { number: 4, title: 'Experience' },
    { number: 5, title: 'Preferences' },
    { number: 6, title: 'Showcase' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-20">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-teal-100 rounded-full px-4 py-1.5 mb-4">
            <StarIcon />
            <span className="text-teal-700 text-sm font-medium">New Profile</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Create Your Work Profile
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Help clusters and businesses understand the kind of work you do.
          </p>
          
          {/* Illustration with Icons */}
          <div className="mt-6 flex justify-center gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <WrenchIcon />
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <ScissorsIcon />
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <BikeIcon />
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <SparklesIcon />
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8 px-2">
          <div className="flex justify-between items-center">
            {stepTitles.map((step, idx) => (
              <div key={step.number} className="flex-1 text-center">
                <div className={`
                  w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all
                  ${currentStep >= step.number 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-gray-200 text-gray-500'}
                `}>
                  {step.number}
                </div>
                <div className="text-xs text-gray-500 mt-1 hidden sm:block">{step.title}</div>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 left-0 h-1 bg-gray-200 rounded-full w-full"></div>
            <div 
              className="absolute top-0 left-0 h-1 bg-teal-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Card */}
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="p-6">
            
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2"><UserIcon /></div>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g., Adeola Williams"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Choose a secure password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2"><PhoneIcon /></div>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="08031234567"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Where are you based?</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2"><LocationIcon /></div>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Computer Village, Ikeja"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base bg-white"
                  >
                    <option value="">Select language</option>
                    <option value="English">English</option>
                    <option value="Yoruba">Yoruba</option>
                    <option value="Igbo">Igbo</option>
                    <option value="Hausa">Hausa</option>
                    <option value="Pidgin">Pidgin</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Type of Work */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What kind of work do you do?
                  </label>
                  <p className="text-gray-500 text-sm mb-4">Select all that apply</p>
                  <div className="grid grid-cols-2 gap-3">
                    {workTypeOptions.map((work) => {
                      const Icon = work.icon
                      return (
                        <button
                          key={work.id}
                          type="button"
                          onClick={() => handleWorkTypeToggle(work.id)}
                          className={`
                            p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3
                            ${formData.workTypes.includes(work.id)
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300'}
                          `}
                        >
                          <div className={formData.workTypes.includes(work.id) ? 'text-teal-600' : 'text-gray-500'}>
                            <Icon />
                          </div>
                          <span className="font-medium text-gray-800 text-sm">{work.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Skill Level */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What's your skill level?
                  </label>
                  <p className="text-gray-500 text-sm mb-4">
                    Choose the option that best describes your current level
                  </p>
                  <div className="space-y-3">
                    {skillLevels.map((level) => {
                      const Icon = level.icon
                      return (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, skillLevel: level.value })}
                          className={`
                            w-full p-4 rounded-xl border-2 text-left transition-all
                            ${formData.skillLevel === level.value
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300'}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={formData.skillLevel === level.value ? 'text-teal-600' : 'text-gray-500'}>
                              <Icon />
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{level.label}</div>
                              <div className="text-sm text-gray-500">{level.description}</div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Experience */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How long have you been doing this work?
                  </label>
                  <div className="space-y-2">
                    {experienceOptions.map((exp) => (
                      <button
                        key={exp.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, experience: exp.value })}
                        className={`
                          w-full p-3 rounded-xl border-2 text-left transition-all
                          ${formData.experience === exp.value
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'}
                        `}
                      >
                        <span className="text-gray-800">{exp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tell us a bit more (optional)
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.workedWithCustomers}
                        onChange={(e) => setFormData({ ...formData, workedWithCustomers: e.target.checked })}
                        className="w-5 h-5 text-teal-600 rounded"
                      />
                      <span className="text-gray-700">Worked with customers directly</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.ownsTools}
                        onChange={(e) => setFormData({ ...formData, ownsTools: e.target.checked })}
                        className="w-5 h-5 text-teal-600 rounded"
                      />
                      <span className="text-gray-700">I have my own tools/equipment</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasMentor}
                        onChange={(e) => setFormData({ ...formData, hasMentor: e.target.checked })}
                        className="w-5 h-5 text-teal-600 rounded"
                      />
                      <span className="text-gray-700">Worked under a mentor/apprenticeship</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Work Preferences */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What type of work are you looking for?
                  </label>
                  <div className="space-y-3">
                    {workPreferences.map((pref) => {
                      const Icon = pref.icon
                      return (
                        <button
                          key={pref.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, workPreference: pref.value })}
                          className={`
                            w-full p-4 rounded-xl border-2 text-left transition-all
                            ${formData.workPreference === pref.value
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300'}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={formData.workPreference === pref.value ? 'text-teal-600' : 'text-gray-500'}>
                              <Icon />
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{pref.label}</div>
                              <div className="text-sm text-gray-500">{pref.description}</div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Optional Showcase */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CameraIcon />
                    <span className="font-medium text-gray-800">Show your work (optional)</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Show some of your work if you'd like. It helps clusters find you.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tell us about your work
                  </label>
                  <textarea
                    rows="3"
                    value={formData.workDescription}
                    onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                    placeholder="e.g., I specialize in custom-made dresses and wedding gowns..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add photos (optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                    <input type="file" multiple accept="image/*" className="hidden" id="photoUpload" />
                    <label htmlFor="photoUpload" className="cursor-pointer block">
                      <UploadIcon />
                      <span className="text-teal-600 font-medium">Upload photos</span>
                      <p className="text-xs text-gray-500 mt-1">Show your best work</p>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <ChevronLeftIcon />
                  Back
                </button>
              )}
              
              {currentStep < 6 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`
                    flex-1 px-4 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2
                    ${canProceed() 
                      ? 'bg-teal-600 text-white hover:bg-teal-700' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                  `}
                >
                  Continue
                  <ChevronRightIcon />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon />
                      Complete Profile
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Helper Text */}
            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
              <ShieldIcon />
              You can always update your profile later
            </p>
          </div>
        </motion.div>

        {/* Trust Message */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <HeartIcon />
            Your information is secure and only shared with trusted clusters
            <HeartIcon />
          </p>
        </div>
      </div>
    </div>
  )
}

export default CreateJobProfile