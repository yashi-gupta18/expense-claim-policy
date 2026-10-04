import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClaims } from '../api/claimsApi';
import ClaimTable from '../components/ClaimTable';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import SummaryCard from '../components/SummaryCard';
import { getMockSession } from '../utils/mockSession';

function ClaimantDashboard() {
  const session = getMockSession();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getClaims({ claimant: session?.name })
      .then(setClaims)
      .catch((err) => setError(err.response?.data?.message || 'Unable to load your claims.'))
      .finally(() => setLoading(false));
  }, [session?.name]);

  const counts = useMemo(() => {
    return claims.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      acc.total += 1;
      return acc;
    }, { total: 0 });
  }, [claims]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="page-stack claimant-space">
      <div className="section-heading">
        <div>
          <h2>My Claims</h2>
          <p className="muted-copy">Signed in as {session?.name}</p>
        </div>
        <Link className="btn btn-primary" to="/claimant/submit">Submit claim</Link>
      </div>
      <section className="summary-grid claimant-summary">
        <SummaryCard label="Submitted" value={counts.total} />
        <SummaryCard label="Pending" value={counts.pending || 0} tone="warning" />
        <SummaryCard label="Needs clarification" value={counts.needs_clarification || 0} tone="warning" />
        <SummaryCard label="Approved" value={counts.approved || 0} tone="success" />
        <SummaryCard label="Rejected" value={counts.rejected || 0} tone="danger" />
      </section>
      <section className="panel">
        {claims.length ? (
          <ClaimTable claims={claims} linkBase="/claimant/claims" showAiAction={false} actionLabel="View" />
        ) : (
          <EmptyState message="You have not submitted any claims yet." />
        )}
      </section>
    </div>
  );
}

export default ClaimantDashboard;
