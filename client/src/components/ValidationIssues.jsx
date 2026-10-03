function ValidationIssues({ issues = [] }) {
  return (
    <section className="detail-card warning-panel">
      <h2>Deterministic Validation</h2>
      {issues.length === 0 ? (
        <p>No deterministic issues found.</p>
      ) : (
        <ul className="issue-list">
          {issues.map((issue, index) => (
            <li key={`${issue.type}-${index}`} className={`issue-${issue.severity}`}>
              <strong>{issue.message}</strong>
              <span>{issue.field} - {issue.evidence}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ValidationIssues;
