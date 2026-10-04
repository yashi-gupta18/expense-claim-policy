import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveMockSession } from '../utils/mockSession';

function RoleSelection() {
  const navigate = useNavigate();
  const [role, setRole] = useState('claimant');
  const [name, setName] = useState('');

  const continueAs = (selectedRole) => {
    setRole(selectedRole);
  };

  const submit = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    saveMockSession({ role, name: trimmedName });
    navigate(role === 'claimant' ? '/claimant/dashboard' : '/reviewer/dashboard', {
      state: { toast: `Signed in as ${trimmedName}.` }
    });
  };

  return (
    <div className="page-stack">
      <section className="role-intro">
        <h2>Expense Claim Policy Review Assistant</h2>
        <p>Select a mock role and enter your name to continue.</p>
      </section>
      <form className="role-login" onSubmit={submit}>
        <div className="role-grid">
          <button type="button" className={`role-card claimant-card ${role === 'claimant' ? 'selected' : ''}`} onClick={() => continueAs('claimant')}>
            <span>Continue as</span>
            <strong>Claimant</strong>
            <p>Submit expenses, track status, and respond to clarification requests.</p>
          </button>
          <button type="button" className={`role-card reviewer-card ${role === 'reviewer' ? 'selected' : ''}`} onClick={() => continueAs('reviewer')}>
            <span>Continue as</span>
            <strong>Reviewer</strong>
            <p>Review all claims, inspect AI evidence, and make final decisions.</p>
          </button>
        </div>
        <section className="form-card role-name-card">
          <label>
            {role === 'claimant' ? 'Claimant name' : 'Reviewer name'}
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={role === 'claimant' ? 'Yashi Gupta' : 'Finance Reviewer'}
              autoFocus
            />
          </label>
          <button className="btn btn-primary" disabled={!name.trim()}>
            Continue as {role === 'claimant' ? 'Claimant' : 'Reviewer'}
          </button>
        </section>
      </form>
    </div>
  );
}

export default RoleSelection;
