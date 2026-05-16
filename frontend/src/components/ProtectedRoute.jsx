import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const storedUser = sessionStorage.getItem('kluster_user')
  
  if (!storedUser) {
    return <Navigate to="/login" replace />
  }
  
  const user = JSON.parse(storedUser)
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  
  return children
}

export default ProtectedRoute