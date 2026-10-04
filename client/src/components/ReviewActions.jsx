import { useState } from 'react';
import { getMockSession } from '../utils/mockSession';

function ReviewActions({ onDecision, busy }) {
  const [reason, setReason] = useState('');
  const [overrideClassification, setOverrideClassification] = useState('');
  const session = getMockSession();

  const submit = (action) => {
    onDecision({ action, reason, reviewer: session?.name || 'Reviewer', overrideClassification });
  };

  return (
    <section className="detail-card">
      <h2>Reviewer Decision</h2>
      <label>
        Decision reason
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Record the human review rationale" />
      </label>
      <label>
        Override classification
        <input value={overrideClassification} onChange={(event) => setOverrideClassification(event.target.value)} placeholder="Optional" />
      </label>
      <div className="action-row">
        <button className="btn btn-success" disabled={busy} onClick={() => submit('approve')}>Approve</button>
        <button className="btn btn-danger" disabled={busy} onClick={() => submit('reject')}>Reject</button>
        <button className="btn btn-warning" disabled={busy} onClick={() => submit('request_clarification')}>Request Clarification</button>
        <button className="btn btn-secondary" disabled={busy || !overrideClassification} onClick={() => submit('override_ai')}>Override AI</button>
      </div>
    </section>
  );
}

export default ReviewActions;
