import { useEffect, useState } from 'react';
import { createPolicy, deletePolicy, getPolicies, updatePolicy } from '../api/policiesApi';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { CATEGORIES } from '../utils/constants';
import { formatDate } from '../utils/formatters';

const blankPolicy = {
  title: '',
  category: 'Meals',
  description: '',
  maxAmount: 0,
  receiptRequired: true,
  allowedCurrencies: 'INR',
  effectiveFrom: new Date().toISOString().slice(0, 10),
  evidenceText: '',
  isActive: true
};

function PolicyManagement() {
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState(blankPolicy);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => getPolicies().then(setPolicies);

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Unable to load policies.')).finally(() => setLoading(false));
  }, []);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const payload = () => ({ ...form, allowedCurrencies: form.allowedCurrencies.split(',').map((item) => item.trim()).filter(Boolean) });

  const save = async (event) => {
    event.preventDefault();
    if (editingId) await updatePolicy(editingId, payload());
    else await createPolicy(payload());
    setForm(blankPolicy);
    setEditingId('');
    await load();
  };

  const edit = (policy) => {
    setEditingId(policy._id);
    setForm({ ...policy, effectiveFrom: policy.effectiveFrom?.slice(0, 10), allowedCurrencies: policy.allowedCurrencies.join(', ') });
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="page-stack">
      <section className="form-card">
        <h2>{editingId ? 'Edit Policy' : 'Create Policy'}</h2>
        <form className="claim-form" onSubmit={save}>
          <label>Title<input value={form.title} onChange={(event) => setField('title', event.target.value)} required /></label>
          <label>Category<select value={form.category} onChange={(event) => setField('category', event.target.value)}>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Max amount<input type="number" value={form.maxAmount} onChange={(event) => setField('maxAmount', event.target.value)} /></label>
          <label>Allowed currencies<input value={form.allowedCurrencies} onChange={(event) => setField('allowedCurrencies', event.target.value)} /></label>
          <label>Effective from<input type="date" value={form.effectiveFrom} onChange={(event) => setField('effectiveFrom', event.target.value)} /></label>
          <label className="checkbox-row"><input type="checkbox" checked={form.receiptRequired} onChange={(event) => setField('receiptRequired', event.target.checked)} /> Receipt required</label>
          <label className="wide">Description<textarea value={form.description} onChange={(event) => setField('description', event.target.value)} required /></label>
          <label className="wide">Evidence text<textarea value={form.evidenceText} onChange={(event) => setField('evidenceText', event.target.value)} required /></label>
          <button className="btn btn-primary">{editingId ? 'Update policy' : 'Create policy'}</button>
        </form>
      </section>
      <section className="panel">
        {policies.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Category</th><th>Limit</th><th>Receipt</th><th>Effective</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy._id}>
                    <td>{policy.title}</td>
                    <td>{policy.category}</td>
                    <td>{policy.maxAmount}</td>
                    <td>{policy.receiptRequired ? 'Required' : 'Optional'}</td>
                    <td>{formatDate(policy.effectiveFrom)}</td>
                    <td>{policy.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="table-actions">
                      <button className="link-button" onClick={() => edit(policy)}>Edit</button>
                      <button className="link-button danger-text" onClick={() => deletePolicy(policy._id).then(load)}>Deactivate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState message="No policies created yet." />}
      </section>
    </div>
  );
}

export default PolicyManagement;
