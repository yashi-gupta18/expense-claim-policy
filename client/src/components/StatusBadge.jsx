import { humanize } from '../utils/formatters';

function StatusBadge({ status }) {
  return <span className={`status-badge status-${status || 'pending'}`}>{humanize(status || 'pending')}</span>;
}

export default StatusBadge;
