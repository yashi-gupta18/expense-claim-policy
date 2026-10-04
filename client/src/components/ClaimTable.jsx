import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';

function ClaimTable({ claims, linkBase = '/reviewer/claims', showAiAction = true, actionLabel = 'Review' }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Claimant</th>
            <th>Date</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Status</th>
            {showAiAction && <th>AI action</th>}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => (
            <tr key={claim._id}>
              <td>{claim.claimant}</td>
              <td>{formatDate(claim.date)}</td>
              <td>{claim.category}</td>
              <td>{formatCurrency(claim.amount, claim.currency)}</td>
              <td><StatusBadge status={claim.status} /></td>
              {showAiAction && <td>{claim.aiReview?.recommendedAction?.replaceAll('_', ' ') || '-'}</td>}
              <td><Link className="table-link" to={`${linkBase}/${claim._id}`}>{actionLabel}</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClaimTable;
