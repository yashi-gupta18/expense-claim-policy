import { useEffect, useMemo, useState } from 'react';
import { getClaims } from '../api/claimsApi';
import ClaimTable from '../components/ClaimTable';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import SummaryCard from '../components/SummaryCard';
import { CLAIM_STATUSES } from '../utils/constants';

function Dashboard() {
  const [claims, setClaims] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getClaims({ status: status || undefined, search: search || undefined })
      .then(setClaims)
      .catch((err) => setError(err.response?.data?.message || 'Unable to load claims.'))
      .finally(() => setLoading(false));
  }, [status, search]);

  const counts = useMemo(() => {
    return claims.reduce(
      (acc, claim) => {
        acc.total += 1;
        acc[claim.status] = (acc[claim.status] || 0) + 1;
        return acc;
      },
      { total: 0 }
    );
  }, [claims]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="page-stack">
      <section className="summary-grid">
        <SummaryCard label="Total claims" value={counts.total} />
        <SummaryCard label="Pending" value={counts.pending || 0} tone="warning" />
        <SummaryCard label="Approved" value={counts.approved || 0} tone="success" />
        <SummaryCard label="Rejected" value={counts.rejected || 0} tone="danger" />
        <SummaryCard label="Uncertain" value={counts.uncertain || 0} tone="info" />
        <SummaryCard label="Needs clarification" value={counts.needs_clarification || 0} tone="warning" />
      </section>
      <section className="panel">
        <div className="filters">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search claimant, category, description" />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {CLAIM_STATUSES.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}
          </select>
        </div>
        {claims.length ? <ClaimTable claims={claims} /> : <EmptyState message="No claims match the current filters." />}
      </section>
    </div>
  );
}

export default Dashboard;
