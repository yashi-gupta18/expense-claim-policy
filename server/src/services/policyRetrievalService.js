import Policy from '../models/Policy.js';

function tokenize(value = '') {
  return value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

export async function retrieveRelevantPolicies(claim) {
  const policies = await Policy.find({ isActive: true }).sort({ effectiveFrom: -1 });
  const claimTokens = new Set(tokenize(`${claim.category} ${claim.description}`));

  return policies
    .map((policy) => {
      const text = `${policy.category} ${policy.title} ${policy.description} ${policy.evidenceText}`;
      const score = tokenize(text).reduce((total, token) => total + (claimTokens.has(token) ? 1 : 0), 0);
      const categoryMatch = policy.category.toLowerCase() === claim.category.toLowerCase() ? 5 : 0;
      return { policy, score: score + categoryMatch };
    })
    .filter((item) => item.score > 0 || item.policy.category.toLowerCase() === claim.category.toLowerCase())
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.policy);
}
