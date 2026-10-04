import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createClaim } from '../api/claimsApi';
import { CATEGORIES, CURRENCIES } from '../utils/constants';
import { getMockSession, sessionIdFromName } from '../utils/mockSession';

function SubmitClaim() {
  const navigate = useNavigate();
  const session = getMockSession();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      claimant: session?.name || '',
      currency: 'INR',
      category: 'Meals',
      receiptAvailable: true
    }
  });
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const onSubmit = async (values) => {
    setSaving(true);
    setServerError('');
    try {
      await createClaim({
        ...values,
        claimantName: values.claimant,
        claimantId: sessionIdFromName(values.claimant)
      });
      navigate('/claimant/dashboard', { state: { toast: 'Claim submitted successfully and sent for review.' } });
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to submit claim.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="form-card">
      <h2>Submit Claim</h2>
      {serverError && <div className="form-error">{serverError}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="claim-form">
        <label>Claimant<input {...register('claimant', { required: true })} />{errors.claimant && <span>Required</span>}</label>
        <label>Date<input type="date" {...register('date', { required: true })} />{errors.date && <span>Required</span>}</label>
        <label>Category<select {...register('category')}>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Amount<input type="number" step="0.01" {...register('amount', { required: true, min: 1 })} />{errors.amount && <span>Enter a valid amount</span>}</label>
        <label>Currency<select {...register('currency')}>{CURRENCIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="wide">Description<textarea {...register('description', { required: true, minLength: 5 })} />{errors.description && <span>Required</span>}</label>
        <label className="checkbox-row"><input type="checkbox" {...register('receiptAvailable')} /> Receipt available</label>
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Submitting...' : 'Submit claim'}</button>
      </form>
    </section>
  );
}

export default SubmitClaim;
