import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { decideClaim, getClaim, getClaimAudit, reviewClaimAi } from '../api/claimsApi';
import { getClaimReviews } from '../api/reviewsApi';
import AiReviewPanel from '../components/AiReviewPanel';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import PolicyEvidence from '../components/PolicyEvidence';
import ReviewActions from '../components/ReviewActions';
import StatusBadge from '../components/StatusBadge';
import ValidationIssues from '../components/ValidationIssues';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

function ClaimDetail() {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const [claimData, reviewsData, auditData] = await Promise.all([getClaim(id), getClaimReviews(id), getClaimAudit(id)]);
    setClaim(claimData);
    setReviews(reviewsData);
    setAudit(auditData);
  };

  useEffect(() => {
    setLoading(true);
    load().catch((err) => setError(err.response?.data?.message || 'Unable to load claim.')).finally(() => setLoading(false));
  }, [id]);

  const refreshAi = async () => {
    setBusy(true);
    try {
      setClaim(await reviewClaimAi(id));
      await load();
    } finally {
      setBusy(false);
    }
  };

  const submitDecision = async (payload) => {
    if (!payload.reason) {
      window.alert('Please enter a decision reason.');
      return;
    }
    setBusy(true);
    try {
      setClaim(await decideClaim(id, payload));
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!claim) return <ErrorState message="Claim not found." />;

  return (
    <div className="detail-layout">
      <section className="detail-card claim-overview">
        <div className="section-heading">
          <h2>{claim.claimant}</h2>
          <StatusBadge status={claim.status} />
        </div>
        <dl className="claim-facts">
          <div><dt>Date</dt><dd>{formatDate(claim.date)}</dd></div>
          <div><dt>Category</dt><dd>{claim.category}</dd></div>
          <div><dt>Amount</dt><dd>{formatCurrency(claim.amount, claim.currency)}</dd></div>
          <div><dt>Receipt</dt><dd>{claim.receiptAvailable ? 'Available' : 'Missing'}</dd></div>
        </dl>
        <p>{claim.description}</p>
        <Link className="table-link" to={`/claims/${id}/history`}>View full review history</Link>
      </section>
      <AiReviewPanel review={claim.aiReview} onRefresh={refreshAi} refreshing={busy} />
      <ValidationIssues issues={claim.deterministicIssues} />
      <PolicyEvidence evidence={claim.aiReview?.policyEvidence} missing={claim.aiReview?.missingInformation} />
      <ReviewActions onDecision={submitDecision} busy={busy} />
      <section className="detail-card">
        <h2>Decision History</h2>
        {reviews.length ? reviews.map((review) => (
          <div className="timeline-item" key={review._id}>
            <strong>{review.action.replaceAll('_', ' ')}</strong>
            <span>{review.previousStatus} to {review.newStatus} by {review.reviewer}</span>
            <p>{review.reason}</p>
            <small>{formatDateTime(review.createdAt)}</small>
          </div>
        )) : <p>No human decisions yet.</p>}
      </section>
      <section className="detail-card">
        <h2>Audit Log</h2>
        {audit.map((item) => (
          <div className="timeline-item" key={item._id}>
            <strong>{item.action}</strong>
            <span>{item.message}</span>
            <small>{formatDateTime(item.createdAt)}</small>
          </div>
        ))}
      </section>
    </div>
  );
}

export default ClaimDetail;
