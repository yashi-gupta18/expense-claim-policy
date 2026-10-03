function SummaryCard({ label, value, tone = 'default' }) {
  return (
    <section className={`summary-card summary-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

export default SummaryCard;
