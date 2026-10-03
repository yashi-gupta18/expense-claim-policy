import Claim from '../models/Claim.js';

function addIssue(issues, type, severity, message, field, evidence) {
  issues.push({ type, severity, message, field, evidence });
}

export async function runDeterministicValidation(claimInput, policies = [], existingClaimId = null) {
  const issues = [];
  const claimDate = new Date(claimInput.date);

  if (!claimInput.claimant) addIssue(issues, 'missing_required_field', 'high', 'Claimant is required.', 'claimant', 'No claimant value was provided.');
  if (!claimInput.category) addIssue(issues, 'missing_category', 'high', 'Category is required.', 'category', 'Claims must map to a policy category.');
  if (!claimInput.description) addIssue(issues, 'missing_required_field', 'medium', 'Description is required.', 'description', 'Policy review needs claim context.');
  if (Number.isNaN(claimDate.getTime())) addIssue(issues, 'invalid_date', 'high', 'Claim date is invalid.', 'date', String(claimInput.date));
  if (claimDate > new Date()) addIssue(issues, 'future_date', 'high', 'Claim date cannot be in the future.', 'date', claimDate.toISOString());
  if (!Number.isFinite(Number(claimInput.amount)) || Number(claimInput.amount) <= 0) {
    addIssue(issues, 'invalid_amount', 'high', 'Amount must be a positive number.', 'amount', String(claimInput.amount));
  }

  const categoryPolicy = policies.find((policy) => policy.category.toLowerCase() === String(claimInput.category || '').toLowerCase()) || policies[0];
  if (categoryPolicy) {
    if (categoryPolicy.receiptRequired && !claimInput.receiptAvailable) {
      addIssue(issues, 'missing_receipt', 'high', 'Receipt is required by policy but not available.', 'receiptAvailable', categoryPolicy.evidenceText);
    }
    if (Number(claimInput.amount) > categoryPolicy.maxAmount) {
      addIssue(issues, 'amount_over_limit', 'high', `Amount exceeds the ${categoryPolicy.category} limit of ${categoryPolicy.maxAmount}.`, 'amount', categoryPolicy.evidenceText);
    }
    if (!categoryPolicy.allowedCurrencies.includes(String(claimInput.currency || '').toUpperCase())) {
      addIssue(issues, 'unsupported_currency', 'medium', 'Currency is not supported by the matching policy.', 'currency', `Allowed: ${categoryPolicy.allowedCurrencies.join(', ')}`);
    }
  }

  if (claimInput.claimant && claimInput.category && claimInput.amount && !Number.isNaN(claimDate.getTime())) {
    const duplicateQuery = {
      claimant: claimInput.claimant,
      date: claimDate,
      amount: Number(claimInput.amount),
      category: claimInput.category
    };
    if (existingClaimId) duplicateQuery._id = { $ne: existingClaimId };
    const duplicate = await Claim.findOne(duplicateQuery);
    if (duplicate) {
      addIssue(issues, 'duplicate_claim', 'high', 'Possible duplicate claim found for claimant, date, amount, and category.', 'claim', `Duplicate claim id: ${duplicate._id}`);
    }
  }

  return issues;
}
