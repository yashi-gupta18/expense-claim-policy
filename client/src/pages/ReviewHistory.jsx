import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getClaimReviews } from '../api/reviewsApi';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { formatDateTime } from '../utils/formatters';

function ReviewHistory() {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getClaimReviews(id).then(setReviews).catch((err) => setError(err.response?.data?.message || 'Unable to load history.')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Review History</h2>
        <Link className="table-link" to={`/reviewer/claims/${id}`}>Back to claim</Link>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Action</th><th>Previous</th><th>New</th><th>Reviewer</th><th>Reason</th><th>Time</th></tr></thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review._id}>
                <td>{review.action.replaceAll('_', ' ')}</td>
                <td>{review.previousStatus}</td>
                <td>{review.newStatus}</td>
                <td>{review.reviewer}</td>
                <td>{review.reason}</td>
                <td>{formatDateTime(review.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!reviews.length && <p>No reviewer actions yet.</p>}
    </section>
  );
}

export default ReviewHistory;
