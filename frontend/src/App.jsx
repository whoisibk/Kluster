import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Home from './pages/Home'
import Login from './pages/Login'
import LeaderSignup from './pages/LeaderSignup'
import MemberSignup from './pages/MemberSignup'
import MemberProfile from './pages/MemberProfile'
import ClusterDashboard from './pages/ClusterDashboard'
import DemandSignals from './pages/DemandSignals'
import CreateJobProfile from './pages/CreateJobProfile'
import JobSeekerDashboard from './pages/JobSeekerDashboard'
import JobSeekerProfile from './pages/JobSeekerProfile'

const variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
}

function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/leader-signup" element={<LeaderSignup />} />
          <Route path="/member-signup" element={<MemberSignup />} />
          <Route path="/member/:id" element={<MemberProfile />} />
          <Route path="/dashboard/cluster" element={<ClusterDashboard />} />
          <Route path="/demand-signals" element={<DemandSignals />} />
          <Route path="/create-profile" element={<CreateJobProfile />} />
          <Route path="/dashboard/job-seeker" element={<JobSeekerDashboard />} />
          <Route path="/job-seeker/:id" element={<JobSeekerProfile />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default App