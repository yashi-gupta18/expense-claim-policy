import { Navigate } from 'react-router-dom';
import { getMockSession } from '../utils/mockSession';

function ProtectedRoute({ role, children }) {
  const session = getMockSession();

  if (!session) return <Navigate to="/" replace />;
  if (session.role !== role) {
    return <Navigate to={session.role === 'claimant' ? '/claimant/dashboard' : '/reviewer/dashboard'} replace />;
  }

  return children;
}

export default ProtectedRoute;
