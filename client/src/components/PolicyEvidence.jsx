function PolicyEvidence({ evidence = [], missing = [] }) {
  return (
    <section className="detail-card">
      <h2>Policy Evidence</h2>
      {evidence.length ? (
        <ul className="evidence-list">
          {evidence.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
        </ul>
      ) : (
        <p>No policy evidence returned.</p>
      )}
      <h3>Missing information</h3>
      {missing.length ? (
        <ul className="evidence-list">
          {missing.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
        </ul>
      ) : (
        <p>None reported.</p>
      )}
    </section>
  );
}

export default PolicyEvidence;
