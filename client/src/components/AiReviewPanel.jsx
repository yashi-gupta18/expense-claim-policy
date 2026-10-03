import StatusBadge from './StatusBadge';

function AiReviewPanel({ review, onRefresh, refreshing }) {
  if (!review) return null;
  return (
    <section className="detail-card ai-panel">
      <div className="section-heading">
        <h2>AI Review</h2>
        <button className="btn btn-secondary" onClick={onRefresh} disabled={refreshing}>{refreshing ? 'Reviewing...' : 'Refresh AI'}</button>
      </div>
      <div className="ai-grid">
        <div>
          <span>Classification</span>
          <strong>{review.classification}</strong>
        </div>
        <div>
          <span>Status</span>
          <StatusBadge status={review.status} />
        </div>
        <div>
          <span>Confidence</span>
          <strong>{Math.round((review.confidence || 0) * 100)}%</strong>
        </div>
        <div>
          <span>Recommended action</span>
          <strong>{review.recommendedAction?.replaceAll('_', ' ')}</strong>
        </div>
        <div>
          <span>AI Provider</span>
          <strong>{review.provider || (review.isMock ? 'mock' : 'openai')}</strong>
        </div>
        <div>
          <span>Model</span>
          <strong>{review.model || '-'}</strong>
        </div>
        <div>
          <span>Fallback</span>
          <strong>{review.isFallback || review.isMock ? 'Yes' : 'No'}</strong>
        </div>
      </div>
      {(review.isFallback || review.isMock) && <p className="mock-note">Fallback result: check AI_PROVIDER and provider availability for live AI review.</p>}
      <p className="reasoning">{review.reasoning}</p>
    </section>
  );
}

export default AiReviewPanel;
