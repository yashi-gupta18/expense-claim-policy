import Policy from '../models/Policy.js';

function tokenize(value = '') {
  return value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

export async function retrieveRelevantPolicies(claim) {
  const policies = await Policy.find({ isActive: true }).sort({ effectiveFrom: -1 });
  const classification = claim.aiReview?.classification || claim.classification || '';
  const claimTokens = new Set(tokenize(`${claim.category} ${classification} ${claim.description}`));

  return policies
    .map((policy) => {
      const text = `${policy.category} ${policy.title} ${policy.description} ${policy.evidenceText}`;
      const score = tokenize(text).reduce((total, token) => total + (claimTokens.has(token) ? 1 : 0), 0);
      const categoryMatch = policy.category.toLowerCase() === claim.category.toLowerCase() ? 5 : 0;
      const classificationMatch = classification && policy.category.toLowerCase() === classification.toLowerCase() ? 4 : 0;
      return { policy, score: score + categoryMatch + classificationMatch };
    })
    .filter((item) => item.score > 0 || item.policy.category.toLowerCase() === claim.category.toLowerCase() || (classification && item.policy.category.toLowerCase() === classification.toLowerCase()))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.policy);
}
