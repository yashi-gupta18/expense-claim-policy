import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import ClaimantClaimDetail from './pages/ClaimantClaimDetail';
import ClaimantDashboard from './pages/ClaimantDashboard';
import Dashboard from './pages/Dashboard';
import RoleSelection from './pages/RoleSelection';
import SubmitClaim from './pages/SubmitClaim';
import ClaimDetail from './pages/ClaimDetail';
import PolicyManagement from './pages/PolicyManagement';
import ReviewerHistory from './pages/ReviewerHistory';
import ReviewHistory from './pages/ReviewHistory';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (location.state?.toast) {
      setToast(location.state.toast);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-panel">
        <Header />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<RoleSelection />} />
            <Route path="/claimant/dashboard" element={<ProtectedRoute role="claimant"><ClaimantDashboard /></ProtectedRoute>} />
            <Route path="/claimant/submit" element={<ProtectedRoute role="claimant"><SubmitClaim /></ProtectedRoute>} />
            <Route path="/claimant/claims/:id" element={<ProtectedRoute role="claimant"><ClaimantClaimDetail /></ProtectedRoute>} />
            <Route path="/reviewer/dashboard" element={<ProtectedRoute role="reviewer"><Dashboard /></ProtectedRoute>} />
            <Route path="/reviewer/claims/:id" element={<ProtectedRoute role="reviewer"><ClaimDetail /></ProtectedRoute>} />
            <Route path="/reviewer/claims/:id/history" element={<ProtectedRoute role="reviewer"><ReviewHistory /></ProtectedRoute>} />
            <Route path="/reviewer/policies" element={<ProtectedRoute role="reviewer"><PolicyManagement /></ProtectedRoute>} />
            <Route path="/reviewer/history" element={<ProtectedRoute role="reviewer"><ReviewerHistory /></ProtectedRoute>} />
            <Route
              path="*"
              element={
                <div className="empty-state">
                  <h2>Page not found</h2>
                  <NavLink className="btn btn-primary" to="/">Choose role</NavLink>
                </div>
              }
            />
          </Routes>
        </div>
      </main>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}

export default App;
