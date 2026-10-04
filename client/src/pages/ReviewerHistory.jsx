import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClaims } from '../api/claimsApi';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime } from '../utils/formatters';

function ReviewerHistory() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getClaims()
      .then(setClaims)
      .catch((err) => setError(err.response?.data?.message || 'Unable to load reviewer history.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Reviewer History</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Claimant</th>
              <th>Status</th>
              <th>Reviewer</th>
              <th>Reviewer message</th>
              <th>Reviewed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim._id}>
                <td>{claim.claimantName || claim.claimant}</td>
                <td><StatusBadge status={claim.status} /></td>
                <td>{claim.reviewedBy || claim.reviewer || '-'}</td>
                <td>{claim.finalDecisionReason || claim.clarificationRequest || '-'}</td>
                <td>{claim.reviewedAt ? formatDateTime(claim.reviewedAt) : '-'}</td>
                <td><Link className="table-link" to={`/reviewer/claims/${claim._id}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ReviewerHistory;
