import { Routes, Route } from 'react-router-dom'
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

function App() {
  return (
    <Routes>
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
  )
}

export default App