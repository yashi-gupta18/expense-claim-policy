import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import SubmitClaim from './pages/SubmitClaim';
import ClaimDetail from './pages/ClaimDetail';
import PolicyManagement from './pages/PolicyManagement';
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/submit" element={<SubmitClaim />} />
            <Route path="/claims/:id" element={<ClaimDetail />} />
            <Route path="/claims/:id/history" element={<ReviewHistory />} />
            <Route path="/policies" element={<PolicyManagement />} />
            <Route
              path="*"
              element={
                <div className="empty-state">
                  <h2>Page not found</h2>
                  <NavLink className="btn btn-primary" to="/">Back to dashboard</NavLink>
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
