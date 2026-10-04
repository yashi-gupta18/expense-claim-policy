import { useEffect, useMemo, useState } from 'react';
import { getClaims } from '../api/claimsApi';
import ClaimTable from '../components/ClaimTable';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import SummaryCard from '../components/SummaryCard';
import { REVIEWER_STATUSES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

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

  const totals = useMemo(() => {
    return claims.reduce(
      (acc, claim) => {
        const amount = Number(claim.amount) || 0;
        const currency = claim.currency || 'INR';
        acc.totalAmount += amount;
        acc.currencies.add(currency);
        const claimant = claim.claimantName || claim.claimant || 'Unknown';
        acc.byClaimant[claimant] = (acc.byClaimant[claimant] || 0) + amount;
        acc.byCategory[claim.category] = (acc.byCategory[claim.category] || 0) + amount;
        return acc;
      },
      { totalAmount: 0, currencies: new Set(), byClaimant: {}, byCategory: {} }
    );
  }, [claims]);

  const formatTotal = (value) => {
    const currency = totals.currencies.size === 1 ? Array.from(totals.currencies)[0] : 'INR';
    return totals.currencies.size <= 1 ? formatCurrency(value, currency) : value.toLocaleString('en-IN');
  };

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
        <SummaryCard label={totals.currencies.size > 1 ? 'Total amount' : 'Total value'} value={formatTotal(totals.totalAmount)} tone="info" />
      </section>
      <section className="totals-grid">
        <div className="panel totals-panel">
          <h2>Totals by Claimant</h2>
          {Object.entries(totals.byClaimant).length ? Object.entries(totals.byClaimant).map(([name, amount]) => (
            <div className="total-row" key={name}>
              <span>{name}</span>
              <strong>{formatTotal(amount)}</strong>
            </div>
          )) : <p className="muted-copy">No claimant totals yet.</p>}
        </div>
        <div className="panel totals-panel">
          <h2>Totals by Category</h2>
          {Object.entries(totals.byCategory).length ? Object.entries(totals.byCategory).map(([category, amount]) => (
            <div className="total-row" key={category}>
              <span>{category}</span>
              <strong>{formatTotal(amount)}</strong>
            </div>
          )) : <p className="muted-copy">No category totals yet.</p>}
        </div>
      </section>
      <section className="panel">
        <div className="filters">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search claimant, category, description" />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {REVIEWER_STATUSES.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}
          </select>
        </div>
        {claims.length ? <ClaimTable claims={claims} linkBase="/reviewer/claims" /> : <EmptyState message="No claims match the current filters." />}
      </section>
    </div>
  );
}

export default Dashboard;
