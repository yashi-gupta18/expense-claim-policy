import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getClaim, submitClarification } from '../api/claimsApi';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getMockSession } from '../utils/mockSession';

function claimantMessage(claim) {
  if (claim.status === 'needs_clarification') return `Clarification requested: ${claim.clarificationRequest || claim.finalDecisionReason || 'Please provide more information.'}`;
  if (claim.status === 'approved') return 'Your claim was approved.';
  if (claim.status === 'rejected') return 'Your claim was rejected.';
  if (claim.status === 'under_review') return 'Your clarification was received and your claim is under review.';
  return 'Your claim is under review.';
}

function ClaimantClaimDetail() {
  const { id } = useParams();
  const session = getMockSession();
  const [claim, setClaim] = useState(null);
  const [response, setResponse] = useState('');
  const [proofLink, setProofLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getClaim(id)
      .then((data) => {
        const owner = (data.claimantName || data.claimant || '').toLowerCase();
        if (owner !== (session?.name || '').toLowerCase()) {
          setError('You do not have access to this claim.');
          return;
        }
        setClaim(data);
        setResponse(data.clarificationResponse || '');
        setProofLink(data.clarificationProofLink || '');
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load claim.'))
      .finally(() => setLoading(false));
  }, [id]);

  const saveClarification = async () => {
    if (!response.trim()) return;
    setSaving(true);
    try {
      setClaim(await submitClarification(id, { clarificationResponse: response, clarificationProofLink: proofLink, claimant: session?.name }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!claim) return <ErrorState message="Claim not found." />;

  return (
    <div className="detail-layout claimant-detail">
      <section className="detail-card claim-overview">
        <div className="section-heading">
          <h2>Claim Status</h2>
          <StatusBadge status={claim.status} />
        </div>
        <p className="claimant-message">{claimantMessage(claim)}</p>
        <dl className="claim-facts">
          <div><dt>Claimant</dt><dd>{claim.claimantName || claim.claimant}</dd></div>
          <div><dt>Date</dt><dd>{formatDate(claim.date)}</dd></div>
          <div><dt>Category</dt><dd>{claim.category}</dd></div>
          <div><dt>Amount</dt><dd>{formatCurrency(claim.amount, claim.currency)}</dd></div>
          <div><dt>Currency</dt><dd>{claim.currency}</dd></div>
          <div><dt>Receipt</dt><dd>{claim.receiptAvailable ? 'Available' : 'Missing'}</dd></div>
        </dl>
        <h3>Description</h3>
        <p>{claim.description}</p>
        {claim.finalDecision && (
          <>
            <h3>Final Decision</h3>
            <p>{claim.finalDecision}</p>
          </>
        )}
        {claim.finalDecisionReason && (
          <>
            <h3>Reviewer Message</h3>
            <p>{claim.finalDecisionReason}</p>
          </>
        )}
        <Link className="table-link" to="/claimant/dashboard">Back to my claims</Link>
      </section>
      {claim.status === 'needs_clarification' && (
        <section className="detail-card">
          <h2>Respond to Clarification</h2>
          <p>{claim.clarificationRequest}</p>
          <label>
            Your response
            <textarea value={response} onChange={(event) => setResponse(event.target.value)} />
          </label>
          <label>
            Optional proof link
            <input value={proofLink} onChange={(event) => setProofLink(event.target.value)} placeholder="https://..." />
          </label>
          <button className="btn btn-primary" disabled={saving || !response.trim()} onClick={saveClarification}>
            {saving ? 'Submitting...' : 'Submit clarification'}
          </button>
        </section>
      )}
      {claim.clarificationResponse && claim.status !== 'needs_clarification' && (
        <section className="detail-card">
          <h2>Your Clarification</h2>
          <p>{claim.clarificationResponse}</p>
          {claim.clarificationProofLink && <a className="table-link" href={claim.clarificationProofLink} target="_blank" rel="noreferrer">View proof link</a>}
        </section>
      )}
    </div>
  );
}

export default ClaimantClaimDetail;
