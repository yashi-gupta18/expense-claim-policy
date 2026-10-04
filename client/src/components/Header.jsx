import { useLocation, useNavigate } from 'react-router-dom';
import { clearMockSession, getMockSession } from '../utils/mockSession';

function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const session = getMockSession();
  const role = pathname.startsWith('/reviewer') ? 'Reviewer' : pathname.startsWith('/claimant') ? 'Claimant' : 'Role Selection';
  const user = session?.name || 'Choose a role';

  const switchUser = () => {
    clearMockSession();
    navigate('/', { replace: true });
  };

  return (
    <header className="top-header">
      <div>
        <h1>Expense Claim Policy Review Assistant</h1>
        <p>{role === 'Reviewer' ? 'Operational review workspace' : role === 'Claimant' ? 'Employee claim submission and status tracking' : 'Choose how to continue'}</p>
      </div>
      <div className="header-actions">
        <div className="reviewer-chip">{role}: {user}</div>
        {session && <button className="btn btn-secondary" onClick={switchUser}>Switch User</button>}
      </div>
    </header>
  );
}

export default Header;
