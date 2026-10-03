import { NavLink } from 'react-router-dom';

function Sidebar() {
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
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/submit">Submit Claim</NavLink>
        <NavLink to="/policies">Policies</NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
