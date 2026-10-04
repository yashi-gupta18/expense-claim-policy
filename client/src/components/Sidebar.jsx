import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clearMockSession } from '../utils/mockSession';

function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isReviewer = pathname.startsWith('/reviewer');
  const isClaimant = pathname.startsWith('/claimant');
  const switchUser = () => {
    clearMockSession();
    navigate('/', { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">EC</span>
        <div>
          <strong>Expense Review</strong>
          <small>Policy Assistant</small>
        </div>
      </div>
      <nav className="sidebar-nav">
        {!isReviewer && !isClaimant && <NavLink to="/" end>Choose Role</NavLink>}
        {isClaimant && (
          <>
            <NavLink to="/claimant/dashboard">My Claims</NavLink>
            <NavLink to="/claimant/submit">Submit Claim</NavLink>
            <button className="sidebar-button" onClick={switchUser}>Switch User</button>
          </>
        )}
        {isReviewer && (
          <>
            <NavLink to="/reviewer/dashboard">Reviewer Dashboard</NavLink>
            <NavLink to="/reviewer/policies">Policies</NavLink>
            <NavLink to="/reviewer/history">History</NavLink>
            <button className="sidebar-button" onClick={switchUser}>Switch User</button>
          </>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
